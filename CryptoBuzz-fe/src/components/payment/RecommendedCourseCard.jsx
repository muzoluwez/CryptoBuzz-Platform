import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useCourseAccessFromMap } from '@/hooks/use-batch-course-access';
import { CourseLockOverlay } from './CourseLockOverlay';
import { useCreatePaymentLinkMutation, useLazyGetCoursePlansQuery } from '@/store/client/clientPaymentApiSlice';
import { PlanSelectionModal } from './PlanSelectionModal';
import { toast } from 'sonner';
import { convertRtkEditorToFormattedPlainText } from '@/lib/rtkEditorUtils';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import { selectIsAuthenticated } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';

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
  const [createPaymentLink, { isLoading: isPurchasing }] = useCreatePaymentLinkMutation();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalPlans, setModalPlans] = useState([]);

  // Get course access from batch access map (efficient)
  const { hasAccess, isPremium, coursePrice, courseTier, lockReason, lockMessage, showLock } = useCourseAccessFromMap(
    courseId,
    accessMap,
    course
  );

  // Handle purchase - Check authentication first, then fetch plans
  const handlePurchase = async (e) => {
    // Stop propagation if event is provided (from button click)
    if (e && e.stopPropagation) {
      e.stopPropagation(); // Prevent course click
    }

    if (!courseId) {
      toast.error('Course ID is required');
      return;
    }

    // For PRO courses, check authentication first
    // If not authenticated, redirect to login
    if (courseTier === 'PRO' && !isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    console.log('🔄 RecommendedCourseCard: Fetching plans for course:', courseId);

    try {
      // ALWAYS fetch plans first
      // Use full API URL (same as RTK Query uses)
      const apiBaseUrl = `${import.meta.env.VITE_APP_API_URL || 'http://localhost:8000'}/api/v1`;
      const plansApiUrl = `${apiBaseUrl}/common/payment/course/${courseId}/plans`;
      const authToken = localStorage.getItem('token') || '';
      
      console.log('📡 RecommendedCourseCard: Calling plans API:', plansApiUrl);
      
      const plansResponse = await fetch(plansApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
      });

      if (!plansResponse.ok) {
        throw new Error(`Plans API failed: ${plansResponse.status}`);
      }

      const plansResult = await plansResponse.json();
      const fetchedPlans = plansResult?.data?.plans || plansResult?.plans || [];

      console.log('✅ Plans fetched:', { 
        fetchedPlans, 
        count: fetchedPlans.length,
        plansResult,
        courseId 
      });

      // Check if multiple plans - show modal
      if (fetchedPlans.length > 1) {
        console.log('✅ Multiple plans detected - opening modal', { 
          plansCount: fetchedPlans.length, 
          plans: fetchedPlans 
        });
        setModalPlans(fetchedPlans);
        setShowPlanModal(true);
        return; // Exit early - modal will handle purchase
      }
      
      // If single plan, log it for debugging
      if (fetchedPlans.length === 1) {
        console.log('⚠️ Single plan detected - proceeding to checkout directly', { 
          plan: fetchedPlans[0] 
        });
      } else {
        console.warn('⚠️ No plans found for course - proceeding to checkout without planId', { 
          courseId 
        });
      }

      // Single plan or no plans - proceed with checkout
      const planId = fetchedPlans.length === 1 ? fetchedPlans[0]._id : undefined;
      const payload = planId ? { courseId, planId } : courseId;
      
      const response = await createPaymentLink(payload).unwrap();
      
      if (response?.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Checkout URL not received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create payment link';
      toast.error(errorMessage);
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
      className={`relative bg-black text-white h-[438px] p-0 overflow-hidden group transition-all ${
        isLocked ? 'cursor-default' : 'cursor-pointer hover:scale-[1.02]'
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="p-0">
        <div className="relative h-full">
          <img
            src={course?.imageUrl || "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop"}
            alt={course?.title || "course"}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              isLocked && "blur-[2px]"
            )}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x225/E0BBE4/957DAD?text=Image+Error";
            }}
          />
          
          {/* Course content - visible but slightly faded when locked */}
          <div className={cn(
            "absolute left-4 bottom-4 text-white z-10 transition-opacity",
            isLocked ? "opacity-85" : "opacity-100"
          )}>
            <h4 className="text-2xl font-bold">{course?.title}</h4>
            <p className="text-md mt-3 text-gray-200 line-clamp-2">
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
      <div className='absolute bg-gradient-black inset-0 bg-gradient-green z-0'></div>

      {/* Lock overlay - Show if course has lock requirement and no access */}
      {isLocked && (
        <CourseLockOverlay
          course={course}
          onPurchase={handlePurchase}
          isPurchasing={isPurchasing}
          price={coursePrice}
          tier={courseTier || course?.tier || 'PUBLIC'}
          lockReason={lockReason}
          lockMessage={lockMessage}
          className="rounded-lg"
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
    </Card>
  );
}

