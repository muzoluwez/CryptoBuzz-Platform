import express from "express";
import {
  getSections,
  getOneSection,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "../../../controllers/admin/section.js";

import  Auth  from "../../../middlewares/auth.js";

const router = express.Router();

// Get all sections
router.get("/", Auth.CommonAuth, getSections);

// Reorder sections
router.put("/reorder", Auth.CommonAuth, reorderSections);

// Get a single section by ID
router.get("/:id", Auth.CommonAuth, getOneSection);

// Create a new section
router.post("/", Auth.CommonAuth, createSection);

// Update a section
router.put("/:id", Auth.CommonAuth, updateSection);

// Delete a section
router.delete("/:id", Auth.CommonAuth, deleteSection);

export default router;
