import { AppRouting } from '@/routing/app-routing';
import { ThemeProvider } from 'next-themes';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster } from '@/components/ui/sonner';

import { AuthProvider } from '@/context/AuthContext';
import { GrantAccessProvider } from '@/context/GrantAccessContext';
import { PaymentStatusHandler } from '@/components/payment/PaymentStatusHandler';

const { BASE_URL } = import.meta.env;

export function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      storageKey="vite-theme"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <HelmetProvider>
        <LoadingBarContainer>
          <BrowserRouter basename={BASE_URL}>
            <AuthProvider>
              <GrantAccessProvider>
                <Toaster />
                <PaymentStatusHandler />
                <AppRouting />
              </GrantAccessProvider>
            </AuthProvider>
          </BrowserRouter>
        </LoadingBarContainer>
      </HelmetProvider>
    </ThemeProvider>
  );
}
