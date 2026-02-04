import React, { useState } from 'react';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useCreatePaymentLinkMutation, useGetCoursePlansQuery } from '@/store/client/clientPaymentApiSlice';
import { PlanSelectionModal } from './PlanSelectionModal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';
import { useNavigate } from 'react-router-dom';

/**
 * PurchaseButton Component
 * Button to initiate course purchase flow
 */
export function PurchaseButton({ 
  courseId, 
  courseTitle, 
  price, 
  className,
  variant = 'primary',
  size = 'default',
  showPrice = true,
  onPurchaseSuccess,
  onPurchaseError,
  tier = 'PRO', // Default to PRO for paid courses
}) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();
  
  // Fetch available plans for this course
  const { data: plansData, isLoading: isLoadingPlans } = useGetCoursePlansQuery(courseId, {
    skip: !courseId, // Skip if no courseId
  });

  const plans = plansData?.data?.plans || [];
  const hasMultiplePlans = plans.length > 1;

  const handlePurchase = async () => {
    if (!courseId) {
      toast.error('Course ID is required');
      return;
    }

    // For PRO courses, check authentication first
    // If not authenticated, redirect to login
    if (tier === 'PRO' && !isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    // Wait for plans to load if still loading
    if (isLoadingPlans) {
      toast.info('Loading plans...');
      return;
    }

    // If multiple plans available, show plan selection modal
    if (hasMultiplePlans && plans.length > 1) {
      setShowPlanModal(true);
      return;
    }

    // Single plan or no plans - proceed with direct checkout
    try {
      // If single plan exists, include it in the request
      const planId = plans.length === 1 ? plans[0]._id : undefined;
      const payload = planId ? { courseId, planId } : courseId;
      const response = await createPaymentLink(payload).unwrap();
      
      // If response indicates plan selection is required, show modal
      if (response?.data?.requiresPlanSelection) {
        setShowPlanModal(true);
        return;
      }
      
      if (response?.data?.checkoutUrl) {
        // Redirect to Hotmart checkout
        window.location.href = response.data.checkoutUrl;
        
        // Call success callback if provided
        if (onPurchaseSuccess) {
          onPurchaseSuccess(response.data);
        }
      } else {
        throw new Error('Checkout URL not received');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create payment link';
      
      // If error indicates plan selection needed, show modal
      if (errorMessage.includes('select a plan') || errorMessage.includes('Please select')) {
        setShowPlanModal(true);
        return;
      }
      
      toast.error(errorMessage);
      
      // Call error callback if provided
      if (onPurchaseError) {
        onPurchaseError(error);
      }
    }
  };

  // Use price from first plan if available, otherwise use provided price
  const displayPrice = plans.length > 0 ? (plans[0]?.price || 0) : (price || 0);
  const formattedPrice = displayPrice > 0 ? `$${displayPrice.toFixed(2)}` : 'Free';

  return (
    <>
      <Button
        onClick={handlePurchase}
        disabled={isLoading || isLoadingPlans || !courseId}
        className={cn("gap-2", className)}
        variant={variant}
        size={size}
      >
        {isLoading || isLoadingPlans ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>
              {hasMultiplePlans 
                ? 'Select Plan & Purchase'
                : showPrice && displayPrice > 0 
                  ? `Purchase - ${formattedPrice}` 
                  : 'Purchase Course'}
            </span>
          </>
        )}
      </Button>

      {/* Plan Selection Modal */}
      {hasMultiplePlans && (
        <PlanSelectionModal
          open={showPlanModal}
          onOpenChange={setShowPlanModal}
          courseId={courseId}
          courseTitle={courseTitle || 'this course'}
          plans={plans}
          onPurchaseSuccess={onPurchaseSuccess}
          onPurchaseError={onPurchaseError}
        />
      )}
    </>
  );
}

