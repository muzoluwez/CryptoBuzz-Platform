import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useCheckCourseAccessQuery } from '@/store/client/clientPaymentApiSlice';
import { toast } from 'sonner';

/**
 * PaymentStatusHandler Component
 * Handles payment status after redirect from Hotmart
 * Polls for access status and shows success/error messages
 */
export function PaymentStatusHandler() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [courseIdToCheck, setCourseIdToCheck] = useState(null);
  const [pollAttempts, setPollAttempts] = useState(0);
  const maxPollAttempts = 10;

  // Use regular query with skip - will refetch when courseIdToCheck changes
  const { data: accessData, refetch } = useCheckCourseAccessQuery(courseIdToCheck, {
    skip: !courseIdToCheck,
  });

  useEffect(() => {
    // Check if we have payment status parameters in URL
    const paymentStatus = searchParams.get('payment_status');
    const courseId = searchParams.get('course_id');
    const purchaseId = searchParams.get('purchase_id');

    // If no payment parameters, don't do anything
    if (!paymentStatus && !courseId && !purchaseId) {
      return;
    }

    // Handle payment success/failure
    if (paymentStatus === 'success' && courseId) {
      // Wait a bit for webhook to process, then start checking
      setTimeout(() => {
        setCourseIdToCheck(courseId);
        toast.info('Payment received! Verifying access...');
      }, 2000);
    } else if (paymentStatus === 'cancelled') {
      toast.info('Payment was cancelled. You can try again anytime.');
      setSearchParams({});
    } else if (paymentStatus === 'failed') {
      toast.error('Payment failed. Please try again or contact support.');
      setSearchParams({});
    }
  }, [location.search, searchParams, setSearchParams]);

  // Handle access check results and polling
  useEffect(() => {
    if (!accessData || !courseIdToCheck) return;

    const hasAccess = accessData?.data?.hasAccess;

    if (hasAccess) {
      toast.success('Payment successful! You now have access to this course.');
      setCourseIdToCheck(null);
      setPollAttempts(0);
      setSearchParams({});
    } else if (pollAttempts < maxPollAttempts) {
      // Continue polling
      const pollTimer = setTimeout(() => {
        setPollAttempts(prev => prev + 1);
        refetch();
      }, 3000);

      return () => clearTimeout(pollTimer);
    } else {
      // Max attempts reached
      toast.warning('Payment processed. If access is not granted soon, please contact support.');
      setCourseIdToCheck(null);
      setPollAttempts(0);
      setSearchParams({});
    }
  }, [accessData, courseIdToCheck, pollAttempts, refetch, setSearchParams]);

  // This component doesn't render anything
  return null;
}

