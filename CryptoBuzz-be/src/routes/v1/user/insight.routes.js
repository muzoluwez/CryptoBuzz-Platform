import express from "express";
import { getInsights } from "../../../controllers/user/insight.js";
import { verifyJWT } from "../../../middlewares/auth.js";

const router = express.Router();

router.get("/", verifyJWT, getInsights);

export default router;
