import Lecture from "../../models/lecture.js";
// import LectureCompletion from "../../model/LectureCompletion.js";
import path from "path";
import fs from "fs";
import * as yup from "yup";
import mongoose from "mongoose";

import {
  uploadImageToAzure,
  deleteImageFromAzure,
  uploadVideoToAzure,
  deleteVideoFromAzure
} from "../../utils/azureUploader.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Validation schema for lecture
const lectureValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  content: yup.string().optional(),
  order: yup.number().integer("Order must be an integer").min(0, "Order cannot be negative").optional(),
  type: yup.string().oneOf(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"], "Invalid lecture type").default("VIDEO").optional(),
  preview: yup.boolean().default(false).optional(),
  thumbnailUrl: yup.string().url("Invalid thumbnail URL").nullable().optional(),
  duration: yup.string().optional(),
  section: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid section ID")
    .required("Section is required")
});

/**
 * Get all lectures
 */
export const getLectures = async (req, res) => {
  try {
    const { search, section, title, description, type, preview } = req.query;

    let query = {};

    if (section) query.section = section;

    if (search) {
      query.$or = [{ title: new RegExp(search, "i") }, { description: new RegExp(search, "i") }];
    } else {
      if (title) query.title = new RegExp(title, "i");
      if (description) query.description = new RegExp(description, "i");
    }

    if (type) query.type = type.toUpperCase();
    if (preview !== undefined) query.preview = preview === "true";

    const lectures = await Lecture.find(query).sort({ order: 1, createdAt: 1 }).populate("section", "title");
    // .populate("completions");

    const response = lectures.map(lecture => ({
      _id: lecture._id,
      title: lecture.title,
      description: lecture.description,
      content: lecture.content,
      order: lecture.order,
      type: lecture.type,
      preview: lecture.preview,
      thumbnailUrl: lecture.thumbnailUrl,
      videoUrl: lecture.videoUrl,
      duration: lecture.duration,
      section: lecture.section,
      // completions: lecture.completions,
      createdAt: lecture.createdAt,
      updatedAt: lecture.updatedAt
    }));
    return res.status(200).json(ApiResponse(200, response, "Lectures fetched successfully"));
  } catch (error) {
    console.error("Error in getLectures:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get one lecture
 */
export const getOneLecture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid lecture ID" });

    const lecture = await Lecture.findById(id).populate("section", "title");
    // .populate({
    //   path: "completions",
    //   match: { user: req.user?._id },
    // });

    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    return res.status(200).json(ApiResponse(200, lecture, "Lectures fetched successfully"));
  } catch (error) {
    console.error("Error in getOneLecture:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create lecture
 */
export const createLecture = async (req, res) => {
  try {
    await lectureValidationSchema.validate(req.body);

    const { title, description, content, order, type, preview, section, duration } = req.body;

    const existing = await Lecture.findOne({ title, section });
    if (existing)
      return res.status(400).json({
        message: "Lecture with this title already exists"
      });

    let videoUrl = null;

    if (req.file) {
      const localPath = path.resolve("../../../", req.file.path);
      const buffer = fs.readFileSync(localPath);

      videoUrl = await uploadVideoToAzure(buffer, req.file.originalname);
      fs.unlinkSync(localPath);
    }

    const newLecture = await Lecture.create({
      title,
      description,
      content,
      order,
      type,
      preview,
      videoUrl,
      duration,
      section
    });

    await mongoose.model("Section").findByIdAndUpdate(section, {
      $push: { lectures: newLecture._id }
    });
    return res.status(200).json(ApiResponse(200, newLecture, "Lectures created successfully"));
  } catch (error) {
    console.error("Error in createLecture:", error);
    res.status(500).json({ message: error.errors?.[0] || error.message });
  }
};

/**
 * Update lecture
 */
export const updateLecture = async (req, res) => {
  try {
    const { id } = req.params;
    await lectureValidationSchema.validate(req.body);

    const { title, description, content, order, type, preview, section, duration } = req.body;

    const existingLecture = await Lecture.findById(id);
    if (!existingLecture) return res.status(404).json({ message: "Lecture not found" });

    if (title !== existingLecture.title || section !== existingLecture.section.toString()) {
      const exists = await Lecture.findOne({
        title,
        section,
        _id: { $ne: id }
      });

      if (exists)
        return res.status(400).json({
          message: "Lecture with this title already exists"
        });
    }

    let videoUrl = existingLecture.videoUrl;
    let thumbnailUrl = existingLecture.thumbnailUrl;

    if (req.files?.video?.[0]) {
      if (videoUrl) await deleteVideoFromAzure(videoUrl);

      const file = req.files.video[0];
      videoUrl = await uploadVideoToAzure(file.buffer, file.originalname);
    }

    if (req.files?.thumbnail?.[0]) {
      if (thumbnailUrl) await deleteImageFromAzure(thumbnailUrl);

      const file = req.files.thumbnail[0];
      thumbnailUrl = await uploadImageToAzure(file.buffer, file.originalname);
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      id,
      {
        title,
        description,
        content,
        order,
        type,
        preview,
        videoUrl,
        thumbnailUrl,
        duration,
        section
      },
      { new: true }
    ).populate("section", "title");
    return res.status(200).json(ApiResponse(200, updatedLecture, "Lectures updated successfully"));
  } catch (error) {
    console.error("Error in updateLecture:", error);
    res.status(500).json({ message: error.errors?.[0] || error.message });
  }
};

/**
 * Delete lecture
 */
export const deleteLecture = async (req, res) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findById(id);
    if (!lecture) return res.status(404).json({ message: "Lecture not found" });

    await mongoose.model("Section").findByIdAndUpdate(lecture.section, {
      $pull: { lectures: lecture._id }
    });

    // await LectureCompletion.deleteMany({ lecture: lecture._id });

    await Lecture.findByIdAndDelete(id);
    return res.status(200).json(ApiResponse(200, {}, "Lectures delete successfully"));
  } catch (error) {
    console.error("Error in deleteLecture:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reorder lectures
 */
export const reorderLectures = async (req, res) => {
  try {
    const { lectures } = req.body;

    if (!Array.isArray(lectures)) return res.status(400).json({ message: "Invalid input" });

    const ids = lectures.map(l => l.id);
    const unique = new Set(ids);

    if (unique.size !== ids.length) return res.status(400).json({ message: "Duplicate IDs found" });

    const existing = await Lecture.find({ _id: { $in: ids } });
    if (existing.length !== ids.length) return res.status(400).json({ message: "Some lectures not found" });

    const bulkOps = lectures.map((l, index) => ({
      updateOne: {
        filter: { _id: l.id },
        update: { order: index + 1 }
      }
    }));

    await Lecture.bulkWrite(bulkOps);

    const updated = await Lecture.find({ _id: { $in: ids } })
      .sort({ order: 1 })
      .populate("section", "title");
    // .populate("completions");
    return res.status(200).json(ApiResponse(200, updated, "Lectures reordered successfully"));
  } catch (error) {
    console.error("Error in reorderLectures:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getLectures,
  getOneLecture,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures
};
