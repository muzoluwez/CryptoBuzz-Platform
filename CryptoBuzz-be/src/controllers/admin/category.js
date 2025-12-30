import Category from "../../models/category.js";
import yup from "yup";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { uploadImageToAzure, deleteImageFromAzure } from "../../utils/azureUploader.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// Validation schema for category
const categoryValidationSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  type: yup.string().optional("Category Type is required"),
  status: yup.boolean().required("status is required")
});

async function uploadData(file) {
  const filePath = path.resolve(__dirname, "../../../", file.path);
  const fileBuffer = fs.readFileSync(filePath);

  try {
    const imageUrl = await uploadImageToAzure(fileBuffer, file.originalname);
    return imageUrl;
  } finally {
    // 🧹 Always clean up the file — even if upload fails
    fs.unlink(filePath, err => {
      if (err) console.error("Failed to delete local file:", err);
    });
  }
}
/**
 * Get all categories with pagination and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getCategories = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { search } = req.query;

    // Build query
    const query = {};

    // Text search (case-insensitive)
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { slug: { $regex: search, $options: "i" } }];
    }

    // Get total count for pagination
    const totalCount = await Category.countDocuments(query);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    if (skip >= totalCount) {
      return res.status(400).json({ message: "No more records found" });
    }

    // Fetch categories with pagination
    const categories = await Category.find(query).skip(skip).limit(limit).sort({ createdAt: -1 });

    const response = categories.map(item => ({
      _id: item._id,
      name: item.name,
      icon: item.icon,
      image: item.image,
      type: item.type,
      slug: item.slug,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    const pagination = {
      currentPage: page,
      limit,
      totalPages,
      totalRecords: totalCount
    };

    return res.status(200).json(GetApiResponse(200, response, pagination, "Categories fetched successfully"));
  } catch (error) {
    console.error("Error in getCategories:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

export const fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find({ type: "Courses", status: true })
      .select("_id name")
      .sort({ createdAt: -1 });

    return res.status(200).json(ApiResponse(200, categories, "Categories fetched successfully"));
  } catch (error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

/**
 * Get a single category by ID with all populated data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getOneCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid category ID format"
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found"
      });
    }

    const response = {
      _id: category._id,
      name: category.name,
      icon: category.icon,
      image: category.image,
      type: category.type,
      status: category.status,
      slug: category.slug,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    return res.status(200).json(ApiResponse(200, response, "Categories fetched successfully"));
  } catch (error) {
    console.error("Error in getOneCategory:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

/**
 * Create a new category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createCategory = async (req, res) => {
  try {
    // Validate request body
    await categoryValidationSchema.validate(req.body);

    const { name, status, type } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    // Create new category
    const newCategory = new Category({
      name,
      status,
      type
    });

    await newCategory.save();

    return res.status(200).json(ApiResponse(200, newCategory, "Categories created successfully"));
  } catch (error) {
    console.error("Error in createCategory:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.message
    });
  }
};

/**
 * Update an existing category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate request body
    await categoryValidationSchema.validate(req.body);

    const { name, status, type } = req.body;

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if new name conflicts with existing categories
    if (name !== existingCategory.name) {
      const nameExists = await Category.findOne({ name, _id: { $ne: id } });
      if (nameExists) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
    }

    let updateData = {
      name,
      status,
      type
    };

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(id, updateData, {
      new: true
    });

    return res.status(200).json(ApiResponse(200, updatedCategory, "Category updated successfully"));
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.errors?.[0] || error.message
    });
  }
};

/**
 * Delete a category (soft delete)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }


    await Category.findByIdAndDelete(id);

    return res.status(200).json(ApiResponse(200, {}, "Category deleted successfully"));
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message
    });
  }
};

export default {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getOneCategory,
  fetchCategories
};
