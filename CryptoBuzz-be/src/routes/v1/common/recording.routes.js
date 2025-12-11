import express from "express";
import {
  createPermanentRecording,
  createTemporaryRecording,
  createManuallyRecording,
  getRecordings,
  getRecordingById,
  updateRecording,
  deleteRecording,
  streamVideo
} from "../../../controllers/common/recording.js";
import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Create recordings
router.post("/permanent", Auth.CommonAuth, createPermanentRecording);
router.post("/temporary", Auth.CommonAuth, createTemporaryRecording);
router.post(
  "/manual",
  Auth.CommonAuth,
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 }
  ]),
  createManuallyRecording
);

// Get recordings
router.get("/", Auth.CommonAuth, getRecordings);
router.get("/:id", Auth.CommonAuth, getRecordingById);

// Update & delete
router.put("/:id", Auth.CommonAuth, upload.single("thumbnail"), updateRecording);
router.delete("/:id", Auth.CommonAuth, deleteRecording);

// Stream video
router.get("/stream/:id", streamVideo);

export default router;
