import { useMemo, useCallback } from 'react';
import { useBatchCheckCourseAccessMutation } from '@/store/client/clientPaymentApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '@/store/authSlice';
import { checkAccess } from '@/utils/accessControl';

/**
 * Hook to batch check access for multiple courses (efficient - single API call)
 * @param {Array} courses - Array of course objects with _id field
 * @returns {Object} { courseIds: Array, checkAccess: Function, isLoading: boolean }
 * 
 * accessMap structure: { [courseId]: { hasAccess: boolean, isPremium: boolean, purchase: Object|null } }
 */
export function useBatchCourseAccess(courses = []) {
  const [batchCheckAccess, { isLoading }] = useBatchCheckCourseAccessMutation();

  // Extract unique course IDs from courses array
  const courseIds = useMemo(() => {
    if (!Array.isArray(courses) || courses.length === 0) {
      console.log('⚠️ useBatchCourseAccess: No courses provided or empty array');
      return [];
    }
    const ids = courses
      .map(course => {
        const id = course?._id || course?.id;
        if (!id) {
          console.warn('⚠️ Course missing _id or id:', course);
        }
        return id;
      })
      .filter(Boolean)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
    
    console.log('🆔 useBatchCourseAccess: Extracted courseIds:', {
      coursesCount: courses.length,
      idsCount: ids.length,
      ids
    });
    
    return ids;
  }, [courses]);

  // Memoize the checkAccess function to prevent infinite loops
  const checkAccess = useCallback(async () => {
    if (courseIds.length === 0) {
      console.log('⚠️ checkAccess: No courseIds to check');
      return {};
    }

    try {
      console.log('📤 Calling batchCheckAccess API with:', {
        courseIds,
        url: '/common/payment/access/batch',
        fullUrl: `${import.meta.env.VITE_APP_API_URL || 'http://localhost:8000'}/api/v1/common/payment/access/batch`
      });
      
      // Pass courseIds array directly (not wrapped in object)
      // The RTK Query mutation will wrap it: body: { courseIds: [...] }
      const response = await batchCheckAccess(courseIds).unwrap();
      console.log('✅ batchCheckAccess API success:', response);
      return response?.data || {};
    } catch (error) {
      console.error('❌ Error checking batch course access:', {
        error,
        status: error?.status,
        data: error?.data,
        message: error?.message,
        courseIds
      });
      return {};
    }
  }, [courseIds, batchCheckAccess]);

  return {
    courseIds,
    checkAccess,
    isLoading,
  };
}

/**
 * Hook to get access info for a single course from a batch access map
 * @param {string} courseId - The course ID
 * @param {Object} accessMap - The access map from batch check
 * @param {Object} course - Optional course object with tier/price info
 * @returns {Object} { hasAccess: boolean, isPremium: boolean, purchase: Object|null, coursePrice: number, courseTier: string }
 */
export function useCourseAccessFromMap(courseId, accessMap = {}, course = null) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  // Get user UID
  const userUid = useMemo(() => {
    if (!user) return null;
    return user.uid || user.credential?.uid || null;
  }, [user]);

  return useMemo(() => {
    if (!courseId) {
      return {
        hasAccess: true,
        isPremium: false,
        purchase: null,
        coursePrice: 0,
        courseTier: 'PUBLIC',
        lockReason: null,
        lockMessage: '',
        showLock: false,
      };
    }

    // Check if we have access data from batch API
    const accessData = accessMap[courseId];

    // Get tier from accessData or course object
    const tier = accessData?.courseTier || course?.tier || 'PUBLIC';

    if (accessData) {
      // We have batch API data - use access control utility to determine lock messages
      const accessResult = checkAccess({
        tier,
        isAuthenticated,
        userUid,
        hasPurchase: accessData.hasAccess === true && !!accessData.purchase,
        isPremium: accessData.isPremium || false,
      });

      return {
        hasAccess: accessResult.hasAccess,
        isPremium: accessResult.isPremium,
        purchase: accessData.purchase || null,
        coursePrice: accessData.coursePrice ?? (course?.price || 0),
        courseTier: tier,
        lockReason: accessResult.lockReason,
        lockMessage: accessResult.lockMessage,
        showLock: accessResult.showLock,
      };
    }

    // No batch data yet - use access control utility with course object data
    const accessResult = checkAccess({
      tier,
      isAuthenticated,
      userUid,
      hasPurchase: false,
      isPremium: tier === 'PRO' || (course?.price && course.price > 0),
    });

    return {
      hasAccess: accessResult.hasAccess,
      isPremium: accessResult.isPremium,
      purchase: null,
      coursePrice: course?.price || 0,
      courseTier: tier,
      lockReason: accessResult.lockReason,
      lockMessage: accessResult.lockMessage,
      showLock: accessResult.showLock,
    };
  }, [courseId, accessMap, course, isAuthenticated, userUid]);
}

