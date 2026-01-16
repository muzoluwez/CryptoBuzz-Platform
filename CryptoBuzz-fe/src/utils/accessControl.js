/**
 * Common Access Control Utility
 * 
 * This utility provides a centralized, reusable way to handle access control
 * across different content types: Courses, Trade Analysis, Trade Ideas, Crypto Projects, Live Streams
 * 
 * @param {Object} options - Access control options
 * @param {string} options.tier - Content tier: "PUBLIC" | "LOGGED_IN" | "UID_ONLY" | "PRO"
 * @param {boolean} options.isAuthenticated - Whether user is authenticated
 * @param {string|null} options.userUid - User's UID (if available)
 * @param {boolean} options.hasPurchase - Whether user has purchased/accessed the content (for PRO tier)
 * @param {boolean} [options.isPremium=false] - Whether content is premium (legacy support)
 * 
 * @returns {Object} Access control result
 * @returns {boolean} hasAccess - Whether user has access
 * @returns {string|null} lockReason - Reason why content is locked (null if unlocked)
 * @returns {string} lockMessage - User-friendly lock message
 * @returns {boolean} showLock - Whether to show lock overlay
 */
export function checkAccess({ tier, isAuthenticated, userUid, hasPurchase, isPremium = false }) {
  // Default values
  let hasAccess = false;
  let lockReason = null;
  let lockMessage = "";
  let showLock = false;

  // Handle tier-based access
  if (!tier || tier === "PUBLIC") {
    // PUBLIC: Everyone has access, no lock
    hasAccess = true;
    lockReason = null;
    lockMessage = "";
    showLock = false;
  } else if (tier === "LOGGED_IN") {
    // LOGGED_IN: Visible to everyone but locked unless logged in
    showLock = true;
    if (isAuthenticated) {
      hasAccess = true;
      lockReason = null;
      lockMessage = "";
    } else {
      hasAccess = false;
      lockReason = "LOGIN_REQUIRED";
      lockMessage = "Login required to access this content";
    }
  } else if (tier === "UID_ONLY") {
    // UID_ONLY: Visible but locked unless user has valid UID
    showLock = true;
    if (isAuthenticated && userUid) {
      hasAccess = true;
      lockReason = null;
      lockMessage = "";
    } else {
      hasAccess = false;
      if (!isAuthenticated) {
        lockReason = "LOGIN_REQUIRED";
        lockMessage = "Login required to access this content";
      } else {
        lockReason = "UID_REQUIRED";
        lockMessage = "Valid UID required to access this content";
      }
    }
  } else if (tier === "PRO") {
    // PRO: Paid content - locked until purchased
    showLock = true;
    isPremium = true; // Ensure isPremium is true for PRO tier
    if (hasPurchase) {
      hasAccess = true;
      lockReason = null;
      lockMessage = "";
    } else {
      hasAccess = false;
      lockReason = "PURCHASE_REQUIRED";
      lockMessage = "Purchase required to access this content";
    }
  } else {
    // Unknown tier - default to locked
    showLock = true;
    hasAccess = false;
    lockReason = "UNKNOWN_TIER";
    lockMessage = "Access restricted";
  }

  return {
    hasAccess,
    lockReason,
    lockMessage,
    showLock,
    isPremium: tier === "PRO" || isPremium,
  };
}

/**
 * Get lock button text based on tier and access status
 */
export function getLockButtonText(tier, hasAccess) {
  if (hasAccess) {
    return "Access Granted";
  }

  switch (tier) {
    case "LOGGED_IN":
      return "Login to Access";
    case "UID_ONLY":
      return "Get Access";
    case "PRO":
      return "Purchase to Access";
    default:
      return "Get Access";
  }
}

/**
 * Get lock icon based on tier
 */
export function getLockIcon(tier) {
  switch (tier) {
    case "LOGGED_IN":
      return "🔐"; // Lock with key
    case "UID_ONLY":
      return "🔑"; // Key
    case "PRO":
      return "💳"; // Credit card
    default:
      return "🔒"; // Lock
  }
}
