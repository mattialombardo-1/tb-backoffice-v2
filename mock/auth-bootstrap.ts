/**
 * Auth finta, senza toccare `src/lib/auth`.
 *
 * `oidc-client-ts` legge l'utente da localStorage alla chiave
 * `oidc.user:{authority}:{client_id}` (WebStorageStateStore usa il prefisso
 * "oidc.", UserManager la chiave `user:{authority}:{client_id}`) e lo
 * deserializza con `User.fromStorageString`, che è un semplice
 * `new User(JSON.parse(...))`. Ci basta scrivere lì un oggetto della forma
 * giusta prima che React monti: da quel momento `AuthProvider` trova l'utente,
 * `isAuthenticated` è true e l'interceptor in `src/lib/api/interceptors.ts`
 * trova il bearer token invece di fare `signinRedirect()` verso l'SSO.
 *
 * Lo script viene iniettato inline in `index.html` dal plugin, solo in mock
 * mode: nel bundle di produzione non esiste.
 */

function base64url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export interface AuthBootstrapConfig {
  authority: string;
  clientId: string;
  cognitoId: string;
  email: string;
  name: string;
  surname: string;
}

export function buildAuthBootstrapScript(config: AuthBootstrapConfig): string {
  // Scadenza a +10 anni: `automaticSilentRenew` arma un timer solo quando il
  // token si avvicina alla scadenza, quindi l'iframe verso
  // public/silent-renew.html (che caricherebbe oidc-client-ts da unpkg) non
  // parte mai.
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 3600;

  const claims = {
    sub: config.cognitoId,
    'cognito:username': config.cognitoId,
    email: config.email,
    email_verified: true,
    given_name: config.name,
    family_name: config.surname,
    name: `${config.name} ${config.surname}`,
    aud: config.clientId,
    iss: config.authority,
    token_use: 'id',
    exp: expiresAt,
    iat: Math.floor(Date.now() / 1000),
  };

  // JWT ben formato ma non firmato: il mock server non lo verifica, serve solo
  // perché qualsiasi decoder lato client non esploda.
  const jwt = [
    base64url(JSON.stringify({ alg: 'none', typ: 'JWT' })),
    base64url(JSON.stringify(claims)),
    'mock-signature',
  ].join('.');

  const storedUser = {
    id_token: jwt,
    session_state: null,
    access_token: jwt,
    refresh_token: 'mock-refresh-token',
    token_type: 'Bearer',
    scope: 'openid profile email offline_access',
    profile: claims,
    expires_at: expiresAt,
  };

  const storageKey = `oidc.user:${config.authority}:${config.clientId}`;

  return `
// --- mock auth bootstrap (solo in mode=mock) ---
try {
  localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(JSON.stringify(storedUser))});
  // La cache di TanStack Query è persistita in localStorage con gcTime 24h e
  // senza buster: senza questa pulizia, dopo un cambio di seed continueresti a
  // vedere i dati vecchi senza capire perché.
  localStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  console.info('[mock] utente finto: ${config.email} — dati serviti da /mock-api');
} catch (err) {
  console.error('[mock] impossibile scrivere la sessione finta in localStorage', err);
}
`.trim();
}
