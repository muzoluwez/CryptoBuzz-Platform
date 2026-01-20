import BannerModel from "../../models/banner.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";

// ------------------------------------------
// GET ACTIVE BANNERS (ONLY STATUS = TRUE)
// ------------------------------------------
export const getBannerList = async (req, res) => {
  try {
    const banners = await BannerModel.find({ status: true, isDelete: false });

    // Return as object with left and right properties
    const bannersObj = {
      left: banners.find(b => b.position === "left") || null,
      right: banners.find(b => b.position === "right") || null
    };

    return res.status(200).json(ApiResponse(200, bannersObj, "Banners fetched successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// GET ALL BANNERS WITH PAGINATION AND FILTERS
// ------------------------------------------
export const getBanner = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", position = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isDelete: false,
      ...(search && { title: { $regex: search, $options: "i" } }),
      ...(position && { position })
    };

    const totalCount = await BannerModel.countDocuments(query);

    const banners = await BannerModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const pagination = {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / limit)
    };

    return res.status(200).json(GetApiResponse(200, banners, pagination, "Banners fetched successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// CREATE OR UPDATE BANNER BY POSITION
// ------------------------------------------
export const createBanner = async (req, res) => {
  try {
    const { title, link, openInNewTab, status, position } = req.body;

    // Validate position
    if (!position || !["left", "right"].includes(position)) {
      return res.status(400).json({ 
        success: false, 
        message: "Position must be either 'left' or 'right'." 
      });
    }

    // Check if both images are uploaded
    if (!req.files || !req.files.desktopImage || !req.files.mobileImage) {
      return res.status(400).json({ 
        success: false, 
        message: "Both desktop and mobile images are required." 
      });
    }

    // If this banner is being set as active, deactivate all other banners in this position
    const isActive = status === "true" || status === true;
    if (isActive) {
      await BannerModel.updateMany(
        { position, isDelete: false },
        { $set: { status: false } }
      );
    }

    // Upload desktop image to Azure
    const desktopImageUrl = await uploadImageToAzure(
      req.files.desktopImage[0].buffer,
      req.files.desktopImage[0].originalname
    );

    // Upload mobile image to Azure
    const mobileImageUrl = await uploadImageToAzure(
      req.files.mobileImage[0].buffer,
      req.files.mobileImage[0].originalname
    );

    const newBanner = new BannerModel({
      title,
      position,
      desktopImage: desktopImageUrl,
      mobileImage: mobileImageUrl,
      link: link || "",
      openInNewTab: openInNewTab === "true" || openInNewTab === true,
      status: status === "true" || status === true
    });

    await newBanner.save();

    return res.status(200).json(ApiResponse(200, newBanner, "Banner added successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// UPDATE BANNER BY ID
// ------------------------------------------
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, link, openInNewTab, status, position } = req.body;

    const banner = await BannerModel.findById(id);

    if (!banner) {
      return res.status(400).json({ message: "Banner does not exist." });
    }

    // Update desktop image if uploaded
    if (req.files && req.files.desktopImage) {
      // Delete old desktop image
      if (banner.desktopImage) {
        await deleteImageFromAzure(banner.desktopImage);
      }
      
      // Upload new desktop image
      const desktopImageUrl = await uploadImageToAzure(
        req.files.desktopImage[0].buffer,
        req.files.desktopImage[0].originalname
      );
      banner.desktopImage = desktopImageUrl;
    }

    // Update mobile image if uploaded
    if (req.files && req.files.mobileImage) {
      // Delete old mobile image
      if (banner.mobileImage) {
        await deleteImageFromAzure(banner.mobileImage);
      }
      
      // Upload new mobile image
      const mobileImageUrl = await uploadImageToAzure(
        req.files.mobileImage[0].buffer,
        req.files.mobileImage[0].originalname
      );
      banner.mobileImage = mobileImageUrl;
    }

    // Update other fields
    banner.title = title ?? banner.title;
    banner.link = link !== undefined ? link : banner.link;
    banner.openInNewTab = openInNewTab !== undefined ? (openInNewTab === "true" || openInNewTab === true) : banner.openInNewTab;
    banner.position = position ?? banner.position;
    
    // If activating this banner, deactivate all others in this position
    const newStatus = status !== undefined ? (status === "true" || status === true) : banner.status;
    if (newStatus && !banner.status) {
      // Deactivate all other banners in this position
      await BannerModel.updateMany(
        { position: banner.position, isDelete: false, _id: { $ne: banner._id } },
        { $set: { status: false } }
      );
    }
    banner.status = newStatus;

    await banner.save();

    return res.status(200).json(ApiResponse(200, banner, "Banner updated successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ------------------------------------------
// SOFT DELETE BANNER BY ID
// ------------------------------------------
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await BannerModel.findById(id);

    if (!banner) {
      return res.status(400).json({ message: "Banner does not exist." });
    }

    // Delete images from Azure
    if (banner.desktopImage) {
      await deleteImageFromAzure(banner.desktopImage);
    }
    if (banner.mobileImage) {
      await deleteImageFromAzure(banner.mobileImage);
    }

    banner.isDelete = true;
    banner.status = false;
    banner.deleteAt = new Date();

    await banner.save();

    return res.status(200).json(ApiResponse(200, {}, "Banner deleted successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Default export if needed
export default {
  getBannerList,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner
};
