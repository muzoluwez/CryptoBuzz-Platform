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

export function Login() {
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

        const { userObj, token } = response.data;

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
    // <div className="flex items-center justify-center min-h-screen min-w-full bg-gray-100 dark:bg-gray-900 px-4">
    //   <Card className="w-full max-w-md">
    //     <CardHeader className="space-y-1">
    //       <CardTitle className="text-center">
    //         <img
    //           src="/media/app/default-logo-dark.png"
    //           className="w-100 h-16"
    //           alt=""
    //         />
    //       </CardTitle>
    //       <CardTitle className="text-2xl font-bold text-center">
    //         Sign In
    //       </CardTitle>
    //       <CardDescription className="text-center">
    //         Enter your email and password to access your account
    //       </CardDescription>
    //     </CardHeader>
    //     <CardContent>
    //       <form onSubmit={handleSubmit} className="space-y-4">
    //         <div className="space-y-2">
    //           <Label htmlFor="email">Email</Label>
    //           <Input
    //             id="email"
    //             type="email"
    //             placeholder="m@example.com"
    //             value={email}
    //             onChange={(e) => setEmail(e.target.value)}
    //             required
    //             disabled={isLoading}
    //           />
    //         </div>
    //         <div className="space-y-2">
    //           <div className="flex items-center justify-between">
    //             <Label htmlFor="password">Password</Label>
    //             {/* <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
    //               Forgot password?
    //             </Link> */}
    //           </div>
    //           <Input
    //             id="password"
    //             type="password"
    //             value={password}
    //             onChange={(e) => setPassword(e.target.value)}
    //             required
    //             disabled={isLoading}
    //           />
    //         </div>
    //         <Button type="submit" className="w-full" disabled={isLoading}>
    //           {isLoading ? (
    //             <>
    //               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    //               Signing In...
    //             </>
    //           ) : (
    //             'Sign In'
    //           )}
    //         </Button>
    //       </form>
    //     </CardContent>
    //     <CardFooter className="flex justify-center">
    //       <p className="text-sm text-gray-500">
    //         Don't have an account?{' '}
    //         <Link
    //           to="/signup"
    //           className="text-primary font-medium hover:underline"
    //         >
    //           Sign up
    //         </Link>
    //       </p>
    //     </CardFooter>
    //   </Card>
    // </div>

    <div className="grid lg:grid-cols-1 grow branded-bg">
      <div className="flex justify-center items-center p-8 lg:p-10  z-10">
        <div className="login card max-w-[385px] border-none !rounded-xl w-full bg-[linear-gradient(180deg,#1F1E1F_0%,#121213_100%)]">
          <form className="card-body flex flex-col gap-5 p-7" noValidate>
            <div className="text-center mb-2.5">
              <div className="text-center">
                <div className="flex justify-start mb-8">
                  <Link className="!py-1.5 !px-2.5 text-sm gap-2 !text-gray-300 dark:text-gray-600 hover:text-primary btn btn-rounded btn-sm btn-outline w-fit border-2 border-[#35353C]">
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

            {/* {formik.status && <Alert variant="danger">{formik.status}</Alert>} */}

            <div className="flex flex-col gap-1">
              {/* <label className="form-label text-gray-900">Email</label> */}
              <label className="input  bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
                <input
                  placeholder="Email"
                  autoComplete="off"
                  className="text-gray-100 dark:text-white form-control focus-visible:outline-none border-0 mb-2 text-lg"
                />
              </label>
              {/* {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )} */}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-1">
                {/* <label className="form-label text-gray-900">Password</label> */}
              </div>
              <label className="input flex items-center justify-between  bg-transparent border-t-0 border-s-0 border-r-0 rounded-none border-b-1 border-[#35353C] hover:border-[#35353C] text-xs !text-gray-300 font-normal p-0">
                <input
                  placeholder="Password"
                  // type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  // {...formik.getFieldProps("password")}
                  className="text-gray-100 dark:text-white form-control focus-visible:outline-none border-0 mb-2 text-lg"
                />
                <button className="btn btn-icon">
                  <Eye size={18} />
                  {/* <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showPassword,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showPassword,
                })}
              /> */}
                </button>
              </label>
              {/* {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>
          )} */}
            </div>
            <div className="flex items-center justify-between flex-col sm:flex-row gap-3">
              {/* <label className="checkbox-group">
            <input
              className="checkbox checkbox-sm"
              type="checkbox"
              {...formik.getFieldProps("remember")}
            />
            <span className="checkbox-label">Remember me</span>
          </label> */}
            </div>

            <button
              type="submit"
              // onClick={formik.handleSubmit}
              className="btn py-7 !text-[18px] rounded-2xl bg-[linear-gradient(90deg,#FFCD0B_0%,#FFCD0B_100%)] btn-primary flex justify-center grow text-dark"
            // disabled={loading || formik.isSubmitting}
            >
              login
              {/* {loading ? "Please wait..." : "Login"} */}
            </button>
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
