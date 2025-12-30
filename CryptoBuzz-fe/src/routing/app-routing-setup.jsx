import { Navigate, Route, Routes } from 'react-router';
import { Layout7 } from '@/components/layouts/layout-7';

// client pages
import { Layout7Page } from '@/pages/layout-7/page';
import { HomePage } from '@/pages/Client/home/page';
import { IdeaPage } from '@/pages/Client/idea/page';
import { LivePage } from '@/pages/Client/live/page';
import { AcademyPage } from '@/pages/Client/academy/page';
import { SocialPage } from '@/pages/Client/social/page';
import { InsightPage } from '@/pages/Client/insight/page';
import { CryptoPage } from '@/pages/Client/crypto/page';
import EducatorsPage from '@/pages/Client/live/EducatorsPage';
import ViewProfile from '@/pages/Client/educator/ViewProfile';

// auth pages
import { Login } from '@/pages/Auth/Login';
import { Signup } from '@/pages/Auth/Signup';

// IMPORT THE NEW LAYOUT 
import AuthBrandedLayout from "@/pages/layout-7/AuthBrandedLayout";
import { ProfilePage } from '@/pages/Client/profile/page';
  
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
        <Route path="/client/insight" element={<InsightPage />} />
        <Route path="/client/crypto" element={<CryptoPage />} />
        <Route path="/client/live" element={<LivePage />} />
        <Route path="/client/educators" element={<EducatorsPage />} />
        <Route path="/client/profile" element={<ProfilePage />} />
        <Route path="/client/idea" element={<IdeaPage />} />
        <Route path="/client/social" element={<SocialPage />} />
        <Route path="/client/view-profile/:id" element={<ViewProfile />} />
      </Route>

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/client/home" replace />} />
    </Routes>
  );
}
