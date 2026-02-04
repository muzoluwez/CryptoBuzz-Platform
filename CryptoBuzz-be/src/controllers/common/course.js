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
  tier: yup.string().oneOf(["PUBLIC", "LOGGED_IN", "UID_ONLY", "PRO"]).default("PUBLIC"),
  order: yup.number().integer().min(0).optional(),
  category: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/)
    .required(),
  imageUrl: yup.string().nullable(),
  instructor: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/)
    .required(),
  plan: yup
    .string()
    .nullable()
    .optional()
    .test(
      "is-valid-objectid",
      "Plan must be a valid ObjectId",
      function (value) {
        // If plan is null, undefined, or empty string, it's valid (for free courses)
        if (!value || value === "" || value === "null") {
          return true;
        }
        // If plan is provided, it must be a valid ObjectId
        return /^[0-9a-fA-F]{24}$/.test(value);
      }
    ),
  plans: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Each plan must be a valid ObjectId")
    )
    .nullable()
    .optional(),
  // Legacy field - keep for backward compatibility
  hotmartProductId: yup.string().nullable().optional(),
  // Recommended courses - array of course IDs (max 4)
  recommendedCourses: yup
    .array()
    .of(
      yup
        .string()
        .matches(/^[0-9a-fA-F]{24}$/, "Each recommended course must be a valid ObjectId")
    )
    .max(4, "Maximum 4 recommended courses allowed")
    .nullable()
    .optional(),
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
      .populate("plan", "name price currency hotmartCheckoutUrl status")
      .populate("plans", "name price currency hotmartCheckoutUrl status description")
      .populate("recommendedCourses", "_id title description imageUrl price tier")
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

    // Clean up plan/plans fields - remove them for FREE courses or if invalid
    const cleanedBody = { ...body };
    
    if (cleanedBody.tier === "FREE") {
      // For free courses, remove plan/plans fields entirely
      delete cleanedBody.plan;
      delete cleanedBody.plans;
    } else {
      // Handle plans array (new approach - multiple plans)
      if (cleanedBody.plans) {
        // Parse JSON string if sent as JSON (from FormData)
        if (typeof cleanedBody.plans === "string") {
          try {
            const parsed = JSON.parse(cleanedBody.plans);
            if (Array.isArray(parsed)) {
              cleanedBody.plans = parsed;
            } else {
              // If not JSON array, try comma-separated
              cleanedBody.plans = cleanedBody.plans
                .split(",")
                .map(p => p.trim())
                .filter(p => p && p !== "null" && p !== "undefined");
            }
          } catch (e) {
            // Not JSON, try comma-separated string
            cleanedBody.plans = cleanedBody.plans
              .split(",")
              .map(p => p.trim())
              .filter(p => p && p !== "null" && p !== "undefined");
          }
        }
        // Ensure it's an array and filter out invalid values
        if (Array.isArray(cleanedBody.plans)) {
          cleanedBody.plans = cleanedBody.plans
            .filter(p => p && p !== "null" && p !== "undefined" && /^[0-9a-fA-F]{24}$/.test(p));
          // If plans array is empty, remove it
          if (cleanedBody.plans.length === 0) {
            delete cleanedBody.plans;
          }
        }
      }
      
      // Handle legacy single plan field (for backward compatibility)
      if (cleanedBody.plan) {
        // If plans array exists, also add single plan to it
        if (!cleanedBody.plans) {
          cleanedBody.plans = [];
        }
        const planValue = String(cleanedBody.plan).trim();
        if (planValue && planValue !== "null" && planValue !== "undefined" && /^[0-9a-fA-F]{24}$/.test(planValue)) {
          if (!cleanedBody.plans.includes(planValue)) {
            cleanedBody.plans.push(planValue);
          }
          // Set single plan field for backward compatibility
          cleanedBody.plan = planValue;
        } else {
          delete cleanedBody.plan;
        }
      } else {
        // No single plan, but we might have plans array
        if (cleanedBody.plans && cleanedBody.plans.length > 0) {
          // Set first plan as the primary plan for backward compatibility
          cleanedBody.plan = cleanedBody.plans[0];
        }
      }
      
      // If no plans at all after cleaning, remove both fields
      if (!cleanedBody.plans || cleanedBody.plans.length === 0) {
        delete cleanedBody.plans;
        delete cleanedBody.plan;
      }
    }

    // Handle recommendedCourses array (max 4 courses)
    if (cleanedBody.recommendedCourses) {
      // Parse JSON string if sent as JSON (from FormData)
      if (typeof cleanedBody.recommendedCourses === "string") {
        try {
          const parsed = JSON.parse(cleanedBody.recommendedCourses);
          if (Array.isArray(parsed)) {
            cleanedBody.recommendedCourses = parsed;
          } else {
            // If not JSON array, try comma-separated
            cleanedBody.recommendedCourses = cleanedBody.recommendedCourses
              .split(",")
              .map(c => c.trim())
              .filter(c => c && c !== "null" && c !== "undefined");
          }
        } catch (e) {
          // Not JSON, try comma-separated string
          cleanedBody.recommendedCourses = cleanedBody.recommendedCourses
            .split(",")
            .map(c => c.trim())
            .filter(c => c && c !== "null" && c !== "undefined");
        }
      }
      // Ensure it's an array and filter out invalid values, limit to 4
      if (Array.isArray(cleanedBody.recommendedCourses)) {
        cleanedBody.recommendedCourses = cleanedBody.recommendedCourses
          .filter(c => c && c !== "null" && c !== "undefined" && /^[0-9a-fA-F]{24}$/.test(c))
          .slice(0, 4); // Limit to max 4 courses
        // Keep empty array (don't delete) to allow setting empty recommended courses
      }
    } else if (cleanedBody.recommendedCourses === null || cleanedBody.recommendedCourses === "" || cleanedBody.recommendedCourses === undefined) {
      // Explicitly set to empty array if null, empty string, or undefined
      cleanedBody.recommendedCourses = [];
    }

    const azureUrl = await uploadImageToAzure(req.file.buffer, req.file.originalname);

    // Author assignment: admins can assign another user (educator/admin) as course author
    let authorId = reqUser;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const bodyAuthorId = cleanedBody.createdBy ? String(cleanedBody.createdBy).trim() : null;
    if (isAdmin && bodyAuthorId && /^[0-9a-fA-F]{24}$/.test(bodyAuthorId)) {
      const authorUser = await User.findById(bodyAuthorId).select("_id role").lean();
      if (authorUser && ["educator", "admin", "super_admin"].includes(authorUser.role)) {
        authorId = authorUser._id;
      }
    }
    delete cleanedBody.createdBy; // avoid passing through to payload as raw string

    const newCoursePayload = {
      ...cleanedBody,
      imageUrl: azureUrl,
      createdBy: authorId,
      order: nextOrder,
      instructor: authorId
    };

    await courseValidationSchema.validate(newCoursePayload);

    const newCourse = await Course.create(newCoursePayload);

    await User.updateOne({ _id: authorId }, { $inc: { courseCount: 1 } });

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

    // Clean up plan/plans fields - remove them for FREE courses or if invalid
    const cleanedBody = { ...req.body };
    
    if (cleanedBody.tier === "FREE") {
      // For free courses, remove plan/plans fields entirely
      delete cleanedBody.plan;
      delete cleanedBody.plans;
    } else {
      // Handle plans array (new approach - multiple plans)
      if (cleanedBody.plans) {
        // Parse JSON string if sent as JSON (from FormData)
        if (typeof cleanedBody.plans === "string") {
          try {
            const parsed = JSON.parse(cleanedBody.plans);
            if (Array.isArray(parsed)) {
              cleanedBody.plans = parsed;
            } else {
              // If not JSON array, try comma-separated
              cleanedBody.plans = cleanedBody.plans
                .split(",")
                .map(p => p.trim())
                .filter(p => p && p !== "null" && p !== "undefined");
            }
          } catch (e) {
            // Not JSON, try comma-separated string
            cleanedBody.plans = cleanedBody.plans
              .split(",")
              .map(p => p.trim())
              .filter(p => p && p !== "null" && p !== "undefined");
          }
        }
        // Ensure it's an array and filter out invalid values
        if (Array.isArray(cleanedBody.plans)) {
          cleanedBody.plans = cleanedBody.plans
            .filter(p => p && p !== "null" && p !== "undefined" && /^[0-9a-fA-F]{24}$/.test(p));
          // If plans array is empty, remove it
          if (cleanedBody.plans.length === 0) {
            delete cleanedBody.plans;
          }
        }
      }
      
      // Handle legacy single plan field (for backward compatibility)
      if (cleanedBody.plan) {
        // If plans array exists, also add single plan to it
        if (!cleanedBody.plans) {
          cleanedBody.plans = [];
        }
        const planValue = String(cleanedBody.plan).trim();
        if (planValue && planValue !== "null" && planValue !== "undefined" && /^[0-9a-fA-F]{24}$/.test(planValue)) {
          if (!cleanedBody.plans.includes(planValue)) {
            cleanedBody.plans.push(planValue);
          }
          // Set single plan field for backward compatibility
          cleanedBody.plan = planValue;
        } else {
          delete cleanedBody.plan;
        }
      } else {
        // No single plan, but we might have plans array
        if (cleanedBody.plans && cleanedBody.plans.length > 0) {
          // Set first plan as the primary plan for backward compatibility
          cleanedBody.plan = cleanedBody.plans[0];
        }
      }
      
      // If no plans at all after cleaning, remove both fields
      if (!cleanedBody.plans || cleanedBody.plans.length === 0) {
        delete cleanedBody.plans;
        delete cleanedBody.plan;
      }
    }

    // Handle recommendedCourses array (max 4 courses)
    if (cleanedBody.recommendedCourses) {
      // Parse JSON string if sent as JSON (from FormData)
      if (typeof cleanedBody.recommendedCourses === "string") {
        try {
          const parsed = JSON.parse(cleanedBody.recommendedCourses);
          if (Array.isArray(parsed)) {
            cleanedBody.recommendedCourses = parsed;
          } else {
            // If not JSON array, try comma-separated
            cleanedBody.recommendedCourses = cleanedBody.recommendedCourses
              .split(",")
              .map(c => c.trim())
              .filter(c => c && c !== "null" && c !== "undefined");
          }
        } catch (e) {
          // Not JSON, try comma-separated string
          cleanedBody.recommendedCourses = cleanedBody.recommendedCourses
            .split(",")
            .map(c => c.trim())
            .filter(c => c && c !== "null" && c !== "undefined");
        }
      }
      // Ensure it's an array and filter out invalid values, limit to 4
      if (Array.isArray(cleanedBody.recommendedCourses)) {
        cleanedBody.recommendedCourses = cleanedBody.recommendedCourses
          .filter(c => c && c !== "null" && c !== "undefined" && /^[0-9a-fA-F]{24}$/.test(c))
          .slice(0, 4); // Limit to max 4 courses
        // Keep empty array (don't delete) to allow clearing recommended courses
      }
    } else if (cleanedBody.recommendedCourses === null || cleanedBody.recommendedCourses === "" || cleanedBody.recommendedCourses === undefined) {
      // Explicitly set to empty array if null, empty string, or undefined
      cleanedBody.recommendedCourses = [];
    }

    // Author assignment on update: admins can reassign course author (createdBy/instructor)
    let updateInstructor = req.user._id;
    const isAdmin = req.user.role === "admin" || req.user.role === "super_admin";
    const bodyAuthorId = cleanedBody.createdBy ? String(cleanedBody.createdBy).trim() : (cleanedBody.instructor ? String(cleanedBody.instructor).trim() : null);
    if (isAdmin && bodyAuthorId && /^[0-9a-fA-F]{24}$/.test(bodyAuthorId)) {
      const authorUser = await User.findById(bodyAuthorId).select("_id role").lean();
      if (authorUser && ["educator", "admin", "super_admin"].includes(authorUser.role)) {
        updateInstructor = authorUser._id;
      }
    }
    delete cleanedBody.createdBy;

    const updatePayload = {
      ...cleanedBody,
      instructor: updateInstructor,
      createdBy: updateInstructor
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
