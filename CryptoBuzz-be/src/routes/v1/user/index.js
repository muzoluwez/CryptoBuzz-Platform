import express from "express";
import insightRoutes from "./insight.routes.js";
import cryptoRoutes from "./crypto.routes.js";
import socialRoutes from "./social.routes.js";
import ideaRoutes from "./idea.routes.js"
import authRoutes from "./auth.routes.js"
import scheduleRoutes from "./schedule.routes.js"
import categoryRoutes from "./category.routes.js"
import educatorRoutes from "./educator.routes.js"

const router = express.Router();


router.use("/auth", authRoutes)
router.use("/idea", ideaRoutes)
router.use("/insight", insightRoutes);
router.use("/crypto", cryptoRoutes);
router.use("/social", socialRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/category", categoryRoutes);
router.use("/educator", educatorRoutes);

export default router;
