import IdeaModel from "../../models/idea.js";
import yup from "yup";
import path from "path";
import fs from "fs";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";
// import { notifyUsersOnTradeIdea, notifyFollowersOfEducator } from "../../firebase/messaging";
import CategoryModel from "../../models/category.js";
import mongoose from "mongoose";
import UserModel from "../../models/user.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// Define the Yup schema to validate the item object
const itemValidationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  // image: yup.string()
  //   .required("At least one image is required"),

  type: yup.string().oneOf(["buy", "sell"]).required("Type is required"),
  // timeFrame: yup
  //   .string()
  //   .oneOf(["scalp", "intraday", "swing"], "Invalid time frame")
  //   .nullable(),
  timeFrame: yup
    .array()
    .of(yup.string().required("Each exit is required"))
    .min(1, "At least one exit is required")
    .required("Exits are required"),

  educatorId: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "Educator ID must be a valid MongoDB ObjectId")
    .required("Educator Id are required"),
  category: yup.string().required("category Id are required"),

  status: yup
    .string()
    .oneOf(["active", "pending", "win", "partialWin", "loss", "breakEven"])
    .required("Status is required"),

  entry: yup.string().required("Entry date is required"),
  invalidation: yup.number().required("Invalidation is required").positive("Invalidation must be a positive number"),
  exits: yup
    .array()
    .of(yup.string().required("Each exit is required"))
    .min(1, "At least one exit is required")
    .required("Exits are required"),
  accessType: yup.string().optional()
});

export const getIdea = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Get page and limit from the query parameters (default to 1 and 10)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const categoryId = req.query.category;

    let filter = {};
    if (user.role == "educator") {
      filter = { educatorId: user._id };
    }

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter.category = new mongoose.Types.ObjectId(categoryId);
    }
    // Get the total count of records for pagination metadata
    const totalCount = await IdeaModel.countDocuments(filter);

    // Calculate the skip value (used for pagination)
    const skip = (page - 1) * limit;

    // Check if skip is greater than total records
    if (skip >= totalCount) {
      return res.status(400).json({ message: "No records found" });
    }

    if (req.query.isview == "true") {
      const existingData = await IdeaModel.find(filter)
        .skip(skip) // Skip the number of items based on page
        .limit(limit) // Limit the number of items per page
        .sort({ createdAt: -1 })
        .populate("educatorId", "first_name last_name image")
        .lean()
        .populate("category", " _id name")
        .lean();

      let response = existingData.map(data => ({
        _id: data._id,
        name: data.name,
        image: Array.isArray(data.image) ? data.image.map(image => `${image}`) : `${data.image}`,
        image_Url: data.image_Url,
        type: data.type,
        timeFrame: data?.timeFrame,
        educatorDetails: data.educatorId,
        category: data.category,
        status: data.status,
        entry: data.entry,
        invalidation: data.invalidation,
        description: data.description,
        exits: data.exits,
        pips: data.pips,
        accessType: data.accessType || "PUBLIC",
        createdAt: data.createdAt
      }));

      const pagination = {
        currentPage: page,
        limit: limit,
        totalPages: Math.ceil(totalCount / limit),
        totalRecords: totalCount
      };

      return res.status(200).json(GetApiResponse(200, response, pagination, "Records fetched successfully"));
    }

    // Fetch data with pagination
    const existingData = await IdeaModel.find(filter)
      // .skip(skip) // Skip the number of items based on page
      // .limit(limit) // Limit the number of items per page
      .sort({ createdAt: -1 })
      .populate("educatorId", "first_name last_name image")
      .populate("category", " _id name");

    // Prepare the response data
    let response = existingData.map(data => ({
      _id: data._id,
      name: data.name,
      image: Array.isArray(data.image) ? data.image.map(image => `${image}`) : `${data.image}`,
      image_Url: data.image_Url,
      type: data.type,
      timeFrame: data?.timeFrame,
      educatorDetails: data.educatorId,
      category: data.category,
      status: data.status,
      entry: data.entry,
      invalidation: data.invalidation,
      description: data.description,
      exits: data.exits,
      pips: data.pips,
      accessType: data.accessType,
      createdAt: data.createdAt
    }));

    return res.status(200).json(ApiResponse(200, response, "Records fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors || error.message
    });
  }
};

