import express from "express";
import { uploadEditorImage, deleteEditorImage } from "../../../controllers/common/editorImage.js";
import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Upload image for rich text editor
router.post(
  "/upload-image",
  Auth.CommonAuth,
  upload.single("image"),
  uploadEditorImage
);

// Delete image from Azure for rich text editor
router.delete(
  "/delete-image",
  Auth.CommonAuth,
  deleteEditorImage
);

export default router;
