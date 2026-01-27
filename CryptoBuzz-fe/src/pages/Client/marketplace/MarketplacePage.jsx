import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import useDocumentTitle from '../../../hooks/use-document-title';
import { RecommendedCourseCard } from '../../../components/payment/RecommendedCourseCard';
import { useBatchCourseAccess } from '../../../hooks/use-batch-course-access';
import { useGetCoursesQuery } from '../../../store/client/clientCoursesApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../../store/authSlice';
import { selectSelectedLanguage } from '../../../store/languageSlice';

export default function MarketplacePage() {
  useDocumentTitle('Marketplace');
  const navigate = useNavigate();
  const [courseAccessMap, setCourseAccessMap] = useState({});
  const isCheckingAccessRef = useRef(false);

  // Get token from Redux state (primary) or localStorage (fallback)
  const tokenFromRedux = useSelector(selectCurrentToken);

  // Get selected language from Redux store
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const language = selectedLanguage?.name || 'English';

  // Fetch all courses
  const {
    data: coursesData,
    isLoading: coursesLoading,
    isFetching: coursesFetching,
  } = useGetCoursesQuery(
    {
      language: language,
      limit: 100, // Get a large number of courses
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  // Extract courses from API response
  const courses = useMemo(() => {
    if (!coursesData?.data) return [];
    return Array.isArray(coursesData.data) ? coursesData.data : [];
  }, [coursesData]);

  // Batch access hook for all courses
  const { checkAccess: checkBatchAccess, courseIds } = useBatchCourseAccess(courses);

  // Create a stable string key from courseIds for comparison
  const courseIdsKey = useMemo(() => {
    return courseIds.length > 0 ? courseIds.sort().join(',') : '';
  }, [courseIds]);

  // Batch check access when courseIds change (only when courses actually change)
  useEffect(() => {
    // Check token from Redux state OR localStorage/sessionStorage
    const token = tokenFromRedux || localStorage.getItem('token') || sessionStorage.getItem('token');

    // Debug logging
    console.log('🔍 Marketplace Batch Access Check Effect:', {
      courseIds,
      courseIdsKey,
      coursesCount: courses.length,
      isCheckingAccessRef: isCheckingAccessRef.current,
      hasToken: !!token,
      tokenSource: tokenFromRedux ? 'Redux' : (localStorage.getItem('token') ? 'localStorage' : 'none')
    });

    // Prevent duplicate calls
    if (isCheckingAccessRef.current) {
      console.log('⏸️ Skipping batch access check - already checking');
      return;
    }

    if (courseIds.length > 0) {
      // Always call API - RTK Query will handle token automatically via baseQuery
      // The API will return proper access data even if user is not authenticated (just all courses will show as locked)
      console.log('✅ Calling batch access API with courseIds:', courseIds);
      isCheckingAccessRef.current = true;
      checkBatchAccess().then((accessMap) => {
        console.log('✅ Batch access API response:', accessMap);
        if (accessMap && Object.keys(accessMap).length > 0) {
          setCourseAccessMap(accessMap);
        } else {
          console.warn('⚠️ Batch access API returned empty or invalid response');
        }
        isCheckingAccessRef.current = false;
      }).catch((error) => {
        console.error('❌ Error fetching batch access:', error);
        isCheckingAccessRef.current = false;
      });
    } else {
      console.log('⚠️ No courseIds available - clearing access map');
      // Clear access map if no courses
      setCourseAccessMap({});
      isCheckingAccessRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseIdsKey, tokenFromRedux]); // Use stable courseIdsKey instead of courseIds array

  // Handle course click - navigate to academy page with course ID
  const handleCourseClick = (course) => {
    const courseId = course?._id || course?.id;
    if (courseId) {
      navigate(`/client/academy?courseId=${courseId}`);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-200 mb-2">Marketplace</h1>
        <p className="text-gray-600 dark:text-gray-400">Explore all available courses</p>
      </div>

      {(coursesLoading || coursesFetching) ? (
        <div className="mt-6">
          <Card className="rounded-lg p-6 shadow-md text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading courses...</p>
          </Card>
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-6">
          <Card className="rounded-lg p-6 shadow-md text-center">
            <p className="text-gray-500">No courses available at the moment.</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {courses.map((course) => {
            return (
              <RecommendedCourseCard
                key={course?.id || course?._id}
                course={course}
                onCourseClick={handleCourseClick}
                accessMap={courseAccessMap}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