export const createIdea = async (req, res) => {
  try {
    await itemValidationSchema.validate(req.body);
    const {
      name,
      type,
      timeFrame,
      image_Url,
      educatorId,
      category,
      status,
      entry,
      invalidation,
      description,
      exits,
      pips,
      accessType
    } = req.body;

    const educatorUser = req.user;
    if (!educatorUser) {
      return res.status(400).json({ message: "token are required." });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "Images are required." });
    }
    const imageUrls = await Promise.all(
      req.files.map(async file => {
        const imageUrl = await uploadImageToAzure(file.buffer, file.originalname);

        return imageUrl;
      })
    );

    const newIdea = new IdeaModel({
      name,
      image: imageUrls,
      type,
      timeFrame,
      image_Url,
      educatorId,
      category,
      status,
      entry,
      invalidation,
      description,
      exits,
      pips,
      accessType
    });

    await newIdea.save();

    await UserModel.updateOne({ _id: educatorUser._id }, { $inc: { ideaCount: 1 } });

    // const filtredCategory = await CategoryModel.findById(category).select("name");

    // let topic = "";
    // if (filtredCategory.name === "Crypto") {
    //   topic = "crypto_users";
    // } else if (filtredCategory.name === "Forex") {
    //   topic = "forex_users";
    // }

    // 🔔 Send Notification

    // await notifyFollowersOfEducator(
    //   educatorUser._id,
    //   "New Trade Ideas Published 🚀",
    //   `Check out the latest Trade Ideas on ${filtredCategory.name} - ${name}`,
    //   {
    //     id: newIdea._id.toString(),
    //     category: filtredCategory.name,
    //     title: newIdea.name,
    //     screen: "IQIdeas",
    //     redirectUrl: `/users/idea/get`,
    //     educatorId: educatorUser._id.toString(),
    //     educatorName:
    //       educatorUser.name ||
    //       educatorUser.first_name + " " + educatorUser.last_name,
    //   }
    // );
    return res.status(200).json(ApiResponse(200, newIdea, "Record inserted successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.message
    });
  }
};
export const updateIdea = async (req, res) => {
  try {
    await itemValidationSchema.validate(req.body);
    const {
      name,
      type,
      timeFrame,
      category,
      status,
      entry,
      invalidation,
      exits,
      description,
      pips = 0,
      accessType
    } = req.body;
    const { id } = req.params;
    const idea = await IdeaModel.findById(id);
    if (!idea) {
      return res.status(404).json({ message: "Record not found!" });
    }

    let updatedImageUrls = idea.image;

    if (req.files && req.files.length > 0) {
      await Promise.all(idea.image.map(url => deleteImageFromAzure(url)));

      updatedImageUrls = await Promise.all(
        req.files.map(async file => {
          const azureUrl = await uploadImageToAzure(file.buffer, file.originalname);

          return azureUrl;
        })
      );
    }

    idea.name = name;
    idea.type = type;
    idea.timeFrame = timeFrame;
    idea.category = category;
    idea.status = status;
    idea.entry = entry;
    idea.invalidation = invalidation;
    idea.exits = exits;
    idea.description = description;
    idea.image = updatedImageUrls;
    idea.pips = pips;
    idea.accessType = accessType;

    await idea.save();

    return res.status(200).json({
      message: "Trade Idea updated successfully",
      data: idea
    });
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.error || error.message
    });
  }
};

export const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const existingData = await IdeaModel.findById(id);
    if (!existingData) {
      return res.status(404).json({ message: "Record not found!" });
    }
    await Promise.all(existingData.image.map(url => deleteImageFromAzure(url)));
    existingData.isDeleted = true;
    existingData.deletedAt = Date.now();

    existingData.save();

    await UserModel.updateOne({ _id: req.user._id }, { $inc: { ideaCount: -1 } });

    return res.status(200).json(ApiResponse(200, {}, "Record delete successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.message
    });
  }
};

export default { getIdea, createIdea, updateIdea, deleteIdea };
