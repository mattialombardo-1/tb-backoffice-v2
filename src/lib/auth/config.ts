import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

export const userManager = new UserManager({
  authority: import.meta.env.VITE_SSO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirect_uri: window.location.origin + '/callback',
  response_type: 'code',
  scope: 'openid profile email offline_access',
  metadataUrl: `${import.meta.env.VITE_SSO_AUTHORITY}/api/.well-known/openid-configuration`,

  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  silent_redirect_uri: window.location.origin + '/silent-renew.html',
  loadUserInfo: false,
});

export const SSO_BASE_URL = import.meta.env.VITE_SSO_AUTHORITY;
export const SSO_IMPERSONATE_URL = `${SSO_BASE_URL}/api/impersonate/start`;

const SIMULATOR_PREFIX = import.meta.env.VITE_SIMULATOR_PREFIX ?? 'stg-';

const BRAND_SIMULATOR_HOSTNAMES: Record<string, string> = {
  testbusters: `${SIMULATOR_PREFIX}simulazioni.testbusters.it`,
  peer4med: `${SIMULATOR_PREFIX}simulazioni.peer4med.it`,
};

export function getSimulatorHostname(brandName: string): string {
  const key = brandName.toLowerCase().replace(/\s+/g, '');
  return BRAND_SIMULATOR_HOSTNAMES[key] ?? `${SIMULATOR_PREFIX}simulazioni.testbusters.it`;
}
