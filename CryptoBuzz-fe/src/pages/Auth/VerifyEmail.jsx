import React, { useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useVerifyEmailMutation } from '@/store/client/clientAuthApiSlice';
import useDocumentTitle from '../../hooks/use-document-title';

export default function VerifyEmail() {
  useDocumentTitle('Verify Email');
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verifyEmail, { isLoading, isSuccess, isError, error }] = useVerifyEmailMutation();
  const navigate = useNavigate();
  const hasRequestedRef = useRef(false);

  useEffect(() => {
    if (!token || hasRequestedRef.current) return;
    hasRequestedRef.current = true;

    verifyEmail(token)
      .unwrap()
      .then(() => {
        toast.success('Email verified successfully. You can now log in.');
      })
      .catch(() => {
        // error handled by state
      });
  }, [token, verifyEmail]);

  let message = 'Verifying your email...';
  if (!token) {
    message = 'Invalid verification link.';
  } else if (isError) {
    message = error?.data?.message || 'Verification link is invalid or has expired.';
  } else if (isSuccess) {
    message = 'Your email has been verified successfully!';
  }

  const showSuccessIcon = isSuccess && !isLoading && !!token;
  const showErrorIcon = (!token || isError) && !isLoading;

  return (
    <div className="login card max-w-[385px] border-none w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)] !rounded-2xl">
      <div className="card-body flex flex-col gap-4 p-6 items-center text-center">
        <img
          src="/media/app/default-logo-dark.png"
          className="w-100 h-16 object-contain mb-4"
          alt=""
        />
        {isLoading && <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-2" />}
        {showSuccessIcon && <CheckCircle2 className="w-8 h-8 text-green-400 mb-2" />}
        {showErrorIcon && <XCircle className="w-8 h-8 text-red-400 mb-2" />}
        <h3 className="text-xl font-medium text-gray-100">Email Verification</h3>
        <p className="text-sm text-gray-400">{message}</p>
        <button
          type="button"
          onClick={() => navigate('/login', { replace: true })}
          className="mt-3 h-11 rounded-md bg-[linear-gradient(90deg,#FFCD0B_0%,#FFCD0B_100%)] text-black font-medium px-6"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
}

