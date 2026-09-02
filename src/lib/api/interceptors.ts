import type { RequestConfig, ResponseInterceptor } from './client';
import type { AuthContextValue } from '../auth/AuthProvider';
import { userManager } from '../auth/config';

export function createAuthRequestInterceptor(
  getAuth: () => AuthContextValue
): (config: RequestConfig) => Promise<RequestConfig> {
  return async (config: RequestConfig): Promise<RequestConfig> => {
    if (config.skipAuth) {
      return config;
    }

    // Always read from the userManager store (localStorage) rather than React
    // state — React state may lag behind after a silent renew.
    let user = await userManager.getUser();

    if (!user) {
      getAuth().login();
      throw new Error('Authentication required: No token available');
    }

    // Proactively renew if the token is already expired or about to expire.
    // oidc-client-ts queues simultaneous signinSilent calls internally so
    // firing multiple requests at the same time won't open multiple iframes.
    if (user.expired) {
      try {
        user = await userManager.signinSilent();
      } catch {
        getAuth().login();
        throw new Error('Session expired — redirecting to login');
      }
    }

    // The deployed Cognito authorizer only accepts ID tokens, not access tokens.
    const bearer = user?.id_token ?? user?.access_token;
    if (!bearer) {
      getAuth().login();
      throw new Error('Authentication required: No token available');
    }

    const headers: Record<string, string> = {
      ...config.headers,
      Authorization: `Bearer ${bearer}`,
    };

    return { ...config, headers };
  };
}

export function createAuthResponseInterceptor(
  getAuth: () => AuthContextValue
): ResponseInterceptor {
  return async (error: any): Promise<any> => {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server');
    }

    // On 401 attempt a silent renew so the next request has a fresh token.
    // We cannot retry the original request here (the interceptor architecture
    // doesn't carry enough context), but the renewed token will be used
    // automatically by the next call via the request interceptor.
    if (error?.statusCode === 401) {
      try {
        await userManager.signinSilent();
      } catch {
        getAuth().login();
      }
    }

    throw error;
  };
}
