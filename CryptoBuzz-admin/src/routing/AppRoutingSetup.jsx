import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from "react-router";
import { ScreenLoader } from "@/components";
import { DefaultPage } from "@/pages/dashboards";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import { useAuthContext } from "../auth/useAuthContext";

// ============================================================================
// ADMIN PAGE IMPORTS
// ============================================================================

// Trade & Analysis Pages
const AdminTradeIdeas = lazy(() => import("../pages/admin/admin-trade-ideas/AdminTradeIdeas"));
const AdminTradeAnalysis = lazy(() => import("../pages/admin/admin-trade-analysis/AdminTradeAnalysis"));

// Live Session & Recording Pages
const LiveSession = lazy(() => import("../pages/admin/live-session/LiveSession"));
const AdminLiveSessionView = lazy(() => import("../pages/admin/live-session/AdminLiveSessionView"));
const AdminRecording = lazy(() => import("../pages/admin/recording/AdminRecording"));
const AdminRecordingSession = lazy(() => import("../pages/admin/recording/AdminRecordingSession"));

// Course & Academy Pages
const Courses = lazy(() => import("../pages/admin/courses/Courses"));
const AdminAcademyCategory = lazy(() => import("../pages/admin/academy-category/AdminAcademyCategory"));

// Educator Management Pages
const Educators = lazy(() => import("../pages/admin/educators/Educators"));
const AdminRating = lazy(() => import("../pages/admin/admin-educator-rating/AdminRating"));
const AdminEducatorRatings = lazy(() => import("../pages/admin/admin-educator-rating/AdminEducatorRatings"));

// Schedule & Session Management Pages
const AdminStreamSchedule = lazy(() => import("../pages/admin/admin-stream-schedule/AdminStreamSchedule"));
const AdminEndSession = lazy(() => import("../pages/admin/admin-end-session/AdminEndSession"));
const AdminEndSchedule = lazy(() => import("../pages/admin/admin-end-schedule/AdminEndSchedule"));

// Profile & Settings Pages
const AdminProfile = lazy(() => import("../pages/admin/admin-profile/AdminProfile"));
const GeneralSetting = lazy(() => import("../pages/admin/general-setting/GeneralSetting"));

// Community & Social Pages
const AdminCommunityFeed = lazy(() => import("../pages/admin/admin-community-feed/AdminCommunityFeed"));
const AdminIqCrypto = lazy(() => import("../pages/admin/admin-iq-crypto/AdminIqCrypto"));
const IqSocial = lazy(() => import("../pages/admin/iq-social/IqSocial"));

// KPIs & Analytics Pages
const EducatorKpi = lazy(() => import("../pages/admin/KPIs Page/EducatorKpi"));
const KpisDashboard = lazy(() => import("../pages/admin/KPIs Page/Kpis"));

// Package & Task Management Pages
const Package = lazy(() => import("../pages/admin/admin-package/Package"));
const Task = lazy(() => import("../pages/admin/task-management/Task"));

// Legal & Support Pages
const PrivacyPolicy = lazy(() => import("../auth/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../auth/pages/TermsOfService"));
const Support = lazy(() => import("../auth/pages/Support"));

// ============================================================================
// ADMIN ROUTES CONFIGURATION
// ============================================================================

/**
 * Admin Routes Configuration
 * 
 * This object defines all available routes for admin users.
 * Each route includes:
 * - path: The URL path for the route
 * - element: The React component to render for this route
 */
