import express from "express";
import {
  createPaymentLink,
  handleHotmartWebhook,
  getUserPurchases,
  checkCourseAccess,
  batchCheckCourseAccess,
} from "../../../controllers/common/payment.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

// Webhook endpoint (no auth required - Hotmart calls this directly)
router.post("/webhook/hotmart", handleHotmartWebhook);

// Get user's purchases (authenticated - all users)
router.get("/purchases", Auth.UserAuth, getUserPurchases);

// Batch check course access for multiple courses (efficient - single API call)
router.post("/access/batch", Auth.UserAuth, batchCheckCourseAccess);

// Check course access for single course (authenticated - all users)
router.get("/access/course/:courseId", Auth.UserAuth, checkCourseAccess);

// Create payment link (authenticated - all users)
router.post("/checkout", Auth.UserAuth, createPaymentLink);

export default router;

