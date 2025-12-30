import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, selectCurrentUser } from '@/store/authSlice';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSignupMutation, useLoginMutation } from '@/store/client/clientAuthApiSlice';

export function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const isLoading = isSignupLoading || isLoginLoading;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user) navigate('/client/home', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await signup({
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      }).unwrap();

      const loginResponse = await login({
        email: formData.email,
        password: formData.password
      }).unwrap();

      const { userObj, token } = loginResponse.data;

      dispatch(setCredentials({ user: userObj, token }));
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userObj));

      navigate('/client/home', { replace: true });
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to sign up');
    }
  };

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
      <div className="login card max-w-[385px] border-none w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)]">
        <form className="card-body flex flex-col gap-4 p-6" onSubmit={handleSubmit}>

        <h3 className="text-xl font-medium text-gray-100 text-center">
          Create an Account
        </h3>

        <div className="space-y-3">

          <div>
            <label className="text-gray-400 text-sm">First Name</label>
            <input
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="given-name"
              className="w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5"
              placeholder=""
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">Last Name</label>
            <input
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="family-name"
              className="w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5"
              placeholder=""
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
              className="w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
              className="w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5"
              required
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
              className="w-full bg-transparent border-b border-[#35353C] text-gray-100 outline-none py-1.5"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="mt-3 h-11 rounded-md bg-[linear-gradient(90deg,#FFCD0B_0%,#FFCD0B_100%)] text-black font-medium"
        >
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        <p className="text-sm text-gray-400 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-yellow-400 hover:underline">
            Sign in
          </Link>
        </p>

        </form>
      </div>
    </>
  );
}
