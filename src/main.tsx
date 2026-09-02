import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '@tanstack/react-router';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import './lib/i18n';
import { AuthProvider, CapabilitiesProvider, useAuth, useCapabilities } from './lib/auth';
import { ImpersonationProvider } from './lib/debug/roleImpersonation';
import { ThemeProvider } from './lib/theme';
import { queryClient } from './lib/query';
import { router } from './router';

const persister = createSyncStoragePersister({ storage: window.localStorage });
import 'katex/dist/katex.min.css';
import './app.css';

/**
 * App component that provides authentication + capability context to the router
 */
function App() {
  const auth = useAuth();
  const capabilities = useCapabilities();

  return <RouterProvider router={router} context={{ auth, capabilities }} />;
}

/**
 * Root component that wraps the app with AuthProvider + CapabilitiesProvider
 */
function Root() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ThemeProvider>
        <AuthProvider>
          <CapabilitiesProvider>
            <ImpersonationProvider>
              <App />
            </ImpersonationProvider>
          </CapabilitiesProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
