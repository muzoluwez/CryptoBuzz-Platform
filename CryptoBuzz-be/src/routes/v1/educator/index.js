import express from "express";
const router = express.Router();
import LiveStreamRoutes from "./liveSteam.routes.js";
import RatingRoutes from "./rating.routes.js";

router.use("/live-stream", LiveStreamRoutes);
router.use("/rating", RatingRoutes);

export default router;
