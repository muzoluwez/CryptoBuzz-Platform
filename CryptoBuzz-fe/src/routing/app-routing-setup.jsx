import { Layout7Page } from '@/pages/layout-7/page';
import { HomePage } from '@/pages/Client/home/page';
import { IdeaPage } from '@/pages/Client/idea/page';
import { LivePage } from '@/pages/Client/live/page';
import { AcademyPage } from '@/pages/Client/academy/page';
import { BlogPage } from '@/pages/Client/blog/page';
import { JournalingPage } from '@/pages/Client/journaling/page';
import { SocialPage } from '@/pages/Client/social/page';
import { Navigate, Route, Routes } from 'react-router';
import { Layout7 } from '@/components/layouts/layout-7';
import { InsightPage } from '../pages/Client/insight/page';
import EducatorsPage from '../pages/Client/live/EducatorsPage';

export function AppRoutingSetup() {
  return (
    <Routes>
      <Route element={<Layout7 />}>
        <Route path="/layout-7" element={<Layout7Page />} />
        <Route path="/client/home" element={<HomePage />} />
        <Route path="/client/idea" element={<IdeaPage />} />
        <Route path="/client/live" element={<LivePage />} />
        <Route path="/client/educators" element={<EducatorsPage />} />
        <Route path="/client/academy" element={<AcademyPage />} />
        <Route path="/client/insight" element={<InsightPage />} />
        <Route path="/client/blog" element={<BlogPage />} />
        <Route path="/client/journaling" element={<JournalingPage />} />
        <Route path="/client/social" element={<SocialPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/client/home" replace />} />
    </Routes>
  );
}
