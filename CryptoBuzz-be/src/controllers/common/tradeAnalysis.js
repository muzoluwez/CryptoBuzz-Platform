import path from "path";
import fs from "fs";
import TradeAnalysisModel from "../../models/tradeAnalysis.js";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";

import * as Yup from "yup";
// import {
//   notifyUsersOnTradeAnalysis,
//   notifyFollowersOfEducator,
// } from "../../firebase/messaging.js";

import Category from "../../models/category.js";
import mongoose from "mongoose";
import User from "../../models/user.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// Validation schema
const createTradeAnalysisSchema = Yup.object().shape({
  title: Yup.string().required("title is required"),
  createdBy: Yup.string().required("Educator ID is required"),
  description: Yup.string().required("Entry is required"),
  url: Yup.string().url("Please enter a valid URL").optional()
});

// ------------------------
// GET TRADE ANALYSIS
// ------------------------
export const getTradeAnalysis = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(400).json({ message: "User not found" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.category;

    let filter = {};
    if (user.role == "educator") {
      filter = { createdBy: user._id };
    }

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.category = new mongoose.Types.ObjectId(categoryId);
    }

    const totalCount = await TradeAnalysisModel.countDocuments(filter);
    const skip = (page - 1) * limit;

    if (skip >= totalCount) {
      return res.status(400).json({ message: "No records found" });
    }

    const data = await TradeAnalysisModel.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("createdBy", "first_name last_name image")
      .populate("category", "_id name")
      .lean();

    const response = data.map(d => ({
      _id: d._id,
      title: d.title,
      description: d.description,
      createdBy: d.createdBy,
      category: d.category,
      url: d.url,
      image: Array.isArray(d.photos) ? d.photos : [d.photos],
      createdAt: d.createdAt
    }));

    const pagination = {
      currentPage: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount
    };

    return res.status(200).json(GetApiResponse(200, response, pagination, "Records fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors || error.message
    });
  }
};

// ------------------------
// CREATE TRADE ANALYSIS
// ------------------------
export const createTradeAnalysis = async (req, res) => {
  try {
    await createTradeAnalysisSchema.validate(req.body);

    const { title, description, createdBy, url, category } = req.body;
    const educatorUser = req.user;

    if (!educatorUser) return res.status(400).json({ message: "Token is required." });

    if (!req.files || req.files.length === 0) return res.status(400).json({ message: "Images are required." });

    const imageUrls = await Promise.all(
      req.files.map(async file => {
        const imageUrl = await uploadImageToAzure(file.buffer, file.originalname);

        return imageUrl;
      })
    );

    const newTrade = await TradeAnalysisModel.create({
      title,
      description,
      createdBy,
      url,
      category,
      photos: imageUrls
    });

    await User.updateOne({ _id: educatorUser._id }, { $inc: { insightCount: 1 } });

    // const foundCategory = await Category.findById(category).select("name");

    // const topic =
    //   foundCategory.name === "Crypto" ? "crypto_users" : foundCategory.name === "Forex" ? "forex_users" : "";

    // await notifyFollowersOfEducator(
    //   educatorUser._id,
    //   "New IQ Insight Published 📊",
    //   `Detailed analysis on ${foundCategory.name} is live - ${title}`,
    //   {
    //     id: newTrade._id.toString(),
    //     category: foundCategory.name,
    //     title: newTrade.title,
    //     screen: "IQInsights",
    //     educatorId: educatorUser._id.toString(),
    //     educatorName: educatorUser.name || educatorUser.first_name + " " + educatorUser.last_name
    //   }
    // );

    return res.status(200).json(ApiResponse(200, newTrade, "Record inserted successfully"));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ------------------------
// UPDATE TRADE ANALYSIS
// ------------------------
export const updateTradeAnalysis = async (req, res) => {
  try {
    const { title, description, url, category } = req.body;

    const trade = await TradeAnalysisModel.findById(req.params.id);
    if (!trade) return res.status(404).json({ error: "Not found" });

    let updatedImages = [...trade.photos];

    if (req.files && req.files.length > 0) {
      const newImgUrls = await Promise.all(
        req.files.map(async file => {
          const uploadedUrl = await uploadImageToAzure(file.buffer, file.originalname);

          return uploadedUrl;
        })
      );

      const toRemove = trade.photos.slice(0, newImgUrls.length);
      await Promise.all(toRemove.map(url => deleteImageFromAzure(url)));

      updatedImages.splice(0, newImgUrls.length, ...newImgUrls);
    }

    trade.title = title ?? trade.title;
    trade.description = description ?? trade.description;
    trade.category = category ?? trade.category;
    trade.url = url ?? trade.url;
    trade.photos = updatedImages;

    await trade.save();
    return res.status(200).json(ApiResponse(200, trade, "Record updated successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ------------------------
// DELETE TRADE ANALYSIS
// ------------------------
export const deleteTradeAnalysis = async (req, res) => {
  try {
    const trade = await TradeAnalysisModel.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: "Record not found!" });

    await Promise.all(trade.photos.map(url => deleteImageFromAzure(url)));

    if (trade.isDeleted) return res.status(400).json({ error: "Already deleted" });

    await User.updateOne({ _id: req.user._id }, { $inc: { insightCount: -1 } });

    trade.isDeleted = true;
    trade.deletedAt = new Date();
    await trade.save();
    return res.status(200).json(ApiResponse(200, {}, "Record deleted successfully"));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
