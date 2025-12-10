import express from "express";
import { cerateEducator, listEducator, updateEducator, deleteEducator } from "../../../controllers/admin/educators.js";
import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

router.get("/list", Auth.AdminAuth, listEducator);

router.post(
  "/create",
  Auth.AdminAuth,
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  cerateEducator
);

router.put(
  "/update/:id",
  Auth.AdminAuth,
  upload.fields([
    { name: "icon", maxCount: 1 },
    { name: "image", maxCount: 1 }
  ]),
  updateEducator
);

router.delete("/remove/:id", Auth.AdminAuth, deleteEducator);

// ------------------------------------------------------
// VALIDATION File
// ------------------------------------------------------

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File size cannot exceed 2MB" });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message });
  }

  next();
});

export default router;
