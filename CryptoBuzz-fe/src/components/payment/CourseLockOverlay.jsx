import React from 'react';
import { Lock, ShoppingCart, DollarSign, LogIn, Key } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { getLockButtonText, getLockIcon } from '@/utils/accessControl';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/store/authSlice';

/**
 * CourseLockOverlay Component
 * Displays a locked state overlay based on course tier
 */
export function CourseLockOverlay({
  course,
  onPurchase,
  isPurchasing = false,
  price,
  className,
  tier = 'PUBLIC',
  lockReason = null,
  lockMessage = '',
  contentType = 'Content', // New prop: 'Idea', 'Course', 'Insight', 'Social', etc.
}) {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const displayPrice = price || course?.price || 0;

  // For PRO courses, check authentication first
  // If not authenticated, treat it as LOGIN_REQUIRED
  const effectiveTier = tier === 'PRO' && !isAuthenticated ? 'LOGIN_REQUIRED' : tier;
  const effectiveLockReason = tier === 'PRO' && !isAuthenticated ? 'LOGIN_REQUIRED' : lockReason;

  // Determine lock icon and message based on effective tier
  const lockIcon = getLockIcon(effectiveTier);
  const buttonText = getLockButtonText(effectiveTier, false);

  // Handle different lock actions based on tier
  const handleLockAction = () => {
    // PRO tier - check authentication first
    if (tier === 'PRO') {
      if (!isAuthenticated) {
        // Not authenticated - redirect to login
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
      // Authenticated - trigger purchase flow
      if (onPurchase) {
        onPurchase();
      }
    } else if (effectiveTier === 'LOGIN_REQUIRED' || effectiveLockReason === 'LOGIN_REQUIRED') {
      // LOGGED_IN or PRO without auth - redirect to login
      navigate('/login', { state: { from: window.location.pathname } });
    } else if (effectiveTier === 'UID_ONLY' || effectiveLockReason === 'UID_REQUIRED') {
      // UID_ONLY but no valid UID - show message or redirect
      navigate('/login', { state: { from: window.location.pathname } });
    } else if (onPurchase) {
      // Fallback to purchase action
      onPurchase();
    }
  };

  // Don't show overlay for PUBLIC courses
  if (tier === 'PUBLIC' && !lockReason) {
    return null;
  }

  // Remove fixed height if className contains height override
  const hasHeightOverride = className?.includes('h-');
  
  return (
    <div
      className={cn(
        "absolute inset-0 bg-black/50 rounded-xl z-10",
        !hasHeightOverride && "h-[435px]",
        "flex flex-col items-center justify-center",
        className
      )}
    >
      {/* Lock Icon */}
      <div className="flex flex-col items-center justify-center space-y-4 mb-6 h-[250px]">
        <div className="bg-white/10 p-3 rounded-full">
          <Lock className="w-6 h-6 text-white" />
        </div>

        {/* Title */}
        <div className="text-center px-4">
          <h3 className="text-xl font-semibold text-white mb-2">
            {effectiveTier === 'PRO' ? `${contentType} Locked` : effectiveTier === 'LOGIN_REQUIRED' || effectiveTier === 'LOGGED_IN' ? 'Login Required' : effectiveTier === 'UID_ONLY' ? 'Access Restricted' : `${contentType} Locked`}
          </h3>
          <p className="text-sm text-white/90 line-clamp-1">
            {effectiveLockReason === 'LOGIN_REQUIRED' && tier === 'PRO'
              ? 'Please log in to purchase this course and access the content.'
              : lockMessage || (effectiveTier === 'PRO'
                ? 'Please login to view details'
                : effectiveTier === 'LOGIN_REQUIRED' || effectiveTier === 'LOGGED_IN'
                  ? 'Please log in to access this content.'
                  : effectiveTier === 'UID_ONLY'
                    ? 'This content requires special access. Please contact support.'
                    : 'This content is currently locked.')}
          </p>
        </div>

        {/* Price Display - Only for PRO tier when authenticated */}
        {effectiveTier === 'PRO' && isAuthenticated && displayPrice > 0 && (
          <div className="flex items-center gap-2 text-2xl font-bold text-white">
            <DollarSign className="w-6 h-6" />
            <span>{displayPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Action Button - Positioned at bottom */}
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLockAction();
          }}
          disabled={isPurchasing}
          className={cn(
            "w-full bg-yellow-500 hover:bg-yellow-600 text-white",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "shadow-lg"
          )}
          size="lg"
        >
          {isPurchasing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {isPurchasing && typeof isPurchasing === 'object' && isPurchasing?.loadingPlans
                ? 'Loading Plans...'
                : 'Processing...'}
            </>
          ) : (
            <>
              {effectiveTier === 'PRO' && isAuthenticated ? (
                <ShoppingCart className="w-4 h-4 mr-2" />
              ) : effectiveTier === 'LOGIN_REQUIRED' || effectiveTier === 'LOGGED_IN' || effectiveLockReason === 'LOGIN_REQUIRED' ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : effectiveTier === 'UID_ONLY' || effectiveLockReason === 'UID_REQUIRED' ? (
                <Key className="w-4 h-4 mr-2" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              {effectiveTier === 'LOGIN_REQUIRED' && tier === 'PRO'
                ? 'Login to Purchase'
                : effectiveTier === 'PRO' && isAuthenticated
                  ? 'Unlock Content'
                  : buttonText}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

