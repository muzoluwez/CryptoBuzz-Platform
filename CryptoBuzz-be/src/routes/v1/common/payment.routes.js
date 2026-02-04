import express from "express";
import {
  createPaymentLink,
  handleHotmartWebhook,
  getUserPurchases,
  getUserPurchasedPlanIds,
  checkCourseAccess,
  batchCheckCourseAccess,
  getCoursePlans,
  getPlanCourses,
} from "../../../controllers/common/payment.js";
import Auth from "../../../middlewares/auth.js";

const router = express.Router();

// Webhook endpoint (no auth required - Hotmart calls this directly)
router.post("/webhook/hotmart", handleHotmartWebhook);

// Get user's purchases (authenticated - all users)
router.get("/purchases", Auth.UserAuth, getUserPurchases);

// Get user's purchased plan IDs (optional auth - for global access checking)
router.get("/purchased-plans", Auth.OptionalUserAuth, getUserPurchasedPlanIds);

// Batch check course access for multiple courses (optional auth - works without login)
router.post("/access/batch", Auth.OptionalUserAuth, batchCheckCourseAccess);

// Check course access for single course (optional auth - works without login)
router.get("/access/course/:courseId", Auth.OptionalUserAuth, checkCourseAccess);

// Get available plans for a course (authenticated - all users)
router.get("/course/:courseId/plans", Auth.UserAuth, getCoursePlans);

// Get courses included in a plan (authenticated - all users)
router.get("/plan/:planId/courses", Auth.UserAuth, getPlanCourses);

// Create payment link (authenticated - all users)
router.post("/checkout", Auth.UserAuth, createPaymentLink);

export default router;

