import express from "express";
import { fetchCategories } from "../../../controllers/admin/category.js";

const router = express.Router();

router.get("/fetch", fetchCategories);

export default router;