import CourseTypeModel from "../../models/courseType.js";
import { ApiResponse, GetApiResponse } from "../../utils/ApiResponse.js";

// --------------------------------------------------
// GET ACTIVE COURSE TYPES (status = true)
// --------------------------------------------------
export const getCourseTypeList = async (req, res) => {
  try {
    const courseTypes = await CourseTypeModel.find({ status: true });

    if (!courseTypes.length) {
      return res.status(404).json({ message: "No course types found." });
    }

    const response = courseTypes.map(item => ({
      _id: item._id,
      name: item.name
    }));

    return res.status(200).json(ApiResponse(200, response, "Course types fetched successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// GET PAGINATED + SEARCHABLE COURSE TYPE LIST
// --------------------------------------------------
export const getCourseType = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const query = {
      isDelete: false,
      ...(search && { name: { $regex: search, $options: "i" } })
    };

    const totalCount = await CourseTypeModel.countDocuments(query);

    const courseTypes = await CourseTypeModel.find(query).skip(skip).limit(Number(limit));

    if (!courseTypes.length) {
      return res.status(404).json({ message: "No course types found." });
    }

    const pagination = {
      total: totalCount,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalCount / limit)
    };

    return res.status(200).json(GetApiResponse(200, courseTypes, pagination, "Course types fetched successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// CREATE NEW COURSE TYPE
// --------------------------------------------------
export const createCourseType = async (req, res) => {
  try {
    const { name, status } = req.body;

    const existingCourseType = await CourseTypeModel.findOne({ name });
    if (existingCourseType) {
      return res.status(400).json({ message: "Course type already exists." });
    }

    const newType = new CourseTypeModel({ name, status });
    await newType.save();

    return res.status(200).json(ApiResponse(200, newType, "Course type created successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// UPDATE COURSE TYPE
// --------------------------------------------------
export const updateCourseType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const courseType = await CourseTypeModel.findById(id);
    if (!courseType) {
      return res.status(400).json({ message: "Course type does not exist." });
    }

    if (name) courseType.name = name;
    if (status !== undefined) courseType.status = status;

    await courseType.save();
    return res.status(200).json(ApiResponse(200, courseType, "Course type updated successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --------------------------------------------------
// SOFT DELETE COURSE TYPE
// --------------------------------------------------
export const deleteCourseType = async (req, res) => {
  try {
    const { id } = req.params;

    const courseType = await CourseTypeModel.findById(id);
    if (!courseType) {
      return res.status(400).json({ message: "Course type does not exist." });
    }

    courseType.isDelete = true;
    courseType.status = false; // ❗ delete means inactive
    courseType.deleteAt = new Date();

    await courseType.save();
    return res.status(200).json(ApiResponse(200, {}, "Course type deleted successfully"));
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Default export (optional)
export default {
  getCourseTypeList,
  getCourseType,
  createCourseType,
  updateCourseType,
  deleteCourseType
};
