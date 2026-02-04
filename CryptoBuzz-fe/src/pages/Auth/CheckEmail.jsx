import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useDocumentTitle from '../../hooks/use-document-title';

export default function CheckEmail() {
  useDocumentTitle('Check Your Email');
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  return (
    <div className="login card max-w-[385px] border-none w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)] !rounded-2xl">
      <div className="card-body flex flex-col gap-4 p-6 items-center text-center">
        <img
          src="/media/app/default-logo-dark.png"
          className="w-100 h-16 object-contain mb-4"
          alt=""
        />
        <h3 className="text-xl font-medium text-gray-100">Verify your email</h3>
        <p className="text-sm text-gray-400">
          {email
            ? `We’ve sent a verification link to ${email}. Please check your inbox and click the link to activate your account.`
            : 'We’ve sent a verification link to your email address. Please check your inbox and click the link to activate your account.'}
        </p>
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

