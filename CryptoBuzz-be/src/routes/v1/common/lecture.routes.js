import express from "express";
import {
  getLectures,
  getOneLecture,
  createLecture,
  updateLecture,
  deleteLecture,
  reorderLectures
} from "../../../controllers/common/lecture.js";

import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Get all lectures with filters
router.get("/", Auth.CommonAuth, getLectures);

// Reorder lectures
router.put("/reorder", Auth.CommonAuth, reorderLectures);

// Get single lecture by ID
router.get("/:id", Auth.CommonAuth, getOneLecture);

// Create new lecture
router.post("/", Auth.CommonAuth, createLecture);

// Update lecture
router.put(
  "/:id",
  Auth.CommonAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  updateLecture
);

// Delete lecture
router.delete("/:id", Auth.CommonAuth, deleteLecture);

export default router;
