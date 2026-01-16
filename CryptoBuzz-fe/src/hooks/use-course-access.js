import { useMemo } from 'react';
import { useCheckCourseAccessQuery } from '@/store/client/clientPaymentApiSlice';

/**
 * Hook to check if user has access to a course
 * @param {string} courseId - The course ID to check access for
 * @param {Object} course - Optional course object with tier/price info (can be null if info not available)
 * @returns {Object} { hasAccess: boolean, isLoading: boolean, isPremium: boolean }
 */
export function useCourseAccess(courseId, course = null) {
  // Determine if course is premium/paid from course object if available
  const isPremiumFromObject = useMemo(() => {
    if (!course) return null; // Unknown - need to check via API
    return course.tier === 'PREMIUM' || (course.price && course.price > 0);
  }, [course]);

  // Always check access via API if we have a courseId
  // The API will tell us if course is free (reason: "free_course") or premium (hasAccess: false means locked)
  const { data: accessData, isLoading } = useCheckCourseAccessQuery(
    courseId,
    {
      skip: !courseId, // Skip query if no courseId
      refetchOnMountOrArgChange: true, // Always refetch when component mounts or courseId changes
      refetchOnFocus: true, // Refetch when window regains focus
    }
  );

  // If no courseId, assume free and grant access
  if (!courseId) {
    return {
      hasAccess: true,
      isLoading: false,
      isPremium: false,
      isCheckingAccess: false,
    };
  }

  // If we can determine it's free from course object, grant access immediately (skip API call)
  if (isPremiumFromObject === false) {
    return {
      hasAccess: true,
      isLoading: false,
      isPremium: false,
      isCheckingAccess: false,
    };
  }

  // Determine if course is premium based on API response:
  // - If reason is "free_course", it's free
  // - If hasAccess is false (and not loading), it's premium (locked)
  // - If hasAccess is true and purchase exists, it's premium (unlocked) 
  // - If hasAccess is true but no purchase and no "free_course" reason, it's premium (already purchased or free)
  const reason = accessData?.data?.reason;
  const hasAccess = accessData?.data?.hasAccess === true;
  const purchase = accessData?.data?.purchase;

  let isPremium = false;
  
  // Determine premium status based on API response (API is source of truth)
  if (accessData?.data) {
    // We have API response - use it to determine premium status
    // Backend now returns isPremium field directly, use that if available
    if (accessData.data.isPremium !== undefined) {
      isPremium = accessData.data.isPremium;
    } else if (reason === 'free_course') {
      // API explicitly says it's free
      isPremium = false;
    } else if (hasAccess === false) {
      // No access = premium course that's locked
      isPremium = true;
    } else if (hasAccess === true && purchase) {
      // Has access with purchase = premium course (unlocked)
      isPremium = true;
    } else {
      // Has access, no purchase, no "free_course" reason = free course
      isPremium = false;
    }
  } else {
    // API hasn't responded yet - use course object if available
    // Priority: course object > wait for API (default to false)
    if (isPremiumFromObject === true) {
      isPremium = true; // Course object says premium, trust it
    } else if (isPremiumFromObject === false) {
      isPremium = false; // Course object says free, trust it
    } else {
      // Unknown from course object - wait for API response (don't show lock yet)
      isPremium = false;
    }
  }

  // Debug logging for Test course (remove in production)
  if (courseId === '695cf5de0051cbb712e2a36c' || course?.title === 'Test') {
    console.log('🔍 useCourseAccess Debug:', {
      courseId,
      courseTitle: course?.title,
      isPremiumFromObject,
      accessData,
      accessDataData: accessData?.data,
      reason,
      hasAccess,
      purchase: !!purchase,
      purchaseData: purchase,
      isPremium,
      isLoading,
      isCheckingAccess: !!courseId && isLoading
    });
  }

  return {
    hasAccess,
    isLoading: isLoading && !!courseId,
    isPremium,
    isCheckingAccess: !!courseId && isLoading,
    purchaseData: purchase || null,
  };
}

