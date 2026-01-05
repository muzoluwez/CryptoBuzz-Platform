import express from "express";
import {
  createPaymentLink,
  handleHotmartWebhook,
  getUserPurchases,
  checkCourseAccess,
} from "../../../controllers/common/payment.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

// Webhook endpoint (no auth required - Hotmart calls this directly)
router.post("/webhook/hotmart", handleHotmartWebhook);

// Get user's purchases (authenticated)
router.get("/purchases", Auth.CommonAuth, getUserPurchases);

// Check course access (authenticated)
router.get("/access/course/:courseId", Auth.CommonAuth, checkCourseAccess);

// Create payment link (authenticated)
router.post("/checkout", Auth.CommonAuth, createPaymentLink);

export default router;

