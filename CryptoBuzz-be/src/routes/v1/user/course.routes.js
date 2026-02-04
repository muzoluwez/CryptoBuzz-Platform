import express from "express";
import { CourseBasedOnSection, getCourseProgress, markLectureComplete, undoLectureComplete } from "../../../controllers/user/course.js";
import Auth, { UserAuth } from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/get", CourseBasedOnSection);
router.get("/course-progress/:courseId", UserAuth, getCourseProgress);
router.post("/course-progress/complete", UserAuth, markLectureComplete);
router.post("/course-progress/undo", UserAuth, undoLectureComplete);
export default router;