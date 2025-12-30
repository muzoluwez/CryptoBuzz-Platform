import { Layout7Page } from '@/pages/layout-7/page';
import { HomePage } from '@/pages/Client/home/page';
import { IdeaPage } from '@/pages/Client/idea/page';
import { LivePage } from '@/pages/Client/live/page';
import { AcademyPage } from '@/pages/Client/academy/page';
import { SocialPage } from '@/pages/Client/social/page';
import { Navigate, Route, Routes } from 'react-router';
import { Layout7 } from '@/components/layouts/layout-7';
import { InsightPage } from '../pages/Client/insight/page';
import EducatorsPage from '../pages/Client/live/EducatorsPage';
import ViewProfile from '../pages/Client/educator/ViewProfile';
import { Login } from '@/pages/Auth/Login';
import { Signup } from '@/pages/Auth/Signup';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CryptoPage } from '../pages/Client/crypto/page';
import { ProfilePage } from '@/pages/Client/profile/page';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<Layout7 />}>
        <Route path="/layout-7" element={<Layout7Page />} />

        {/* Public Routes */}
        <Route path="/client/home" element={<HomePage />} />
        <Route path="/client/academy" element={<AcademyPage />} />
        <Route path="/client/insight" element={<InsightPage />} />
        <Route path="/client/crypto" element={<CryptoPage />} />
        <Route path="/client/live" element={<LivePage />} />
        <Route path="/client/educators" element={<EducatorsPage />} />
        <Route path="/client/profile" element={<ProfilePage />} />

        {/* Protected Routes (Semi-protected via AccessGate, but route accessible) 
            or Strictly Protected? 
            User request: "As soon as the user tries to access any login-required content... Redirect"
            IdeaPage has AccessGate inside, so route can be public. 
            Social/Journaling might be private. I'll make Journaling protected.
        */}
        <Route path="/client/idea" element={<IdeaPage />} />
        <Route path="/client/social" element={<SocialPage />} />

        {/* Strictly Protected Examples
        <Route path="/client/viewprofile" element={
          <ProtectedRoute>
            <ViewProfile />
          </ProtectedRoute>
        } /> */}

        <Route path="/client/viewprofile/:id" element={<ViewProfile />} />

      </Route>
      <Route path="*" element={<Navigate to="/client/home" replace />} />
    </Routes >
  );
}
