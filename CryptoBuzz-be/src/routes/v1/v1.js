import express from "express";
const router = express.Router();
import commonRoute from "./common/index.js";
import AdminRoute from "./admin/index.js";

router.use("/common", commonRoute);
router.use("/admin", AdminRoute);

export default router;
