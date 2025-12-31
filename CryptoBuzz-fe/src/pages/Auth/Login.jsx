import React, { useEffect, useState } from 'react';
import { selectCurrentUser, setCredentials } from '@/store/authSlice';
import { useLoginMutation } from '@/store/client/clientAuthApiSlice';
import { useFormik } from 'formik';
import {
  ArrowLeft,
  CircleUser,
  Eye,
  EyeOff,
  Loader2,
  MoveLeft,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { KeenIcon } from "components";

import { toast } from 'sonner';
import * as Yup from 'yup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const from = location.state?.from?.pathname || '/client/home';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      try {
        const response = await login({
          email: values.email,
          password: values.password,
        }).unwrap();

        const { userObj, token } = response?.data || {};

        if (token) {
          dispatch(setCredentials({ user: userObj, token }));
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(userObj));

          toast.success('Login successful');
          navigate(from, { replace: true });
        } else {
          toast.error('Login successful but no token received');
        }
      } catch (err) {
        console.error('Login error:', err);
        toast.error(
          err?.data?.message || 'Unable to sign in. Please try again.',
        );
      }
    },
  });

  return (
    <div className="grid lg:grid-cols-1 grow branded-bg">
      <div className="flex justify-center items-center p-8 lg:p-10  z-10">
        <div className="login card max-w-[385px] border-none !rounded-xl w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)]">
          <form
            className="card-body flex flex-col gap-5 p-7"
            onSubmit={formik.handleSubmit}
            noValidate
          >
            <div className="text-center mb-2.5">
              <div className="text-center">
                <div className="flex justify-start mb-8">
                  <Link
                    to="/client/home"
                    className="!py-1.5 !px-2.5 text-sm gap-2 !text-gray-300 dark:text-gray-600 hover:text-primary btn btn-rounded btn-sm btn-outline w-fit border-2 border-[#35353C]"
                  >
                    {/* <KeenIcon icon="black-left" /> */}
                    <MoveLeft size={16} />
                  </Link>
                </div>
                <div className="flex justify-center mb-8">
                  <img
                    src="/media/app/default-logo-dark.png"
                    className="w-100 h-16 object-contain"
                    alt=""
                  />
                  {/* <img src="/media/app/default-logo-dark.png" className="w-100 h-5 dark_mode" alt="" /> */}
                </div>
                <h3 className="text-xl font-medium text-gray-100 dark:text-gray-900 leading-none mb-3 text-center">
                  Login
                </h3>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="input bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  {...formik.getFieldProps('email')}
                  className={`text-gray-100 dark:text-white form-control focus-visible:outline-none border-0 mb-2 text-lg ${
                    formik.touched.email && formik.errors.email
                      ? 'border-red-500'
                      : ''
                  }`}
                />
              </label>
              {formik.touched.email && formik.errors.email && (
                <span role="alert" className="text-red-400 text-xs mt-1">
                  {formik.errors.email}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="input flex items-center justify-between bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  {...formik.getFieldProps('password')}
                  className={`text-gray-100 dark:text-white form-control focus-visible:outline-none border-0 mb-2 text-lg flex-1 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn btn-icon ml-2"
                >
                  {showPassword ? (
                    <EyeOff size={18} className="text-gray-400" />
                  ) : (
                    <Eye size={18} className="text-gray-400" />
                  )}
                </button>
              </label>
              {formik.touched.password && formik.errors.password && (
                <span role="alert" className="text-red-400 text-xs mt-1">
                  {formik.errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting}
              className="btn py-7 !text-[18px] rounded-2xl bg-[linear-gradient(90deg,#FFCD0B_0%,#FFCD0B_100%)] btn-primary flex justify-center items-center gap-2 grow text-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || formik.isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                'Login'
              )}
            </button>

            <p className="text-sm text-gray-400 text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-yellow-400 hover:underline">
                Sign up
              </Link>
            </p>
            {/* <div className="font-normal text-center">
          <Link
            to={
              currentLayout?.name === "auth-branded"
                ? "/auth/reset-password"
                : "/auth/classic/reset-password"
            }
            className="text-xs text-[#8D79FF] link shrink-0"
          >
            Forgot Password?
          </Link>
          </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}
