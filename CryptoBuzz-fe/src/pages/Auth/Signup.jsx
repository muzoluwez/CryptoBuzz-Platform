import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, selectCurrentUser } from '@/store/authSlice';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useSignupMutation, useLoginMutation } from '@/store/client/clientAuthApiSlice';
import useDocumentTitle from '../../hooks/use-document-title';

export default function Signup() {
  useDocumentTitle('Sign Up');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const isLoading = isSignupLoading || isLoginLoading;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user) navigate('/client/home', { replace: true });
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be less than 50 characters')
        .required('First name is required'),
      lastName: Yup.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be less than 50 characters')
        .required('Last name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      try {
        await signup({
          name: `${values.firstName} ${values.lastName}`.trim(),
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName
        }).unwrap();

        const loginResponse = await login({
          email: values.email,
          password: values.password
        }).unwrap();

        const { userObj, token } = loginResponse.data;

        if (token) {
          dispatch(setCredentials({ user: userObj, token }));
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userObj));

          toast.success('Account created successfully!');
          navigate('/client/home', { replace: true });
        } else {
          toast.error('Account created but login failed');
        }
      } catch (err) {
        console.error('Signup error:', err);
        toast.error(err?.data?.message || 'Unable to sign up. Please try again.');
      }
    },
  });

  return (
    <>
      <style>
        {`
          /* Fix browser autofill styling for dark theme */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus,
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px transparent inset !important;
            -webkit-text-fill-color: rgb(243, 244, 246) !important;
            box-shadow: 0 0 0 30px transparent inset !important;
            transition: background-color 5000s ease-in-out 0s;
            caret-color: rgb(243, 244, 246);
          }
        `}
      </style>
      <div className="login card max-w-[385px] border-none w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)] !rounded-2xl">
        <form className="card-body flex flex-col gap-4 p-6" onSubmit={formik.handleSubmit} noValidate>
          <div className="flex justify-center mb-8">
            <img
              src="/media/app/default-logo-dark.png"
              className="w-100 h-16 object-contain"
              alt=""
            />
            {/* <img src="/media/app/default-logo-dark.png" className="w-100 h-5 dark_mode" alt="" /> */}
          </div>
          <h3 className="text-xl font-medium text-gray-100 text-center">
            Create an Account
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-gray-400 text-sm">First Name</label>
              <input
                name="firstName"
                type="text"
                {...formik.getFieldProps('firstName')}
                disabled={isLoading}
                autoComplete="given-name"
                className={`w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5 ${formik.touched.firstName && formik.errors.firstName ? 'border-red-500' : ''
                  }`}
                placeholder=""
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <span className="text-red-400 text-xs mt-1 block">
                  {formik.errors.firstName}
                </span>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm">Last Name</label>
              <input
                name="lastName"
                type="text"
                {...formik.getFieldProps('lastName')}
                disabled={isLoading}
                autoComplete="family-name"
                className={`w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5 ${formik.touched.lastName && formik.errors.lastName ? 'border-red-500' : ''
                  }`}
                placeholder=""
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <span className="text-red-400 text-xs mt-1 block">
                  {formik.errors.lastName}
                </span>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm">Email</label>
              <input
                type="email"
                name="email"
                {...formik.getFieldProps('email')}
                disabled={isLoading}
                autoComplete="email"
                className={`w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5 ${formik.touched.email && formik.errors.email ? 'border-red-500' : ''
                  }`}
              />
              {formik.touched.email && formik.errors.email && (
                <span className="text-red-400 text-xs mt-1 block">
                  {formik.errors.email}
                </span>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  {...formik.getFieldProps('password')}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5 pr-8 ${formik.touched.password && formik.errors.password ? 'border-red-500' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
                >
                  {showPassword ? (
                    <EyeOff size={16} className="text-gray-400" />
                  ) : (
                    <Eye size={16} className="text-gray-400" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-red-400 text-xs mt-1 block">
                  {formik.errors.password}
                </span>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-sm">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  {...formik.getFieldProps('confirmPassword')}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5 pr-8 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500' : ''
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} className="text-gray-400" />
                  ) : (
                    <Eye size={16} className="text-gray-400" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <span className="text-red-400 text-xs mt-1 block">
                  {formik.errors.confirmPassword}
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            className="mt-3 h-11 rounded-md bg-[linear-gradient(90deg,#FFCD0B_0%,#FFCD0B_100%)] text-black font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading || formik.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          <p className="text-sm text-gray-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-yellow-400 hover:underline">
              Login
            </Link>
          </p>

        </form>
      </div>
    </>
  );
}
