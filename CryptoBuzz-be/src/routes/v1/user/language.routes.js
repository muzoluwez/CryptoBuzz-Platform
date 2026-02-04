import express from "express";
import { getLanguageList } from "../../../controllers/user/language.js";

const router = express.Router();

// GET /api/v1/user/language - Get all active languages
router.get("/", getLanguageList);

export default router;
