import express from "express";
import { CourseBasedOnSection } from "../../../controllers/user/course.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/get",Auth.verifyJWT, CourseBasedOnSection);

export default router;