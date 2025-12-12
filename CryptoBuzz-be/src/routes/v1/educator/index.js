import express from "express";
const router = express.Router();
import LiveStreamRoutes from "./liveSteam.routes.js";

router.use("/live-stream", LiveStreamRoutes);

export default router;
