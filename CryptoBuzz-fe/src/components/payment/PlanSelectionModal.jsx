import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useCreatePaymentLinkMutation } from '@/store/client/clientPaymentApiSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * PlanSelectionModal Component
 * Modal to display available plans for a course and handle plan selection
 * Also supports direct plan checkout (for non-course content types)
 */
export function PlanSelectionModal({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  plans = [],
  onPurchaseSuccess,
  onPurchaseError,
  useDirectPlanCheckout = false, // If true, use plan.hotmartCheckoutUrl directly instead of API
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
  };

  const handlePurchase = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan');
      return;
    }

    setIsProcessing(true);

    try {
      // Find the selected plan
      const selectedPlan = plans.find(p => (p._id || p)?.toString() === selectedPlanId.toString());

      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // If using direct plan checkout (for non-course content types)
      if (useDirectPlanCheckout) {
        if (selectedPlan.hotmartCheckoutUrl) {
          // Redirect directly to the plan's checkout URL
          window.location.href = selectedPlan.hotmartCheckoutUrl;

          // Call success callback if provided
          if (onPurchaseSuccess) {
            onPurchaseSuccess({ checkoutUrl: selectedPlan.hotmartCheckoutUrl, planId: selectedPlanId });
          }

          // Close modal
          onOpenChange(false);
        } else {
          throw new Error('Checkout URL not available for this plan');
        }
      } else {
        // Course-specific flow - use API
        if (!courseId) {
          throw new Error('Course ID is required');
        }

        const response = await createPaymentLink({
          courseId,
          planId: selectedPlanId
        }).unwrap();

        if (response?.data?.checkoutUrl) {
          // Redirect to Hotmart checkout
          window.location.href = response.data.checkoutUrl;

          // Call success callback if provided
          if (onPurchaseSuccess) {
            onPurchaseSuccess(response.data);
          }

          // Close modal
          onOpenChange(false);
        } else if (response?.data?.requiresPlanSelection) {
          // This shouldn't happen if planId is provided, but handle it
          toast.error('Plan selection still required');
        } else {
          throw new Error('Checkout URL not received');
        }
      }
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create payment link';
      toast.error(errorMessage);

      // Call error callback if provided
      if (onPurchaseError) {
        onPurchaseError(error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (plans.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Plan for {courseTitle}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Choose a payment plan to gain access to this course and all other courses included in the plan.
          </p>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan._id;
            const formattedPrice = plan.price > 0 ? `$${plan.price.toFixed(2)}` : 'Free';

            return (
              <div
                key={plan._id}
                onClick={() => handlePlanSelect(plan._id)}
                className={cn(
                  "cursor-pointer transition-all border rounded-md p-4",
                  isSelected
                    ? "border-yellow-500"
                    : "border-gray-300 hover:border-yellow-500 !outline-none"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">{plan.name}</h3>
                      <div className="ml-4 flex items-center gap-2">
                        {isSelected && (
                          <Check className="w-5 h-5 text-primary" />
                        )}
                        <span className="text-2xl font-bold">
                          {formattedPrice}
                        </span>
                      </div>
                    </div>
                    {plan.description && (
                      <p className="mt-2 text-sm text-gray-600">
                        {plan.description}
                      </p>
                    )}
                  </div>

                </div>
              </div>

            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={isLoading || isProcessing || !selectedPlanId}
            className="min-w-[120px]"
          >
            {isLoading || isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Checkout'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
