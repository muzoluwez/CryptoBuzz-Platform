import Section from "../../models/section.js";
import * as yup from "yup";
import mongoose from "mongoose";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Validation schema for section
const sectionValidationSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().optional(),
  order: yup.number().integer("Order must be an integer").min(0, "Order cannot be negative").optional(),
  course: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "Invalid course ID")
    .required("Course is required")
});

/**
 * Get all sections with pagination and filtering
 */
export const getSections = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search, course, title, description } = req.query;

    const query = {};

    if (course) query.course = course;

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
    } else {
      if (title) query.title = { $regex: title, $options: "i" };
      if (description) query.description = { $regex: description, $options: "i" };
    }

    const totalCount = await Section.countDocuments(query);

    const sections = await Section.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate("course", "title")
      .populate("lectures");

    const response = sections.map(section => ({
      _id: section._id,
      title: section.title,
      description: section.description,
      order: section.order,
      course: section.course,
      lectures: section.lectures,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt
    }));

    return res.status(200).json({
      message: "Sections fetched successfully",
      data: response,
      filters: {
        applied: { search, course, title, description }
      }
    });
  } catch (error) {
    console.error("Error in getSections:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

/**
 * Get single section
 */
export const getOneSection = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid section ID format" });
    }

    const section = await Section.findById(id)
      .populate("course", "title")
      .populate({ path: "lectures", options: { sort: { order: 1 } } });

    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    return res.status(200).json(ApiResponse(200, section, "Section fetched successfully"));
  } catch (error) {
    console.error("Error in getOneSection:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

/**
 * Create new section
 */
export const createSection = async (req, res) => {
  try {
    await sectionValidationSchema.validate(req.body);

    const { title, description, order, course } = req.body;

    const existingSection = await Section.findOne({ title, course });
    if (existingSection) {
      return res.status(400).json({ message: "Section with this title already exists in this course" });
    }

    const newSection = await Section.create({
      title,
      description,
      order,
      course
    });

    await mongoose.model("Course").findByIdAndUpdate(course, {
      $push: { sections: newSection._id }
    });
    return res.status(200).json(ApiResponse(200, newSection, "Section created successfully"));
  } catch (error) {
    console.error("Error in createSection:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.message
    });
  }
};

/**
 * Update section
 */
export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;

    await sectionValidationSchema.validate(req.body);

    const { title, description, course } = req.body;

    const existingSection = await Section.findById(id);
    if (!existingSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    if (title !== existingSection.title || course !== existingSection.course) {
      const duplicate = await Section.findOne({
        title,
        course,
        _id: { $ne: id }
      });

      if (duplicate) {
        return res.status(400).json({
          message: "Section with this title already exists in this course"
        });
      }
    }

    const updatedSection = await Section.findByIdAndUpdate(id, { title, description, course }, { new: true }).populate(
      "course",
      "title"
    );
    return res.status(200).json(ApiResponse(200, updatedSection, "Section updated successfully"));
  } catch (error) {
    console.error("Error in updateSection:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.message
    });
  }
};

/**
 * Delete section
 */
export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;

    const section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }

    await Section.findByIdAndDelete(id);

    await mongoose.model("Course").findByIdAndUpdate(section.course, {
      $pull: { sections: section._id }
    });
    return res.status(200).json(ApiResponse(200, {}, "Section deleted successfully"));
  } catch (error) {
    console.error("Error in deleteSection:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

/**
 * Reorder sections
 */
export const reorderSections = async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ message: "Invalid input: sections must be an array" });
    }

    const sectionIds = sections.map(section => section._id);
    const uniqueIds = new Set(sectionIds);

    if (uniqueIds.size !== sectionIds.length) {
      return res.status(400).json({
        message: "Invalid input: duplicate section IDs found"
      });
    }

    const existingSections = await Section.find({ _id: { $in: sectionIds } });
    if (existingSections.length !== sectionIds.length) {
      return res.status(400).json({
        message: "Invalid input: one or more sections not found"
      });
    }

    const bulkOps = sections.map((section, index) => ({
      updateOne: {
        filter: { _id: section },
        update: { $set: { order: index + 1 } }
      }
    }));

    await Section.bulkWrite(bulkOps);

    const updatedSections = await Section.find({ _id: { $in: sectionIds } })
      .sort({ order: 1 })
      .populate("course", "title")
      .populate("lectures");

    return res.status(200).json(ApiResponse(200, updatedSections, "Sections reordered successfully"));
  } catch (error) {
    console.error("Error in reorderSections:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

export default {
  getSections,
  getOneSection,
  createSection,
  updateSection,
  deleteSection,
  reorderSections
};
