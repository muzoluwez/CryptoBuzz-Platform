import express from "express";
const router = express.Router();
import commonRoute from "./common/index.js";
import AdminRoute from "./admin/index.js";
import EducatorRoute from "./educator/index.js";

router.use("/common", commonRoute);
router.use("/admin", AdminRoute);
router.use("/educator", EducatorRoute);

export default router;
