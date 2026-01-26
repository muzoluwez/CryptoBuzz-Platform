import express from "express";
const router = express.Router();

import AuthRoute from "./auth.routes.js";
import DashboardRoute from "./dashboard.routes.js";
import IdeaRoute from "./idea.routes.js";
import AnalysisRoute from "./tradeAnalysis.routes.js";
import socialPostRoute from "./socialPost.routes.js";
import scheduleRoute from "./schedule.routes.js";
import CourseRoute from "./course.routes.js";
import LectureRoute from "./lecture.routes.js";
import RecordingRoute from "./recording.routes.js";
import CryptoAnalysisRoute from "./cryptoAnalysis.routes.js";
import StreamRoute from "./stream.routes.js";
import healthcheckRoute from "./healthcheck.routes.js";
import PaymentRoute from "./payment.routes.js";
import HotmartRoute from "./hotmart.routes.js";
import EditorImageRoute from "./editorImage.routes.js";

router.use("/auth", AuthRoute);
router.use("/dashboard", DashboardRoute);
router.use("/idea", IdeaRoute);
router.use("/trade-analysis", AnalysisRoute);
router.use("/social-post", socialPostRoute);
router.use("/course", CourseRoute);
router.use("/schedule", scheduleRoute);
router.use("/lecture", LectureRoute);
router.use("/recording", RecordingRoute);
router.use("/crypto-analysis", CryptoAnalysisRoute);
router.use("/stream", StreamRoute);
router.use("/healthCheck", healthcheckRoute);
router.use("/payment", PaymentRoute);
router.use("/hotmart", HotmartRoute);
router.use("/editor", EditorImageRoute);

export default router;

