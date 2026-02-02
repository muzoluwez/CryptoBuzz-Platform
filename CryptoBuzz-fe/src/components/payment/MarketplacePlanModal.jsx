import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { useCreatePaymentLinkMutation } from '@/store/client/clientPaymentApiSlice';
import { toast } from 'sonner';

export default function MarketplacePlanModal({ open, onOpenChange, plan, onPurchaseSuccess, onPurchaseError, useDirectPlanCheckout = true }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [createPaymentLink, { isLoading }] = useCreatePaymentLinkMutation();

  if (!plan) return null;

  const image = plan?.hotmartProductDetails?.image || plan?.image || '';
  const priceLabel = plan?.price > 0 ? `${plan?.currency || '$'}${plan.price.toFixed(2)}` : 'Free';

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      if (useDirectPlanCheckout && plan?.hotmartCheckoutUrl) {
        window.location.href = plan.hotmartCheckoutUrl;
        if (onPurchaseSuccess) onPurchaseSuccess({ checkoutUrl: plan.hotmartCheckoutUrl, planId: plan._id });
        onOpenChange(false);
        return;
      }

      // Fallback: call API with planId only
      const response = await createPaymentLink({ planId: plan._id }).unwrap();
      if (response?.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
        if (onPurchaseSuccess) onPurchaseSuccess(response.data);
        onOpenChange(false);
      } else {
        throw new Error('Checkout URL not received');
      }
    } catch (err) {
      console.error('Marketplace plan purchase error:', err);
      toast.error(err?.data?.message || err?.message || 'Failed to initiate purchase');
      if (onPurchaseError) onPurchaseError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Plan Information</DialogTitle>
        </DialogHeader>

        {image ? (
          <div className="w-full h-48 overflow-hidden rounded-md mb-4 bg-gray-100">
            <img
              src={image}
              alt={plan.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-full h-48 rounded-md mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500" style={{ display: 'none' }}>
              <span>Image not available</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-48 rounded-md mb-4 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
            <span>No image</span>
          </div>
        )}

        <div className="px-2 pb-4">
          <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
          {plan.description && <p className="text-sm text-gray-600 mb-4">{plan.description}</p>}

          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-500">Price</div>
              <div className="text-2xl font-bold">{priceLabel}</div>
            </div>
            <div className="text-right">
              {plan.tier && <div className="text-sm text-gray-500">Tier</div>}
              {plan.tier && <div className="text-base font-medium">{plan.tier}</div>}
            </div>
          </div>

          {/* Additional details could go here (included items, duration, features) */}

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading || isProcessing}>Cancel</Button>
            <Button onClick={handlePurchase} disabled={isLoading || isProcessing} className="bg-yellow-500 hover:bg-yellow-600 text-white">
              {isLoading || isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
                </>
              ) : (
                'Buy Plan'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
