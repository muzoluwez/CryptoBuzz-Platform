import express from "express";
const router = express.Router();

import healthcheckRoute from "./healthcheck.routes.js";

router.use("/healthCheck", healthcheckRoute);

export default router;

