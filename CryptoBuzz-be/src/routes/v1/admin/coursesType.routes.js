import express from "express";
import {
  getCourseTypeList,
  getCourseType,
  createCourseType,
  updateCourseType,
  deleteCourseType
} from "../../../controllers/admin/coursesType.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

// Admin Course Type Routes
router.get("/list", Auth.AdminAuth, getCourseTypeList);
router.get("/", Auth.CommonAuth, getCourseType);
router.post("/", Auth.AdminAuth, createCourseType);
router.put("/:id", Auth.AdminAuth, updateCourseType);
router.delete("/:id", Auth.AdminAuth, deleteCourseType);

export default router;
