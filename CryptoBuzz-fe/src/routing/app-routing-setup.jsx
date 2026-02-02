// auth pages
import Login from '@/pages/Auth/Login';
import Signup from '@/pages/Auth/Signup';
import AcademyPage from '@/pages/Client/academy/AcademyPage';
import CryptoPage from '@/pages/Client/crypto/CryptoPage';
import ViewProfile from '@/pages/Client/educator/ViewProfilePage';
import HomePage from '@/pages/Client/home/HomePage';
import IdeaPage from '@/pages/Client/idea/IdeaPage';
import InsightPage from '@/pages/Client/insight/InsightPage';
import EducatorsPage from '@/pages/Client/live/EducatorsPage';
import LivePage from '@/pages/Client/live/LivePage';
import MarketplacePage from '@/pages/Client/marketplace/MarketplacePage';
import ProfilePage from '@/pages/Client/profile/ProfilePage';
import SocialPage from '@/pages/Client/social/SocialPage';
import CourseDetails from '@/pages/Client/academy/CourseDetails';
// IMPORT THE NEW LAYOUT
import AuthBrandedLayout from '@/pages/layout-7/AuthBrandedLayout';
// client pages
import Layout7Page from '@/pages/layout-7/page';
import { Navigate, Route, Routes } from 'react-router';
import { Layout7 } from '@/components/layouts/layout-7';

export function AppRoutingSetup() {
  return (
    <Routes>
      {/* ================= AUTH ROUTES ================= */}
      <Route
        path="/login"
        element={
          <AuthBrandedLayout>
            <Login />
          </AuthBrandedLayout>
        }
      />

      <Route
        path="/signup"
        element={
          <AuthBrandedLayout>
            <Signup />
          </AuthBrandedLayout>
        }
      />

      {/* ================= CLIENT ROUTES ================= */}
      <Route element={<Layout7 />}>
        <Route path="/layout-7" element={<Layout7Page />} />

        <Route path="/client/home" element={<HomePage />} />
        <Route path="/client/academy" element={<AcademyPage />} />
        <Route path="/client/academy/:courseId" element={<CourseDetails />} />
        <Route path="/client/insight" element={<InsightPage />} />
        <Route path="/client/crypto" element={<CryptoPage />} />
        <Route path="/client/live" element={<LivePage />} />
        <Route path="/client/educators" element={<EducatorsPage />} />
        <Route path="/client/profile" element={<ProfilePage />} />
        <Route path="/client/idea" element={<IdeaPage />} />
        <Route path="/client/social" element={<SocialPage />} />
        <Route path="/client/marketplace" element={<MarketplacePage />} />
        <Route path="/client/view-profile/:id" element={<ViewProfile />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/client/home" replace />} />
    </Routes>
  );
}
