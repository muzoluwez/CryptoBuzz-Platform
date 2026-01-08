import React from 'react';
import { Lock, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

/**
 * CourseLockOverlay Component
 * Displays a locked state overlay for courses that haven't been purchased
 */
export function CourseLockOverlay({ 
  course, 
  onPurchase, 
  isPurchasing = false,
  price,
  className 
}) {
  const displayPrice = price || course?.price || 0;
  const isFree = displayPrice === 0 || course?.tier === 'FREE';

  return (
    <div 
      className={cn(
        "absolute inset-0 bg-black/70 backdrop-blur-sm rounded-xl z-10",
        "flex items-center justify-center",
        className
      )}
    >
      <Card className="max-w-md w-full mx-4 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            {/* Lock Icon */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full">
              <Lock className="w-8 h-8 text-gray-600 dark:text-gray-400" />
            </div>

            {/* Title */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Course Locked
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isFree 
                  ? "This course is free and should be accessible."
                  : "You need to purchase this course to access the content. Unlock all lessons and start learning today!"
                }
              </p>
            </div>

            {/* Price Display */}
            {!isFree && displayPrice > 0 && (
              <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                <DollarSign className="w-6 h-6" />
                <span>{displayPrice.toFixed(2)}</span>
              </div>
            )}

            {/* Purchase Button */}
            {!isFree && (
              <Button
                onClick={onPurchase}
                disabled={isPurchasing}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                {isPurchasing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Purchase Course
                  </>
                )}
              </Button>
            )}

            {/* Free course notice */}
            {isFree && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                If you're seeing this, there may be an access issue. Please contact support.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

