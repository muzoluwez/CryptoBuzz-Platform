import { Navigate, Route, Routes } from "react-router";
import { DefaultPage, Demo1DarkSidebarPage } from "@/pages/dashboards";
import { AuthPage } from "@/auth";
import { RequireAuth } from "@/auth/RequireAuth";
import { Demo1Layout } from "@/layouts/demo1";
import { ErrorsRouting } from "@/errors";
import { useAuthContext } from "../auth/useAuthContext";
import EducatorTradeIdeas from "../pages/educator/educator-trade-ideas/EducatorTradeIdeas";
import { EducatorDetailPage } from "../pages/educatorDetail";
import EducatorProfile from "../pages/educator/educator-profile/EducatorProfile";
import EducatorStreamSchedule from "../pages/educator/educator-stream-schedule/EducatorStreamSchedule";
import EducatorLiveSession from "../pages/educator/live-session/EducatorLiveSession";
import EducatorRecording from "../pages/educator/recording/EducatorRecording";
import CreateEducatorRecording from "../pages/educator/recording/CreateEducatorRecording";
import EducatorLiveSessionView from "../pages/educator/live-session/EducatorLiveSessionView";
import EducatorRecordingSession from "../pages/educator/recording/EducatorRecordingSession";
import EducatorTradeAnalysis from "../pages/educator/educator-trade-analysis/EducatorTradeAnalysis";
import EducatorCommunityFeed from "../pages/educator/educator-community-feed/EducatorCommunityFeed";
import PrivacyPolicy from "../auth/pages/PrivacyPolicy";
import TermsOfService from "../auth/pages/TermsOfService";
import Support from "../auth/pages/Support";
import EducatorEndSession from "../pages/educator/educator-end-session/EducatorEndSession";
import EducatorEndSchedule from "../pages/educator/educator-endStream-schedule/EducatorEndSchedule";
import EducatorRating from "../pages/educator/educator-rating/EducatoRating";
import Courses from "../pages/educator/courses/Courses";

// Educator-only routes
const educatorRoutes = [
  { path: "/", element: <DefaultPage /> },
  { path: "/educator/ideas", element: <EducatorTradeIdeas /> },
  { path: "/educator/trade-analysis", element: <EducatorTradeAnalysis /> },
  { path: "/educator/courses", element: <Courses /> },
  { path: "/educator/live-session", element: <EducatorLiveSession /> },
  { path: "/educator/recordings", element: <EducatorRecording /> },
  {
    path: "/educator/recordings/:callId",
    element: <CreateEducatorRecording />,
  },
  {
    path: "/educator/live-session/:callId",
    element: <EducatorLiveSessionView />,
  },
  { path: "/educator/dark-sidebar", element: <Demo1DarkSidebarPage /> },
  { path: "/educator/educator-details", element: <EducatorDetailPage /> },
  { path: "/educator/profile", element: <EducatorProfile /> },
  { path: "/educator/stream-schedule", element: <EducatorStreamSchedule /> },
  { path: "/educator/ended-live-sessions", element: <EducatorEndSession /> },
  {
    path: "/educator/ended-stream-schedule",
    element: <EducatorEndSchedule />,
  },
  { path: "/educator/stream-recording", element: <EducatorRecording /> },
  {
    path: "/educator/stream-recording/list",
    element: <EducatorRecordingSession />,
  },
  {
    path: "/educator/iq-social",
    element: <EducatorCommunityFeed />,
  },
  { path: "/educator/rating", element: <EducatorRating /> },
];

const AppRoutingSetup = () => {
  const { auth } = useAuthContext();

  return (
    <Routes>
      <Route element={<RequireAuth />}>
        {educatorRoutes.map((route, index) => (
          <Route key={index} element={<Demo1Layout />}>
            <Route path={route.path} element={route.element} />
          </Route>
        ))}
      </Route>

      {/* Public Routes */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="error/*" element={<ErrorsRouting />} />
      <Route path="auth/*" element={<AuthPage />} />

      {/* Catch-all Route */}
      <Route
        path="*"
        element={<Navigate to={auth?.token ? "/error/404" : "/auth/login"} />}
      />
    </Routes>
  );
};

export { AppRoutingSetup };
