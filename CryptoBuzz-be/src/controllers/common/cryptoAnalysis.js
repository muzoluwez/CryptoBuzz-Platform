import path from "path";
import fs from "fs";
import CryptoAnalysisModel from "../../models/cryptoAnalysis.js";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";
import * as Yup from "yup";
import Category from "../../models/category.js";
// import {
//   notifyUsersOnTradeAnalysis,
//   notifyFollowersOfEducator,
// } from "../../firebase/messaging.js";
import mongoose from "mongoose";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// Validation schema
const createCryptoAnalysisSchema = Yup.object().shape({
  title: Yup.string().required("title is required"),
  createdBy: Yup.string().required("Educator ID is required"),
  description: Yup.string().required("Entry is required"),
  url: Yup.string().url("Please enter a valid URL").optional(),
  accessType: Yup.string().optional()
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
      image: Array.isArray(data.photos) ? data.photos.map(img => `${img}`) : `${data.photos}`,
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

    const { title, description, createdBy, url, accessType } = req.body;

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

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Images are required." });

    const imageUrls = await Promise.all(
      req.files.map(async file => {
        const uploadedUrl = await uploadImageToAzure(file.buffer, file.originalname);

        return uploadedUrl;
      })
    );

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
    const { title, description, url, accessType } = req.body;

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

    let updatedImages = [...record.photos];

    if (req.files && req.files.length > 0) {
      const newImages = await Promise.all(
        req.files.map(async file => {
          const azureUrl = await uploadImageToAzure(file.buffer, file.originalname);

          return azureUrl;
        })
      );

      const oldImagesToDelete = record.photos.slice(0, newImages.length);

      await Promise.all(oldImagesToDelete.map(img => deleteImageFromAzure(img)));

      updatedImages.splice(0, newImages.length, ...newImages);
    }

    record.title = title || record.title;
    record.description = description || record.description;
    record.url = url || record.url;
    record.photos = updatedImages;
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

    await Promise.all(record.photos.map(img => deleteImageFromAzure(img)));

    if (record.isDeleted) return res.status(400).json({ error: "Already deleted" });

    record.isDeleted = true;
    record.deletedAt = new Date();

    await record.save();
    return res.status(200).json(ApiResponse(200, {}, "Record deleted successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
