import express from "express";
import insightRoutes from "./insight.routes.js";
import cryptoRoutes from "./crypto.routes.js";
import socialRoutes from "./social.routes.js";
import ideaRoutes from "./idea.routes.js"

const router = express.Router();

router.use("/idea", ideaRoutes)
router.use("/insight", insightRoutes);
router.use("/crypto", cryptoRoutes);
router.use("/social", socialRoutes);

export default router;
