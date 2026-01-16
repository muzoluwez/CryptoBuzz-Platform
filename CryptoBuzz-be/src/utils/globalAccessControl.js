import CoursePurchase from "../models/coursePurchase.js";
import UserCredential from "../models/userCredential.js";

/**
 * Global Access Control Utility
 * 
 * This utility provides a unified way to check access across all content types:
 * - Courses (uses tier field)
 * - Trade Ideas (uses accessType field)
 * - Trade Analysis (uses accessType field)
 * - Crypto Projects (uses accessType field)
 * - Social Feed (uses tier field)
 * - Live Streams (uses tier field)
 * 
 * All content types can be associated with plans, and plan-based access works globally.
 * If a user purchases a plan, they get access to ALL content (across all modules) associated with that plan.
 * 
 * @param {Object} params - Access check parameters
 * @param {Object} params.content - Content object (Course, Idea, TradeAnalysis, CryptoAnalysis, Post, Schedule, LiveStream)
 * @param {string} params.contentType - Type of content: 'course' | 'idea' | 'tradeAnalysis' | 'cryptoAnalysis' | 'post' | 'schedule' | 'liveStream'
 * @param {string} params.userId - User ID (optional - can be null for public access)
 * @param {Object} params.purchasedPlanIds - Set of purchased plan IDs (optional - will be fetched if not provided)
 * 
 * @returns {Object} Access check result
 * @returns {boolean} hasAccess - Whether user has access
 * @returns {string} reason - Reason for access/denial
 * @returns {boolean} isPremium - Whether content is premium/paid
 */
export async function checkGlobalAccess({ content, contentType, userId = null, purchasedPlanIds = null }) {
  // Normalize tier/accessType - some models use 'tier', others use 'accessType'
  const tier = content?.tier || content?.accessType || "PUBLIC";
  
  // Get plans - some models use 'plans' array, others might have different structures
  const contentPlans = content?.plans || [];

  // PUBLIC: Everyone has access
  if (!tier || tier === "PUBLIC") {
    return {
      hasAccess: true,
      reason: "public_content",
      isPremium: false,
    };
  }

  // If no user, deny access for non-PUBLIC content
  if (!userId) {
    return {
      hasAccess: false,
      reason: "login_required",
      isPremium: tier === "PRO",
    };
  }

  // Fetch user UID if needed
  let userUid = null;
  if (tier === "UID_ONLY") {
    const userCredential = await UserCredential.findById(userId).select("uid");
    userUid = userCredential?.uid || null;
  }

  // LOGGED_IN: User must be authenticated (we already checked userId exists)
  if (tier === "LOGGED_IN") {
    return {
      hasAccess: true,
      reason: "logged_in_access",
      isPremium: false,
    };
  }

  // UID_ONLY: User must have a valid UID
  if (tier === "UID_ONLY") {
    const hasAccess = !!userUid;
    return {
      hasAccess,
      reason: hasAccess ? "uid_access" : "uid_required",
      isPremium: false,
    };
  }

  // PRO: Paid content - check plan-based access
  if (tier === "PRO") {
    // Fetch purchased plan IDs if not provided
    if (!purchasedPlanIds) {
      const purchases = await CoursePurchase.find({
        user: userId,
        status: "approved",
        accessGranted: true,
        plan: { $exists: true, $ne: null },
      }).select("plan");

      purchasedPlanIds = new Set(
        purchases
          .map((p) => p.plan?.toString())
          .filter(Boolean)
      );
    }

    // Check if content has any plans
    const contentPlanIds = contentPlans
      .map((p) => (p?._id || p)?.toString())
      .filter(Boolean);

    // If no plans associated with content, deny access
    if (contentPlanIds.length === 0) {
      return {
        hasAccess: false,
        reason: "no_plans_configured",
        isPremium: true,
      };
    }

    // Check if user has purchased any plan associated with this content
    let hasAccess = false;
    for (const planId of contentPlanIds) {
      if (purchasedPlanIds.has(planId)) {
        hasAccess = true;
        break;
      }
    }

    return {
      hasAccess,
      reason: hasAccess ? "plan_access" : "purchase_required",
      isPremium: true,
    };
  }

  // Unknown tier - default to denying access
  return {
    hasAccess: false,
    reason: "unknown_tier",
    isPremium: false,
  };
}

/**
 * Batch check access for multiple content items
 * More efficient than checking individually
 * 
 * @param {Array} items - Array of content items
 * @param {string} contentType - Type of content (same for all items)
 * @param {string} userId - User ID
 * @returns {Object} Map of contentId -> access result
 */
export async function batchCheckGlobalAccess(items, contentType, userId = null) {
  // Fetch all purchased plan IDs once
  let purchasedPlanIds = new Set();
  if (userId) {
    const purchases = await CoursePurchase.find({
      user: userId,
      status: "approved",
      accessGranted: true,
      plan: { $exists: true, $ne: null },
    }).select("plan");

    purchasedPlanIds = new Set(
      purchases
        .map((p) => p.plan?.toString())
        .filter(Boolean)
    );
  }

  // Fetch user UID if needed
  let userUid = null;
  const needsUid = items.some(
    (item) => (item?.tier || item?.accessType) === "UID_ONLY"
  );
  if (userId && needsUid) {
    const userCredential = await UserCredential.findById(userId).select("uid");
    userUid = userCredential?.uid || null;
  }

  // Check access for each item
  const accessMap = {};
  for (const item of items) {
    const itemId = item?._id?.toString() || item?.id?.toString();
    if (!itemId) continue;

    const result = await checkGlobalAccess({
      content: item,
      contentType,
      userId,
      purchasedPlanIds,
    });

    accessMap[itemId] = result;
  }

  return accessMap;
}
