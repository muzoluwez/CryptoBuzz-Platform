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
// EDUCATOR PAGE IMPORTS
// ============================================================================

// Trade & Analysis Pages
// const EducatorTradeIdeas = lazy(() => import("../pages/educator/educator-trade-ideas/EducatorTradeIdeas"));
// const EducatorTradeAnalysis = lazy(() => import("../pages/educator/educator-trade-analysis/EducatorTradeAnalysis"));

// // Live Session & Recording Pages
// const EducatorRecordingSession = lazy(() => import("../pages/educator/recording/EducatorRecordingSession"));;

// // Course & Academy Pages
// const Courses = lazy(() => import("../pages/educator/courses/Courses"));

// // Educator Management Pages
// const EducatorRating = lazy(() => import("../pages/educator/educator-rating/EducatoRating"));

// // Profile & Settings Pages
// const EducatorProfile = lazy(() => import("../pages/educator/educator-profile/EducatorProfile"));

// // Community & Social Pages
// const EducatorCommunityFeed = lazy(() => import("../pages/educator/educator-community-feed/EducatorCommunityFeed"));
// const EducatorIqCrypto = lazy(() => import("../pages/educator/educator-iq-crypto/EducatorIqCrypto"));


// // Legal & Support Pages
// const PrivacyPolicy = lazy(() => import("../auth/pages/PrivacyPolicy"));
// const TermsOfService = lazy(() => import("../auth/pages/TermsOfService"));
// const Support = lazy(() => import("../auth/pages/Support"));

// //Educator Routes
// const EducatorStreamSchedule = lazy(() => import("../pages/educator/educator-stream-schedule/EducatorStreamSchedule"));
// const EducatorEndSession = lazy(() => import("../pages/educator/educator-end-session/EducatorEndSession"));
// const EducatorLiveSession = lazy(() => import("../pages/educator/live-session/EducatorLiveSession"));
// const EducatorEndSchedule = lazy(() => import("../pages/educator/educator-endStream-schedule/EducatorEndSchedule"));
// const EducatorLiveSessionView = lazy(() => import("../pages/educator/live-session/EducatorLiveSessionView"));

import EducatorTradeIdeas from "../pages/educator/educator-trade-ideas/EducatorTradeIdeas";
import EducatorTradeAnalysis from "../pages/educator/educator-trade-analysis/EducatorTradeAnalysis";
import Courses from "../pages/educator/courses/Courses";
import EducatorRecordingSession from "../pages/educator/recording/EducatorRecordingSession";
import EducatorProfile from "../pages/educator/educator-profile/EducatorProfile";
import EducatorCommunityFeed from "../pages/educator/educator-community-feed/EducatorCommunityFeed";
import EducatorIqCrypto from "../pages/educator/educator-iq-crypto/EducatorIqCrypto";
import EducatorRating from "../pages/educator/educator-rating/EducatoRating";
import EducatorStreamSchedule from "../pages/educator/educator-stream-schedule/EducatorStreamSchedule";
import EducatorEndSession from "../pages/educator/educator-end-session/EducatorEndSession";
import EducatorLiveSession from "../pages/educator/live-session/EducatorLiveSession";
import EducatorEndSchedule from "../pages/educator/educator-endStream-schedule/EducatorEndSchedule";
import EducatorLiveSessionView from "../pages/educator/live-session/EducatorLiveSessionView";
import PrivacyPolicy from "../auth/pages/PrivacyPolicy";
import TermsOfService from "../auth/pages/TermsOfService";
import Support from "../auth/pages/Support";

// ============================================================================
// Educator ROUTES CONFIGURATION
// ============================================================================

/**
 * Educator Routes Configuration
 * 
 * This object defines all available routes for Educator users.
 * Each route includes:
 * - path: The URL path for the route
 * - element: The React component to render for this route
 */
const routes = {
  educator: [
    // Dashboard - Default landing page for Educator
    { path: "/", element: <DefaultPage /> },

    // Trade Ideas - Manage and view all trade idea
    { path: "/educator/ideas", element: <EducatorTradeIdeas /> },


    // Trade Analysis - View and analyze trading data
    { path: "/educator/trade-analysis", element: <EducatorTradeAnalysis /> },

    // Courses - Manage all educational courses
    { path: "/educator/courses", element: <Courses /> },

    // Recordings - View all recorded sessions
    { path: "educator/stream-recording", element: <EducatorRecordingSession /> },

    // Profile - Educator user profile and settings
    { path: "/educator/profile", element: <EducatorProfile /> },

    // Social Buzz - Manage community feed and social interactions

    { path: "/educator/iq-social", element: <EducatorCommunityFeed /> },

    { path: "/educator/rating", element: <EducatorRating /> },

    { path: "/educator/iq-crypto", element: <EducatorIqCrypto /> },



    //Live Stream 
    { path: "/educator/stream-schedule", element: <EducatorStreamSchedule /> },
    {
      path: "/educator/ended-schedule",
      element: <EducatorEndSchedule />,
    },
    { path: "/educator/live-session", element: <EducatorLiveSession /> },
    { path: "/educator/ended-live-sessions", element: <EducatorEndSession /> },


    {
      path: "/educator/live-session/:callId",
      element: <EducatorLiveSessionView />,
    },

    {
      path: "/educator/live-session/:callId",
      element: <EducatorLiveSessionView />,
    },

  ],
};

// ============================================================================
// MAIN ROUTING COMPONENT
// ============================================================================

/**
 * AppRoutingSetup Component
 * 
 * Main routing configuration for the Cripto Buzz Educator application.
 * 
 * Features:
 * - Educator-only routes with Demo1Layout wrapper
 * - Authentication handling via RequireAuth
 * - Public routes for auth, errors, and legal pages
 * - Automatic redirect to login for unauthenticated users
 * - 404 error handling for invalid routes
 */
const AppRoutingSetup = () => {
  const { auth } = useAuthContext();

  // Get educator routes from configuration
  const educatorRoutes = auth?.user?.role?.toLowerCase() === "educator" ? routes?.educator || [] : [];


  return (
    <Suspense fallback={<ScreenLoader />}>
      <Routes>
        <Route element={<RequireAuth />}></Route>
        {/* Educator Routes - All educator pages wrapped with Demo1Layout and protected by RequireAuth */}
        <Route element={<RequireAuth />}>
          {educatorRoutes.map((route, index) => (
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



