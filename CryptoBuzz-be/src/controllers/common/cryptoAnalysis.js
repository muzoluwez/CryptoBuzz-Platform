import path from "path";
import fs from "fs";
import CryptoAnalysisModel from "../../models/cryptoAnalysis.js";
import { uploadImageToAzure, deleteImageFromAzure, uploadVideoToAzure, deleteVideoFromAzure } from "../../utils/azureUploader.js";
import * as Yup from "yup";
import Category from "../../models/category.js";
// import {
//   notifyUsersOnTradeAnalysis,
//   notifyFollowersOfEducator,
// } from "../../firebase/messaging.js";
import mongoose from "mongoose";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// Helper function to validate video URLs (YouTube, Vimeo, Loom)
const isValidVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
  const loomRegex = /^(https?:\/\/)?(www\.)?(loom\.com|loom\.share)\/.+/;
  
  return youtubeRegex.test(url) || vimeoRegex.test(url) || loomRegex.test(url);
};

// Validation schema
const createCryptoAnalysisSchema = Yup.object().shape({
  title: Yup.string().required("title is required"),
  createdBy: Yup.string().required("Educator ID is required"),
  description: Yup.string().required("Entry is required"),
  url: Yup.string().url("Please enter a valid URL").optional(),
  accessType: Yup.string().optional(),
  videoUrl: Yup.string().optional(), // For YouTube, Vimeo, Loom URLs
});

/* ================================
   📌 GET Crypto Analysis
================================ */
export const getCryptoAnalysis = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(400).json({ message: "User not found" });

    let filter = {};
    if (user.role == "educator") {
      filter = {
        createdBy: user?._id
      };
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const totalCount = await CryptoAnalysisModel.countDocuments(filter);
    const skip = (page - 1) * limit;

    if (skip >= totalCount) return res.status(400).json({ message: "No records found" });

    const records = await CryptoAnalysisModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "first_name last_name image")
      .populate("category", "_id name")
      .populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl")
      .lean();

    const formatted = records.map(data => ({
      _id: data._id,
      title: data.title,
      description: data.description,
      category: data.category,
      createdBy: data.createdBy,
      url: data.url,
      image: Array.isArray(data.photos) && data.photos.length > 0 
        ? data.photos[0] 
        : (Array.isArray(data.photos) ? null : data.photos),
      photos: Array.isArray(data.photos) ? data.photos : (data.photos ? [data.photos] : []),
      videoUrl: data.videoUrl || null,
      mediaType: data.mediaType || (data.videoUrl ? "video" : "image"),
      accessType: data.accessType,
      plans: data.plans || [] // Include populated plans
    }));

    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount
    };

    return res.status(200).json(GetApiResponse(200, formatted, pagination, "Records fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error?.errors || error.message
    });
  }
};

