import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';
import { checkAccess } from '@/utils/accessControl';
import { useGetPurchasedPlanIdsQuery } from '@/store/client/clientPaymentApiSlice';

/**
 * Universal hook for access control across all content types
 * Works with Courses, Trade Analysis, Trade Ideas, Crypto Projects, Social Feed, Live Streams
 * 
 * Global Plan-Based Access:
 * - Fetches user's purchased plan IDs
 * - Checks if content.plans array contains any purchased plan
 * - If yes, grants access (global access across all modules)
 * 
 * @param {Object} content - Content object with tier and plans information
 * @param {string} content.tier - Content tier: "PUBLIC" | "LOGGED_IN" | "UID_ONLY" | "PRO"
 * @param {string} content.accessType - Alternative tier field (for Trade Ideas, Trade Analysis, etc.)
 * @param {Array} content.plans - Array of plan IDs associated with this content
 * @param {boolean} content.hasPurchase - Whether user has purchased/accessed (for PRO tier) - optional override
 * @param {string} [contentId] - Optional content ID for API-based access checks (courses only)
 * @param {Object} [accessData] - Optional access data from API (from batch check or single check) - courses only
 * 
 * @returns {Object} Access control result
 */
export function useAccessControlContent(content = {}, contentId = null, accessData = null) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Fetch purchased plan IDs for global plan-based access checking
  const { data: purchasedPlansData, isLoading: isLoadingPlans } = useGetPurchasedPlanIdsQuery(
    undefined,
    {
      skip: !isAuthenticated, // Only fetch if authenticated
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
    }
  );

  const purchasedPlanIds = useMemo(() => {
    if (!purchasedPlansData?.data?.planIds) return new Set();
    return new Set(purchasedPlansData.data.planIds);
  }, [purchasedPlansData]);

  // Get user UID from user object
  // UID might be in user.uid or user.credential?.uid depending on user model structure
  const userUid = useMemo(() => {
    if (!user) return null;
    return user.uid || user.credential?.uid || null;
  }, [user]);

  // Determine tier from content or accessData
  const tier = content?.tier || accessData?.courseTier || content?.accessType || "PUBLIC";

  // Get content plans array (normalize to string IDs)
  const contentPlans = useMemo(() => {
    if (!content?.plans) return [];
    return content.plans
      .map((p) => (p?._id || p)?.toString())
      .filter(Boolean);
  }, [content?.plans]);

  // Determine purchase status with global plan-based access
  // Priority: 1. Explicit hasPurchase, 2. API accessData, 3. Global plan check
  const hasPurchase = useMemo(() => {
    // Explicit override
    if (content?.hasPurchase !== undefined) {
      return content.hasPurchase;
    }

    // For courses, use API access data (most reliable)
    if (accessData?.purchase || (accessData?.hasAccess && tier === "PRO")) {
      return true;
    }

    // Global plan-based access: Check if any content plan is in purchased plans
    if (tier === "PRO" && contentPlans.length > 0 && purchasedPlanIds.size > 0) {
      for (const planId of contentPlans) {
        if (purchasedPlanIds.has(planId)) {
          return true; // User has purchased a plan that includes this content
        }
      }
    }

    return false;
  }, [
    content?.hasPurchase,
    accessData?.purchase,
    accessData?.hasAccess,
    tier,
    contentPlans,
    purchasedPlanIds,
  ]);

  // Use access control utility
  const accessResult = useMemo(() => {
    return checkAccess({
      tier,
      isAuthenticated,
      userUid,
      hasPurchase,
      isPremium: tier === "PRO" || content?.isPremium || accessData?.isPremium || false,
    });
  }, [tier, isAuthenticated, userUid, hasPurchase, content?.isPremium, accessData?.isPremium]);

  return {
    ...accessResult,
    tier,
    user,
    userUid,
    isAuthenticated,
    isLoadingPlans, // Useful for showing loading states
    purchasedPlanIds: Array.from(purchasedPlanIds), // Convert to array for easy use
  };
}
