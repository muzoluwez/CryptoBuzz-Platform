import Course from "../../models/course.js";
import * as yup from "yup";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import Section from "../../models/section.js";
import Lecture from "../../models/lecture.js";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";
import User from "../../models/user.js";
import { fileURLToPath } from "url";
import { ApiResponse } from "../../utils/ApiResponse.js";

// ⭐ Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------------------------------
// VALIDATION SCHEMAS
// ------------------------------------------------------
const courseValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  price: yup.number().min(0).optional(),
  published: yup.boolean().default(false),
  isFeatured: yup.boolean().default(false),
  tier: yup.string().oneOf(["FREE", "PREMIUM"]).default("FREE"),
  order: yup.number().integer().min(0).optional(),
  category: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/)
    .required(),
  imageUrl: yup.string().nullable(),
  instructor: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/)
    .required()
});

const courseReorderSchema = yup.object().shape({
  courses: yup
    .array()
    .of(
      yup.object().shape({
        id: yup
          .string()
          .matches(/^[0-9a-fA-F]{24}$/)
          .required()
      })
    )
    .required()
});

// ------------------------------------------------------
// GET ALL COURSES
// ------------------------------------------------------
export const getCourses = async (req, res) => {
  try {
    const { search, id, title, description, instructor, isFeatured, tier, published, category, isDeleted } = req.query;

    let query = {};

    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      query.createdBy = req.user._id;
    }

    if (id) query._id = id;

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    } else {
      if (title) query.title = { $regex: title, $options: "i" };
      if (description) query.description = { $regex: description, $options: "i" };
    }

    if (instructor) query.instructor = instructor;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === "true";
    if (published !== undefined) query.published = published === "true";
    if (isDeleted !== undefined) query.isDeleted = isDeleted === "true";

    if (tier) query.tier = tier.toUpperCase();
    if (category) query.category = category.toUpperCase();

    const courses = await Course.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate("instructor", "first_name last_name email")
      .populate("category", "name")
      .populate("sections");

    return res.status(200).json({
      message: "Courses fetched successfully",
      data: courses,
      filters: {
        applied: {
          id,
          title,
          description,
          instructor,
          isFeatured,
          tier,
          published,
          category
        }
      }
    });
  } catch (error) {
    console.error("Error in getCourses:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
// GET SINGLE COURSE
// ------------------------------------------------------
export const getOneCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid course ID" });

    const course = await Course.findById(id)
      .populate("instructor", "name email")
      .populate({
        path: "sections",
        populate: {
          path: "lectures",
          populate: {
            path: "completions",
            match: { user: req.user?._id }
          }
        }
      });

    if (!course) {
      return res.status(400).json({ message: "Course not found" });
    }

    return res.status(200).json(ApiResponse(200, course, "Course fetched successfully"));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
// CREATE COURSE
// ------------------------------------------------------
export const createCourse = async (req, res) => {
  try {
    const body = req.body;
    const reqUser = req.user._id;

    const lastCourse = await Course.findOne().sort({ order: -1 });
    const nextOrder = lastCourse ? lastCourse.order + 1 : 0;

    if (!req.file) return res.status(400).json({ message: "Image is required" });

   

    const azureUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);
    fs.unlinkSync(localPath);

    const newCoursePayload = {
      ...body,
      imageUrl: azureUrl,
      createdBy: reqUser,
      order: nextOrder,
      instructor: reqUser
    };

    await courseValidationSchema.validate(newCoursePayload);

    const newCourse = await Course.create(newCoursePayload);

    await User.updateOne({ _id: reqUser }, { $inc: { courseCount: 1 } });

    const populated = await Course.findById(newCourse._id).populate("category", "name");

    return res.status(200).json(ApiResponse(200, populated, "Course created successfully"));
  } catch (error) {
    return res.status(500).json({ message: error.errors?.[0] || error.message });
  }
};

// ------------------------------------------------------
// UPDATE COURSE
// ------------------------------------------------------
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const updatePayload = {
      ...req.body,
      instructor: req.user._id
    };

    await courseValidationSchema.validate(updatePayload);

    const existingCourse = await Course.findById(id);
    if (!existingCourse) return res.status(404).json({ message: "Course not found" });

    if (req.file) {
      if (existingCourse.imageUrl) {
        await deleteImageFromAzure(existingCourse.imageUrl);
      }


      const azureUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);
  

      updatePayload.imageUrl = azureUrl;
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, updatePayload, {
      new: true
    })
      .populate("instructor", "first_name last_name email")
      .populate("category", "name");
    return res.status(200).json(ApiResponse(200, updatedCourse, "Course updated successfully"));
  } catch (error) {
    return res.status(500).json({ message: error.errors?.[0] || error.message });
  }
};

// ------------------------------------------------------
// DELETE COURSE + SECTIONS + LECTURES
// ------------------------------------------------------
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const sections = await Section.find({ course: id });
      const sectionIds = sections.map(s => s._id);

      await Lecture.deleteMany({ section: { $in: sectionIds } });
      await Section.deleteMany({ course: id });

      const course = await Course.findByIdAndDelete(id);
      if (!course) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.imageUrl) {
        await deleteImageFromAzure(course.imageUrl);
      }

      await User.updateOne({ _id: req.user._id }, { $inc: { courseCount: -1 } });

      await session.commitTransaction();

      return res.status(200).json(ApiResponse(200, {}, "Course & related sections/lectures deleted successfully"));
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
// REORDER COURSES
// ------------------------------------------------------
export const reorderCourses = async (req, res) => {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses))
      return res.status(400).json({
        message: "courses must be an array"
      });

    const courseIds = courses.map(c => c.id);
    const unique = new Set(courseIds);

    if (unique.size !== courseIds.length)
      return res.status(400).json({
        message: "Duplicate course IDs found"
      });

    const existing = await Course.find({ _id: { $in: courseIds } });

    if (existing.length !== courseIds.length)
      return res.status(400).json({
        message: "Some courses not found"
      });

    const ops = courses.map((c, index) => ({
      updateOne: {
        filter: { _id: c.id },
        update: { $set: { order: index } }
      }
    }));

    await Course.bulkWrite(ops);

    const updated = await Course.find({ _id: { $in: courseIds } })
      .sort({ order: 1 })
      .populate("instructor", "first_name last_name email")
      .populate("category", "name")
      .populate("sections");

    return res.status(200).json(ApiResponse(200, updated, "Courses reordered successfully"));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ------------------------------------------------------
export default {
  getCourses,
  getOneCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses
};
