/**
 * useApiClient Hook
 *
 * Provides an API client instance configured with authentication interceptors.
 *
 * Requirements: 6.2, 6.3, 6.4, 6.5
 */

import { useMemo, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { APIClient } from './client';
import { createAuthRequestInterceptor, createAuthResponseInterceptor } from './interceptors';

/**
 * Hook that returns a stable API client configured with authentication interceptors.
 *
 * The client is created once and never recreated (even on token refresh), so
 * CapabilitiesProvider and other consumers that depend on `client` don't
 * re-render or re-fetch on silent renew.
 *
 * The interceptors always read the latest token via `authRef` at request time.
 */
export function useApiClient(): APIClient {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;

  const client = useMemo(() => {
    const apiClient = new APIClient();
    apiClient.addRequestInterceptor(createAuthRequestInterceptor(() => authRef.current));
    apiClient.addResponseInterceptor(createAuthResponseInterceptor(() => authRef.current));
    return apiClient;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return client;
}
