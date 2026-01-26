import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useCourseAccessFromMap } from '@/hooks/use-batch-course-access';
import { PlanSelectionModal } from './PlanSelectionModal';
import { toast } from 'sonner';
import { convertRtkEditorToFormattedPlainText } from '@/lib/rtkEditorUtils';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { selectIsAuthenticated } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '../ui/dialog';
import { UidRequired } from '../common/access-states/UidRequired';
import { useLazyGetCoursePlansQuery } from '@/store/client/clientPaymentApiSlice';

/**
 * RecommendedCourseCard Component
 * Displays a course card with lock overlay if not purchased
 * @param {Object} course - Course object
 * @param {Function} onCourseClick - Callback when course is clicked
 * @param {Object} accessMap - Batch access map from parent (optional, for efficient checking)
 */
export function RecommendedCourseCard({ course, onCourseClick, accessMap = {} }) {
  const courseId = course?._id || course?.id;
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalPlans, setModalPlans] = useState([]);
  const [showUidModal, setShowUidModal] = useState(false);
  
  // Use RTK Query lazy hook to fetch plans
  const [triggerGetPlans] = useLazyGetCoursePlansQuery();

  // Get course access from batch access map (efficient)
  const { hasAccess, isPremium, coursePrice, courseTier, lockReason, lockMessage, showLock } = useCourseAccessFromMap(
    courseId,
    accessMap,
    course
  );

  // Handle lock icon click - Determine which action to take based on access type
  const handleLockClick = async (e) => {
    // Stop propagation to prevent card click
    e.stopPropagation();

    if (!courseId) {
      toast.error('Course ID is required');
      return;
    }

    // Determine the access type and take appropriate action
    // 1. Login Required - Navigate to login page
    if (lockReason === 'LOGIN_REQUIRED' || (courseTier === 'PRO' && !isAuthenticated)) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // 2. UID Required - Show UID modal
    if (lockReason === 'UID_REQUIRED') {
      setShowUidModal(true);
      return;
    }

    // 3. Purchase Required (Paid content) - ALWAYS show plan modal
    if (lockReason === 'PURCHASE_REQUIRED' || courseTier === 'PRO') {
      console.log('🔄 RecommendedCourseCard: Fetching plans for course:', courseId);

      try {
        // Use RTK Query to fetch plans
        console.log('📡 RecommendedCourseCard: Calling plans API via RTK Query for course:', courseId);
        
        const plansResult = await triggerGetPlans(courseId).unwrap();
        const fetchedPlans = plansResult?.data?.plans || plansResult?.plans || [];

        console.log('✅ Plans fetched:', {
          fetchedPlans,
          count: fetchedPlans.length,
          plansResult,
          courseId
        });

        // ALWAYS show modal - even for single plan (user requirement)
        if (fetchedPlans.length > 0) {
          console.log('✅ Plans detected - opening modal', {
            plansCount: fetchedPlans.length,
            plans: fetchedPlans
          });
          setModalPlans(fetchedPlans);
          setShowPlanModal(true);
          return;
        }

        // No plans found - show error
        console.warn('⚠️ No plans found for course', { courseId });
        toast.error('No payment plans available for this course');
      } catch (error) {
        console.error('Error fetching plans:', error);
        const errorMessage = error?.data?.message || error?.message || 'Failed to fetch payment plans';
        toast.error(errorMessage);
      }
    }
  };

  // Handle card click
  const handleCardClick = () => {
    if (showLock && !hasAccess) {
      // Show lock overlay or login/purchase option instead of navigating
      return;
    }

    // Course is accessible, navigate to it
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  // Show lock if: course has a lock requirement AND no access
  const isLocked = showLock && !hasAccess;

  // Debug logging for all courses to help identify issues
  useEffect(() => {
    console.log('🎴 RecommendedCourseCard:', {
      courseId,
      courseTitle: course?.title,
      hasAccess,
      isPremium,
      isLocked,
      coursePrice,
      courseTier: courseTier || course?.tier,
      lockReason,
      lockMessage,
      showLock,
      coursePriceFromObj: course?.price,
      accessMapData: accessMap[courseId],
      courseObject: {
        tier: course?.tier,
        price: course?.price,
        hotmartProductId: course?.hotmartProductId
      }
    });
  }, [courseId, course?.title, hasAccess, isPremium, isLocked, coursePrice, courseTier, lockReason, lockMessage, showLock, course?.tier, course?.price, accessMap]);

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔔 RecommendedCourseCard Modal State:', {
      showPlanModal,
      modalPlansCount: modalPlans.length,
      courseId,
      courseTitle: course?.title
    });
  }, [showPlanModal, modalPlans.length, courseId, course?.title]);

  return (
    <Card
      className={`relative bg-white dark:bg-gray-950 0 p-3 border-gray-200 dark:border-gray-800 text-white overflow-hidden group transition-all ${isLocked ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
        }`}
      onClick={handleCardClick}
    >
      <div className='h-[200px] sm:h-[30vh]'>
        <img
          src={course?.imageUrl || "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"}
          alt={course?.title || "course"}
          className={cn(
            "w-full h-full object-cover rounded-xl transition-all duration-300",
            isLocked && "blur-[2px]"
          )}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/400x225/E0BBE4/957DAD?text=Image+Error";
          }}
        />
      </div>
      <CardContent className="p-0">
        <div className="h-full">

          {/* Lock Icon - Top Right Corner (only when locked) */}
          {isLocked && (
            <div
              className="absolute top-3 right-3 z-20 cursor-pointer"
              onClick={handleLockClick}
            >
              <div className="bg-yellow-500 backdrop-blur-sm p-2.5 rounded-full hover:bg-yellow-600/80 transition-all">
                <Lock className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* Course content - visible but slightly faded when locked */}
          <div className={cn(
            "z-10 transition-opacity",
            isLocked ? "opacity-85" : "opacity-100"
          )}>
            <h4 className="text-2xl text-gray-800 dark:text-gray-100 font-bold mt-4">{course?.title}</h4>
            <p className="text-md mt-3 text-gray-600 dark:text-gray-200 line-clamp-2">
              {course?.description ? convertRtkEditorToFormattedPlainText(course.description, true) : ''}
            </p>
            {!isLocked && (
              <button
                className="text-sm font-medium mt-2 text-yellow-600 hover:text-yellow-700 cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCourseClick) {
                    onCourseClick(course);
                  }
                }}
              >
                {course?.link || "Show more"}
              </button>
            )}
          </div>
        </div>
      </CardContent>

      {/* Gradient overlay */}
      {/* <div className='absolute bg-gradient-black inset-0 bg-gradient-green z-0'></div> */}

      {/* Full Card Lock Overlay - Semi-transparent overlay over entire card */}
      {isLocked && (
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10 rounded-lg cursor-pointer"
          onClick={handleLockClick}
        />
      )}

      {/* Plan Selection Modal */}
      <PlanSelectionModal
        open={showPlanModal}
        onOpenChange={(open) => {
          console.log('🔔 PlanSelectionModal onOpenChange:', { open, modalPlans: modalPlans.length });
          setShowPlanModal(open);
        }}
        courseId={courseId}
        courseTitle={course?.title || 'this course'}
        plans={modalPlans}
      />

      {/* UID Required Modal */}
      <Dialog open={showUidModal} onOpenChange={setShowUidModal}>
        <DialogContent className="sm:max-w-md">
          <UidRequired
            onConnectUid={(e) => {
              e?.preventDefault();
              e?.stopPropagation();
              setShowUidModal(false);
              // Only navigate to login if user is not authenticated
              if (!isAuthenticated) {
                navigate('/login', { state: { from: window.location.pathname } });
              }
            }}
            onClose={() => setShowUidModal(false)}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

