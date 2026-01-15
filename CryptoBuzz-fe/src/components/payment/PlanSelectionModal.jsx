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
 */
export function PlanSelectionModal({ 
  open, 
  onOpenChange, 
  courseId, 
  courseTitle,
  plans = [],
  onPurchaseSuccess,
  onPurchaseError,
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();

  const handlePlanSelect = (planId) => {
    setSelectedPlanId(planId);
  };

  const handlePurchase = async () => {
    if (!selectedPlanId) {
      toast.error('Please select a plan');
      return;
    }

    if (!courseId) {
      toast.error('Course ID is required');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Purchase error:', error);
      const errorMessage = error?.data?.message || error?.message || 'Failed to create payment link';
      toast.error(errorMessage);
      
      // Call error callback if provided
      if (onPurchaseError) {
        onPurchaseError(error);
      }
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
              <Card
                key={plan._id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary",
                  isSelected && "border-primary ring-2 ring-primary"
                )}
                onClick={() => handlePlanSelect(plan._id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {plan.description && (
                        <CardDescription className="mt-2">
                          {plan.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                      <span className="text-2xl font-bold">
                        {formattedPrice}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
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
            disabled={isLoading || !selectedPlanId}
            className="min-w-[120px]"
          >
            {isLoading ? (
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
