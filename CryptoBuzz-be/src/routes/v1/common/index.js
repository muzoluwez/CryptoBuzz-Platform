import express from "express";
const router = express.Router();

import healthcheckRoute from "./healthcheck.routes.js";
import IdeaRoute from "./idea.routes.js";

router.use("/healthCheck", healthcheckRoute);
router.use("/idea", IdeaRoute);

export default router;

