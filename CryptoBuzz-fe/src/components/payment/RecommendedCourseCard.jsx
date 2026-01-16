import React, { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useCourseAccessFromMap } from '@/hooks/use-batch-course-access';
import { CourseLockOverlay } from './CourseLockOverlay';
import { useCreatePaymentLinkMutation, useLazyGetCoursePlansQuery } from '@/store/client/clientPaymentApiSlice';
import { PlanSelectionModal } from './PlanSelectionModal';
import { toast } from 'sonner';
import { convertRtkEditorToFormattedPlainText } from '@/lib/rtkEditorUtils';

/**
 * RecommendedCourseCard Component
 * Displays a course card with lock overlay if not purchased
 * @param {Object} course - Course object
 * @param {Function} onCourseClick - Callback when course is clicked
 * @param {Object} accessMap - Batch access map from parent (optional, for efficient checking)
 */
export function RecommendedCourseCard({ course, onCourseClick, accessMap = {} }) {
  const courseId = course?._id || course?.id;
  const [createPaymentLink, { isLoading: isPurchasing }] = useCreatePaymentLinkMutation();
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalPlans, setModalPlans] = useState([]);

  // Get course access from batch access map (efficient)
  const { hasAccess, isPremium, coursePrice } = useCourseAccessFromMap(
    courseId,
    accessMap,
    course
  );

  // Handle purchase - Fetch plans first, then decide
  const handlePurchase = async (e) => {
    e.stopPropagation(); // Prevent course click

    if (!courseId) {
      toast.error('Course ID is required');
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
      const fetchedPlans = plansResult?.data?.plans || [];

      console.log('✅ Plans fetched:', { fetchedPlans, count: fetchedPlans.length });

      // Check if multiple plans
      if (fetchedPlans.length > 1) {
        console.log('✅ Multiple plans - opening modal');
        setModalPlans(fetchedPlans);
        setShowPlanModal(true);
        return;
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
    if (isPremium && !hasAccess) {
      // Show purchase option instead of navigating
      return;
    }

    // Course is accessible, navigate to it
    if (onCourseClick) {
      onCourseClick(course);
    }
  };

  // Show lock if: premium course AND no access
  const isLocked = isPremium && !hasAccess;
  
  // Debug logging for all courses to help identify issues
  useEffect(() => {
    console.log('🎴 RecommendedCourseCard:', { 
      courseId,
      courseTitle: course?.title,
      hasAccess, 
      isPremium, 
      isLocked,
      coursePrice,
      courseTier: course?.tier,
      coursePriceFromObj: course?.price,
      accessMapData: accessMap[courseId],
      courseObject: {
        tier: course?.tier,
        price: course?.price,
        hotmartProductId: course?.hotmartProductId
      }
    });
  }, [courseId, course?.title, hasAccess, isPremium, isLocked, coursePrice, course?.tier, course?.price, accessMap]);

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
            className="w-full h-full object-cover transition-all duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x225/E0BBE4/957DAD?text=Image+Error";
            }}
          />
          
          {/* Lock Icon Badge - Show on top right if locked */}
          {isLocked && (
            <div className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm rounded-full p-2">
              <Lock className="w-5 h-5 text-white" />
            </div>
          )}

          <div className="absolute left-4 bottom-4 text-white z-10">
            <h4 className="text-2xl font-bold">{course?.title}</h4>
            <p className="text-md mt-3 text-gray-200 line-clamp-2">
              {course?.description ? convertRtkEditorToFormattedPlainText(course.description, true) : ''}
            </p>
            <button 
              className={`text-sm font-medium mt-2 transition-colors ${
                isLocked 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-yellow-600 hover:text-yellow-700 cursor-pointer'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isLocked && onCourseClick) {
                  onCourseClick(course);
                }
              }}
            >
              {isLocked ? 'Purchase to unlock' : (course?.link || "Show more")}
            </button>
          </div>
        </div>
      </CardContent>
      
      {/* Gradient overlay */}
      <div className='absolute bg-gradient-black inset-0 bg-gradient-green z-0'></div>

      {/* Lock overlay - Show if course is premium and not purchased */}
      {isLocked && (
        <CourseLockOverlay
          course={course}
          onPurchase={handlePurchase}
          isPurchasing={isPurchasing}
          price={coursePrice}
          className="rounded-lg"
        />
      )}
      
      {/* Plan Selection Modal */}
      <PlanSelectionModal
        open={showPlanModal}
        onOpenChange={setShowPlanModal}
        courseId={courseId}
        courseTitle={course?.title || 'this course'}
        plans={modalPlans}
      />
    </Card>
  );
}

