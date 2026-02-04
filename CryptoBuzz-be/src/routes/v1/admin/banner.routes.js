import express from "express";
import {
  getBannerList,
  getBanner,
  createBanner,
  updateBanner,
  deleteBanner
} from "../../../controllers/admin/banner.js";
import Auth from "../../../middlewares/auth.js";
import { upload } from "../../../middlewares/multer.js";

const router = express.Router();

// Get all active banners (for frontend display)
router.get("/list", getBannerList);

// Get paginated banners (for admin panel)
router.get("/", Auth.AdminAuth, getBanner);

// Create banner with both desktop and mobile images
router.post(
  "/",
  Auth.AdminAuth,
  upload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 }
  ]),
  createBanner
);

// Update banner by ID (can update images individually)
router.put(
  "/:id",
  Auth.AdminAuth,
  upload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 }
  ]),
  updateBanner
);

// Delete banner by ID
router.delete("/:id", Auth.AdminAuth, deleteBanner);

export default router;