/* ================================
   📌 CREATE Crypto Analysis
================================ */
export const createCryptoAnalysis = async (req, res) => {
  try {
    await createCryptoAnalysisSchema.validate(req.body);

    const { title, description, createdBy, url, accessType, mediaType = "image", videoUrl: videoUrlInput } = req.body;

    // Handle plans array from FormData (can come as req.body['plans[]'] or req.body.plans)
    let plansArray = [];
    if (req.body['plans[]']) {
      // Multer sends arrays as 'plans[]'
      plansArray = Array.isArray(req.body['plans[]']) 
        ? req.body['plans[]'] 
        : [req.body['plans[]']];
    } else if (req.body.plans) {
      plansArray = Array.isArray(req.body.plans) ? req.body.plans : [req.body.plans];
    }
    
    // Filter and validate plan IDs
    const validPlans = plansArray
      .filter(p => p && p !== "null" && p !== "undefined" && /^[0-9a-fA-F]{24}$/.test(String(p)))
      .map(p => new mongoose.Types.ObjectId(p));

    // Get file from req.file (single upload) or req.files[0] (array upload for backward compatibility)
    const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    
    let imageUrls = [];
    let videoUrl = null;
    let finalMediaType = mediaType;

    // Handle video: either file upload OR external URL (YouTube, Vimeo, Loom)
    if (mediaType === 'video') {
      if (videoUrlInput && isValidVideoUrl(videoUrlInput)) {
        // External video URL (YouTube, Vimeo, Loom)
        videoUrl = videoUrlInput.trim();
        finalMediaType = 'video';
      } else if (file && file.mimetype.startsWith('video/')) {
        // Upload video file to Azure
        videoUrl = await uploadVideoToAzure(file.buffer, file.originalname, file.mimetype);
        finalMediaType = 'video';
      } else {
        return res.status(400).json({ 
          message: "For video media type, please provide either a video file upload or a valid YouTube, Vimeo, or Loom URL." 
        });
      }
    } else {
      // Image media type - requires file upload
      if (!file) {
        return res.status(400).json({ message: "Image file is required for image media type." });
      }
      if (!file.mimetype.startsWith('image/')) {
        return res.status(400).json({ message: "Invalid file type. Please upload an image file." });
      }
      // Upload image (single file now)
      const uploadedUrl = await uploadImageToAzure(file.buffer, file.originalname);
      imageUrls = [uploadedUrl];
      finalMediaType = 'image';
    }

    const cryptoCategory = await Category.findOne({
      name: { $regex: "^crypto$", $options: "i" }
    });

    const newCryptoAnalysis = await CryptoAnalysisModel.create({
      title,
      description,
      createdBy,
      category: cryptoCategory ? cryptoCategory._id : "",
      url,
      photos: imageUrls,
      videoUrl: videoUrl,
      mediaType: finalMediaType,
      accessType,
      // Only add plans if PRO tier and valid plans exist
      plans: accessType === "PRO" && validPlans.length > 0 ? validPlans : []
    });

    // Populate plans before returning
    await newCryptoAnalysis.populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl");

    // await notifyFollowersOfEducator(
    //   createdBy,
    //   "New IQ InCrypto Published📊",
    //   `Detailed analysis on ${newCryptoAnalysis.name} is live - ${title}`,
    //   {
    //     id: newCryptoAnalysis._id.toString(),
    //     category: newCryptoAnalysis.name,
    //     title: newCryptoAnalysis.title,
    //     screen: "IQCrypto",
    //     educatorId: createdBy,
    //     educatorName: "Admin",
    //   }
    // );
    return res.status(200).json(ApiResponse(200, newCryptoAnalysis, "Record inserted successfully"));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* ================================
   📌 UPDATE Crypto Analysis
================================ */
export const updateCryptoAnalysis = async (req, res) => {
  try {
    const { title, description, url, accessType, mediaType, videoUrl: videoUrlInput } = req.body;

    // Handle plans array from FormData (can come as req.body['plans[]'] or req.body.plans)
    let plansArray = [];
    if (req.body['plans[]']) {
      // Multer sends arrays as 'plans[]'
      plansArray = Array.isArray(req.body['plans[]']) 
        ? req.body['plans[]'] 
        : [req.body['plans[]']];
    } else if (req.body.plans) {
      plansArray = Array.isArray(req.body.plans) ? req.body.plans : [req.body.plans];
    }
    
    // Filter and validate plan IDs
    const validPlans = plansArray
      .filter(p => p && p !== "null" && p !== "undefined" && /^[0-9a-fA-F]{24}$/.test(String(p)))
      .map(p => new mongoose.Types.ObjectId(p));

    const record = await CryptoAnalysisModel.findById(req.params.id);
    if (!record) return res.status(404).json({ error: "Not found" });

    // Handle media update - support both req.file (single) and req.files (array for backward compatibility)
    const uploadedFile = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
    
    // Determine final media type
    let finalMediaType = mediaType || record.mediaType;
    
    if (uploadedFile) {
      // New file uploaded
      const detectedMediaType = uploadedFile.mimetype.startsWith('video/') ? 'video' : 'image';
      finalMediaType = mediaType === 'video' || detectedMediaType === 'video' ? 'video' : 'image';

      // Delete old media (only if it's an Azure-uploaded file, not external URL)
      if (record.mediaType === 'video' && record.videoUrl && !isValidVideoUrl(record.videoUrl)) {
        // Only delete if it's an Azure URL (not YouTube/Vimeo/Loom)
        await deleteVideoFromAzure(record.videoUrl);
        record.videoUrl = null;
      } else if (record.mediaType === 'image' && record.photos && record.photos.length > 0) {
        await Promise.all(record.photos.map(img => deleteImageFromAzure(img)));
        record.photos = [];
      }

      // Upload new media
      if (finalMediaType === 'video') {
        record.videoUrl = await uploadVideoToAzure(uploadedFile.buffer, uploadedFile.originalname, uploadedFile.mimetype);
        record.mediaType = 'video';
        record.photos = [];
      } else {
        // Single image upload
        const uploadedUrl = await uploadImageToAzure(uploadedFile.buffer, uploadedFile.originalname);
        record.photos = [uploadedUrl];
        record.mediaType = 'image';
        record.videoUrl = null;
      }
    } else if (videoUrlInput && isValidVideoUrl(videoUrlInput)) {
      // External video URL provided (YouTube, Vimeo, Loom)
      // Delete old media if it exists
      if (record.mediaType === 'video' && record.videoUrl && !isValidVideoUrl(record.videoUrl)) {
        // Only delete if it's an Azure URL (not external)
        await deleteVideoFromAzure(record.videoUrl);
      } else if (record.mediaType === 'image' && record.photos && record.photos.length > 0) {
        await Promise.all(record.photos.map(img => deleteImageFromAzure(img)));
        record.photos = [];
      }
      
      record.videoUrl = videoUrlInput.trim();
      record.mediaType = 'video';
      record.photos = [];
      finalMediaType = 'video';
    } else if (mediaType) {
      // Media type changed but no new file/URL - clear opposite media type
      if (mediaType === 'video' && record.mediaType === 'image') {
        // Switching to video but no video uploaded/URL provided - clear images
        if (record.photos && record.photos.length > 0) {
          await Promise.all(record.photos.map(img => deleteImageFromAzure(img)));
          record.photos = [];
        }
        record.mediaType = 'video';
      } else if (mediaType === 'image' && record.mediaType === 'video') {
        // Switching to image but no image uploaded - clear video
        if (record.videoUrl && !isValidVideoUrl(record.videoUrl)) {
          // Only delete if it's an Azure URL (not external)
          await deleteVideoFromAzure(record.videoUrl);
        }
        record.videoUrl = null;
        record.mediaType = 'image';
      }
    }

    // Helper function to extract image URLs from HTML description
    const extractImageUrls = (html) => {
      if (!html || typeof html !== 'string') return [];
      const imageUrlRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      const urls = [];
      let match;
      while ((match = imageUrlRegex.exec(html)) !== null) {
        const url = match[1];
        // Only include Azure blob URLs (not external URLs)
        if (url && (url.includes('blob.core.windows.net') || url.includes('edulms.blob.core.windows.net'))) {
          urls.push(url);
        }
      }
      return urls;
    };

    // Extract image URLs from old and new descriptions
    const oldDescription = record.description || '';
    const newDescription = description || oldDescription;
    const oldImageUrls = new Set(extractImageUrls(oldDescription));
    const newImageUrls = new Set(extractImageUrls(newDescription));

    // Find images that were removed (in old but not in new)
    const removedImageUrls = Array.from(oldImageUrls).filter(url => !newImageUrls.has(url));

    // Delete orphaned images from Azure
    if (removedImageUrls.length > 0) {
      await Promise.all(removedImageUrls.map(url => deleteImageFromAzure(url)));
    }

    record.title = title || record.title;
    record.description = description || record.description;
    record.url = url || record.url;
    record.accessType = accessType ?? record.accessType;
    // Update plans: if PRO tier, set valid plans; if not PRO, clear plans
    record.plans = (accessType === "PRO" && validPlans.length > 0) ? validPlans : (accessType !== "PRO" ? [] : record.plans);

    await record.save();
    
    // Populate plans before returning
    await record.populate("plans", "name price description hotmartCheckoutCode hotmartCheckoutUrl");
    
    return res.status(200).json(ApiResponse(200, record, "Record updated successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ================================
   📌 DELETE Crypto Analysis
================================ */
export const deleteCryptoAnalysis = async (req, res) => {
  try {
    const record = await CryptoAnalysisModel.findById(req.params.id);

    if (!record) return res.status(404).json({ message: "Record not found!" });

    // Delete images if present
    if (record.photos && record.photos.length > 0) {
      await Promise.all(record.photos.map(img => deleteImageFromAzure(img)));
    }

    // Delete video if present (only if it's an Azure-uploaded file, not external URL)
    if (record.videoUrl && !isValidVideoUrl(record.videoUrl)) {
      await deleteVideoFromAzure(record.videoUrl);
    }

    if (record.isDeleted) return res.status(400).json({ error: "Already deleted" });

    record.isDeleted = true;
    record.deletedAt = new Date();

    await record.save();
    return res.status(200).json(ApiResponse(200, {}, "Record deleted successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
