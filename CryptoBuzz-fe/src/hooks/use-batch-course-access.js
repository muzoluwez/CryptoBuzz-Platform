import { useMemo, useCallback } from 'react';
import { useBatchCheckCourseAccessMutation } from '@/store/client/clientPaymentApiSlice';

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
  return useMemo(() => {
    if (!courseId) {
      return {
        hasAccess: true,
        isPremium: false,
        purchase: null,
        coursePrice: 0,
        courseTier: 'FREE',
      };
    }

    // Check if we have access data from batch API
    const accessData = accessMap[courseId];

    if (accessData) {
      // We have batch API data - use it
      return {
        hasAccess: accessData.hasAccess === true,
        isPremium: accessData.isPremium === true,
        purchase: accessData.purchase || null,
        coursePrice: accessData.coursePrice ?? (course?.price || 0),
        courseTier: accessData.courseTier ?? (course?.tier || 'FREE'),
      };
    }

    // No batch data yet - try to determine from course object
    const isPremiumFromObject = course 
      ? (course.tier === 'PREMIUM' || (course.price && course.price > 0))
      : false;

    // If course object says it's free, grant access
    if (isPremiumFromObject === false) {
      return {
        hasAccess: true,
        isPremium: false,
        purchase: null,
        coursePrice: course?.price || 0,
        courseTier: course?.tier || 'FREE',
      };
    }

    // Unknown status - assume locked if premium, or default to accessible
    return {
      hasAccess: !isPremiumFromObject,
      isPremium: isPremiumFromObject,
      purchase: null,
      coursePrice: course?.price || 0,
      courseTier: course?.tier || 'FREE',
    };
  }, [courseId, accessMap, course]);
}

