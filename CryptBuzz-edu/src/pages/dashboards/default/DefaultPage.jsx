import { useLayout } from '@/providers';
import { Demo1LightSidebarPage } from '../';

/**
 * DefaultPage Component
 * 
 * Renders the default admin dashboard page.
 * Currently uses Demo1LightSidebarPage for all layouts.
 */
const DefaultPage = () => {
  const { currentLayout } = useLayout();

  // Default to Demo1 layout for all cases
  return <Demo1LightSidebarPage />;
};

export { DefaultPage };
