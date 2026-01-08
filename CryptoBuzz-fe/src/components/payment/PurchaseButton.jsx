import React, { useState } from 'react';
import { ShoppingCart, Loader2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { useCreatePaymentLinkMutation } from '@/store/client/clientPaymentApiSlice';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
}) {
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();

  const handlePurchase = async () => {
    if (!courseId) {
      toast.error('Course ID is required');
      return;
    }

    try {
      const response = await createPaymentLink(courseId).unwrap();
      
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
      toast.error(errorMessage);
      
      // Call error callback if provided
      if (onPurchaseError) {
        onPurchaseError(error);
      }
    }
  };

  const displayPrice = price || 0;
  const formattedPrice = displayPrice > 0 ? `$${displayPrice.toFixed(2)}` : 'Free';

  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading || !courseId}
      className={cn("gap-2", className)}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          <span>
            {showPrice && displayPrice > 0 ? `Purchase - ${formattedPrice}` : 'Purchase Course'}
          </span>
        </>
      )}
    </Button>
  );
}

