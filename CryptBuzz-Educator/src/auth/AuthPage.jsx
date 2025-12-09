import { Navigate, Route, Routes } from "react-router";
import {
  EducatorLogin,
  ResetPassword,
  ResetPasswordChange,
  ResetPasswordChanged,
  ResetPasswordCheckEmail,
  ResetPasswordEnterEmail,
  Signup,
  TwoFactorAuth,
  CheckEmail,
} from "./pages/jwt";
import { AuthBrandedLayout } from "@/layouts/auth-branded";
import { AuthLayout } from "@/layouts/auth";

/**
 * Authentication routing for educator-only application
 * All auth routes redirect to educator login
 */
const AuthPage = () => (
  <Routes>
    {/* Branded Layout Routes */}
    <Route element={<AuthBrandedLayout />}>
      {/* Default and login routes redirect to educator login */}
      <Route index element={<Navigate to="/auth/educator/login" replace />} />
      <Route path="/login" element={<Navigate to="/auth/educator/login" replace />} />

      {/* Educator Login - Main entry point */}
      <Route path="/educator/login" element={<EducatorLogin />} />

      {/* Auth Flow Pages */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/2fa" element={<TwoFactorAuth />} />
      <Route path="/check-email" element={<CheckEmail />} />

      {/* Password Reset Flow */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/reset-password/enter-email" element={<ResetPasswordEnterEmail />} />
      <Route path="/reset-password/check-email" element={<ResetPasswordCheckEmail />} />
      <Route path="/reset-password/change" element={<ResetPasswordChange />} />
      <Route path="/reset-password/changed" element={<ResetPasswordChanged />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Route>

    {/* Classic Layout Routes */}
    <Route element={<AuthLayout />}>
      <Route path="/classic/login" element={<Navigate to="/auth/educator/login" replace />} />
      <Route path="/classic/signup" element={<Signup />} />
      <Route path="/classic/2fa" element={<TwoFactorAuth />} />
      <Route path="/classic/check-email" element={<CheckEmail />} />
      <Route path="/classic/reset-password" element={<ResetPassword />} />
      <Route path="/classic/reset-password/enter-email" element={<ResetPasswordEnterEmail />} />
      <Route path="/classic/reset-password/check-email" element={<ResetPasswordCheckEmail />} />
      <Route path="/classic/reset-password/change" element={<ResetPasswordChange />} />
      <Route path="/classic/reset-password/changed" element={<ResetPasswordChanged />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Route>
  </Routes>
);

export { AuthPage };
