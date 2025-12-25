import express from "express";
import { getInsights } from "../../../controllers/user/insight.js";

const router = express.Router();

router.get("/",  getInsights);

export default router;
