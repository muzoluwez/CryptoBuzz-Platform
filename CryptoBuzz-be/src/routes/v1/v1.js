import express from "express";
const router = express.Router();
import commonRoute from "./common/index.js";

router.use("/common", commonRoute);

export default router;
