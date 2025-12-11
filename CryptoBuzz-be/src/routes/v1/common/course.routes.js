import express from "express";
import {
  getCourses,
  getOneCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  reorderCourses,
} from "../../../controllers/common/course.js";

import Auth  from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";


const router = express.Router();

// Get all courses with filters
router.get("/", Auth.CommonAuth, getCourses);

// Reorder courses
router.put("/reorder", Auth.CommonAuth, reorderCourses);

// Get single course by ID
router.get("/:id", Auth.CommonAuth, getOneCourse);

// Create a new course
router.post("/", upload.single("image"), Auth.CommonAuth, createCourse);

// Update a course
router.put("/:id", upload.single("image"), Auth.CommonAuth, updateCourse);

// Delete (hard delete) course
router.delete("/:id", Auth.CommonAuth, deleteCourse);

export default router;
