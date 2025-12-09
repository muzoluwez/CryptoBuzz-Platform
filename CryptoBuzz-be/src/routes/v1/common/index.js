import express from "express";
const router = express.Router();

import AuthRoute from "./auth.routes.js";
import IdeaRoute from "./idea.routes.js";
import healthcheckRoute from "./healthcheck.routes.js";

router.use("/auth", AuthRoute);
router.use("/idea", IdeaRoute);
router.use("/healthCheck", healthcheckRoute);

export default router;

