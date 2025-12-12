import UserModel from "../../models/user.js";
import CourseModel from "../../models/course.js";
import IdeaModel from "../../models/idea.js";
import LiveStreamModel from "../../models/liveStream.js";
import ScheduleModel from "../../models/schedule.js";
import TradeAnalysisModel from "../../models/tradeAnalysis.js";

import mongoose from "mongoose";
import RecurrenceSchedule from "../../models/recurrenceSchedule.js";

import bcrypt from "bcrypt";
import * as yup from "yup";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

import { deleteImageFromAzure, uploadImageToAzure } from "../../utils/azureUploader.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

const educatorSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  crm_id: yup.string().nullable(),
  expire_at: yup.date().required("Expire date is required"),
  role: yup.string().oneOf(["educator", "admin", "user", "super_admin"], "Invalid role").required("Role is required"),
  status: yup.string().oneOf(["active", "inactive", "pending"], "Invalid status").required("Status is required"),
  is_create_stream: yup.boolean().default(true),
  plan: yup.string().nullable()
});

// ------------------------
// IMAGE UPLOAD HELPER
// ------------------------
async function uploadData(file) {

  try {
    const imageUrl = await uploadImageToAzure(file.buffer, file.originalname);
    return imageUrl;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ------------------------
// LIST EDUCATORS
// ------------------------
export const listEducator = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const educator = req.query.educator || "";

    const filter = { role: "educator" };

    if (search.trim() !== "") {
      filter.$or = [
        { first_name: { $regex: search, $options: "i" } },
        { last_name: { $regex: search, $options: "i" } }
      ];
    }

    if (educator && mongoose.Types.ObjectId.isValid(educator)) {
      filter._id = educator;
    }

    const totalCount = await UserModel.countDocuments(filter);
    const skip = (page - 1) * limit;

    if (skip >= totalCount && totalCount > 0) {
      return res.status(400).json({ message: "No records found" });
    }

    const users = await UserModel.find(filter).populate("categories").skip(skip).limit(limit).sort({ createdAt: -1 });

    const response = users.map(data => ({
      _id: data._id,
      first_name: data.first_name,
      last_name: data.last_name,
      image: data.image || `${process.env.URL}assets/default-image.png`,
      bannerImage: data.bannerImage || `${process.env.URL}assets/default_banner.jpg`,
      email: data.email,
      role: data.role,
      status: data.status,
      bio: data.bio || "",
      description: data.description || "",
      is_create_stream: data.is_create_stream,
      is_access_trade_ideas: data.is_access_trade_ideas,
      is_access_trade_analysis: data.is_access_trade_analysis,
      projectId: data.projectId,
      categories: data.categories || [],
      followingCount: data.followers?.length || 0,
      educatorRole: data.educatorRole || "",
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }));

    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount
    };

    return res.status(200).json(GetApiResponse(200, response, pagination, "Records fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

// ------------------------
// CREATE EDUCATOR
// ------------------------
export const createEducator = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      password,
      name,
      email,
      role,
      description,
      status,
      is_create_stream,
      is_access_trade_ideas,
      is_access_trade_analysis,
      projectId,
      educatorRole,
      bio
    } = req.body;

    let { categories } = req.body;

    if (!categories) categories = [];
    else if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = categories.split(",");
      }
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already registered" });
    }

    if (!req.files) {
      return res.status(400).json({ message: "Files are required..!" });
    }

    const hashedPass = await bcrypt.hash(password || "password123", 10);

    const newUser = new UserModel({
      first_name,
      last_name,
      name,
      email,
      password: hashedPass,
      role,
      image: req.files?.image?.[0] ? await uploadData(req.files.image[0]) : null,
      bannerImage: req.files?.icon?.[0] ? await uploadData(req.files.icon[0]) : null,
      status,
      is_create_stream,
      is_access_trade_ideas,
      is_access_trade_analysis,
      projectId,
      categories,
      educatorRole,
      bio,
      description
    });

    newUser.callId = `educator-${newUser._id}`;
    await newUser.save();

    return res.status(200).json(ApiResponse(200, newUser, "User registered successfully"));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

// ------------------------
// UPDATE EDUCATOR
// ------------------------
export const updateEducator = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) return res.status(400).json({ message: "User not exist" });

    const {
      first_name,
      last_name,
      email,
      status,
      description,
      is_create_stream,
      is_access_trade_ideas,
      is_access_trade_analysis,
      projectId,
      educatorRole,
      bio
    } = req.body;

    let { categories } = req.body;

    if (!categories) categories = [];
    else if (typeof categories === "string") {
      try {
        categories = JSON.parse(categories);
      } catch {
        categories = categories.split(",");
      }
    }

    let updateObj = {
      first_name,
      last_name,
      email,
      status,
      is_create_stream,
      is_access_trade_ideas,
      is_access_trade_analysis,
      projectId,
      categories,
      educatorRole,
      description,
      bio
    };

    if (req.files) {
      if (req.files?.image?.length > 0) {
        if (user.image) deleteImageFromAzure(user.image);
        updateObj.image = await uploadData(req.files.image[0]);
      }

      if (req.files?.icon?.length > 0) {
        if (user.bannerImage) deleteImageFromAzure(user.bannerImage);
        updateObj.bannerImage = await uploadData(req.files.icon[0]);
      }
    }


    const updated = await UserModel.findByIdAndUpdate(id, updateObj, {
      new: true
    });

    return res.status(200).json(ApiResponse(200, updated, "Educator updated successfully"));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

// ------------------------
// DELETE EDUCATOR
// ------------------------
export const deleteEducator = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);
    if (!user) return res.status(400).json({ message: "User not exist" });

    if (user.image) deleteImageFromAzure(user.image);
    if (user.bannerImage) deleteImageFromAzure(user.bannerImage);

    await CourseModel.updateMany({ createdBy: id }, { $set: { isDeleted: true, deletedAt: Date.now() } });

    await IdeaModel.updateMany({ educatorId: id }, { $set: { isDeleted: true, deletedAt: Date.now() } });

    await LiveStreamModel.updateMany({ educator: id }, { $set: { isDeleted: true, deletedAt: Date.now() } });

    await ScheduleModel.updateMany({ educator: id }, { $set: { isDeleted: true, deletedAt: Date.now() } });

    await RecurrenceSchedule.deleteMany({ educator: id });

    await TradeAnalysisModel.updateMany({ createdBy: id }, { $set: { isDeleted: true, deletedAt: Date.now() } });

    user.isDeleted = true;
    user.deletedAt = Date.now();
    await user.save();

    return res.status(200).json(ApiResponse(200, user, "Educator deleted successfully"));
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.errors || error.message
    });
  }
};

// ------------------------
// EXPORT ALL AS ESM
// ------------------------
export default {
  createEducator,
  updateEducator,
  listEducator,
  deleteEducator
};
