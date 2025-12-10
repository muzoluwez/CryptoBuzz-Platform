import express from "express";
const router = express.Router();

import AuthRoute from "./auth.routes.js";
import IdeaRoute from "./idea.routes.js";
import AnalysisRoute from "./tradeAnalysis.routes.js";
import socialPostRoute from "./socialPost.routes.js";
import scheduleRoute from "./schedule.routes.js";
import healthcheckRoute from "./healthcheck.routes.js";
import CourseRoute from "./course.routes.js";

router.use("/auth", AuthRoute);
router.use("/idea", IdeaRoute);
router.use("/trade-analysis", AnalysisRoute);
router.use("/social-post", socialPostRoute);
router.use("/course", CourseRoute);
router.use("/schedule", scheduleRoute);
router.use("/healthCheck", healthcheckRoute);

export default router;