const routes = {
  admin: [
    // Dashboard - Default landing page for admin
    { path: "/", element: <DefaultPage /> },

    // Trade Ideas - Manage and view all trade ideas
    { path: "/admin/ideas", element: <AdminTradeIdeas /> },

    // Trade Analysis - View and analyze trading data
    { path: "/admin/trade-analysis", element: <AdminTradeAnalysis /> },

    // Courses - Manage all educational courses
    { path: "/admin/courses", element: <Courses /> },

    // Live Session - View all active and scheduled live sessions
    { path: "/admin/live-session", element: <LiveSession /> },

    // Live Session View - Join/view a specific live session by callId
    { path: "/admin/live-session/:callId", element: <AdminLiveSessionView /> },

    // Recordings - View all recorded sessions
    { path: "/admin/recordings", element: <AdminRecording /> },

    // Educators - Manage all educators on the platform
    { path: "/admin/educators", element: <Educators /> },

    // Profile - Admin user profile and settings
    { path: "/admin/profile", element: <AdminProfile /> },

    // Academy Category - Manage course categories
    { path: "/admin/academy-category", element: <AdminAcademyCategory /> },

    // Stream Schedule - View and manage streaming schedules
    { path: "/admin/stream-schedule", element: <AdminStreamSchedule /> },

    // Stream Recording - Alternative route for recordings
    { path: "/admin/stream-recording", element: <AdminRecording /> },

    // Stream Recording Session - View specific recording by id
    { path: "/admin/stream-recording/:id", element: <AdminRecordingSession /> },

    // General Settings - Platform-wide configuration
    { path: "admin/general-setting", element: <GeneralSetting /> },

    // IQ Social - Manage community feed and social interactions
    { path: "/admin/iq-social", element: <IqSocial /> },

    // KPIs - View educator performance metrics
    { path: "/admin/kpis", element: <EducatorKpi /> },

    // KPIs Dashboard - Detailed KPI dashboard for specific educator/session
    { path: "/admin/kpis/:callId", element: <KpisDashboard /> },

    // Ended Live Sessions - View history of completed sessions
    { path: "/admin/ended-live-sessions", element: <AdminEndSession /> },

    // Educator Ended Schedule - View completed educator schedules
    { path: "/admin/educator-ended-schedule", element: <AdminEndSchedule /> },

    // Package - Manage subscription packages
    { path: "/admin/package", element: <Package /> },

    // Ticket - Task and ticket management system
    { path: "/admin/ticket", element: <Task /> },

    // Educator Rating - View all educator ratings
    { path: "/admin/educator-rating", element: <AdminRating /> },

    // Educator Ratings Detail - View ratings for specific educator
    {
      path: "/admin/educator-rating/:educatorId",
      element: <AdminEducatorRatings />,
    },

    // IQ Crypto - Cryptocurrency analysis and insights
    { path: "/admin/iq-crypto", element: <AdminIqCrypto /> },
  ],
};

// ============================================================================
// MAIN ROUTING COMPONENT
// ============================================================================

/**
 * AppRoutingSetup Component
 * 
 * Main routing configuration for the CryptoBuzz Admin application.
 * 
 * Features:
 * - Admin-only routes with Demo1Layout wrapper
 * - Authentication handling via RequireAuth
 * - Public routes for auth, errors, and legal pages
 * - Automatic redirect to login for unauthenticated users
 * - 404 error handling for invalid routes
 */
const AppRoutingSetup = () => {
  const { auth } = useAuthContext();

  // Get admin routes from configuration
  const adminRoutes = routes.admin || [];

  return (
    <Suspense fallback={<ScreenLoader />}>
      <Routes>
        {/* Authentication wrapper - protects all routes */}
        <Route element={<RequireAuth />}></Route>

        {/* Admin Routes - All admin pages wrapped with Demo1Layout and protected by RequireAuth */}
        <Route element={<RequireAuth />}>
          {adminRoutes.map((route, index) => (
            <Route key={index} element={<Demo1Layout />}>
              <Route path={route.path} element={route.element} />
            </Route>
          ))}
        </Route>

        {/* Public Routes - Legal and Support Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />

        {/* Error Handling Routes */}
        <Route path="error/*" element={<ErrorsRouting />} />

        {/* Authentication Routes - Login, Signup, etc. */}
        <Route path="auth/*" element={<AuthPage />} />

        {/* Catch-all Route - Redirect to 404 or login based on auth status */}
        <Route
          path="*"
          element={<Navigate to={auth?.token ? "/error/404" : "/auth/login"} />}
        />
      </Routes>
    </Suspense>
  );
};

export { AppRoutingSetup };



