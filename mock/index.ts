/**
 * Plugin Vite che monta il mock server e inietta la sessione finta.
 *
 * Attivo in due modalità, in ogni altra non fa nulla e l'app parla con il
 * backend vero configurato in `.env.local`:
 *  - `--mode mock` (`npm run dev:mock`): dev server locale, monta anche il
 *    middleware `/mock-api` sotto — vedi `configureServer`.
 *  - `--mode demo` (`vite build --mode demo`, vedi package.json): build
 *    statica per il deploy Vercel — qui iniettiamo solo la sessione finta
 *    nell'HTML; l'API in quel caso è servita da funzioni serverless separate
 *    (`api/mock-api/[...path].ts`, che riusa lo stesso router/handler di
 *    questa cartella) perché il middleware sotto vive solo dentro il dev
 *    server e non esiste più una volta buildato.
 *
 * Il principio è che `src/` non sappia della sua esistenza: i service fanno
 * vere chiamate HTTP a `VITE_API_BASE_URL`, che in mock mode punta a
 * `http://localhost:4300/mock-api` (intercettato qui) e in demo mode a
 * `/api/mock-api` (relativo, risolto da src/lib/api/client.ts contro
 * l'origine corrente — intercettato dalla funzione serverless).
 */
import type { Plugin } from 'vite';
import { buildAuthBootstrapScript } from './auth-bootstrap';
import { getDb, MOCK_USER } from './db';
import { registerCatalogRoutes } from './handlers/catalog';
import { registerPeopleRoutes } from './handlers/people';
import { registerQuestionRoutes } from './handlers/questions';
import { createRouter, HttpError, readBody, sendJson } from './router';

const API_PREFIX = '/mock-api';

/**
 * Porta dedicata al prototipo, imposta con `strictPort`.
 *
 * Non la 3000 dello script `dev`: se fosse occupata Vite ripiegherebbe in
 * silenzio su un'altra porta, la pagina verrebbe servita da lì e continuerebbe
 * a chiamare `VITE_API_BASE_URL` sulla 3000 — cioè qualsiasi altra cosa stia
 * girando. Meglio una porta riservata e un fallimento esplicito.
 */
const MOCK_PORT = 4300;

/**
 * Config demo mode — letterali, non lette da `.env.demo`/`config.env`.
 *
 * Bug scoperto in produzione: Vercel può popolare Environment Variables del
 * progetto con questi stessi nomi a **stringa vuota** (non `undefined` — per
 * esempio se in fase di import propone dei campi dedotti da `.env.example` e
 * il form viene inviato senza compilarli). Per Vite le variabili in
 * `process.env` vincono sempre sui file `.env*`, quindi una `VITE_API_BASE_URL=""`
 * nel dashboard silenzia `.env.demo` senza errori — l'app carica, sembra
 * autenticata (la sessione finta si scrive comunque), ma ogni chiamata API
 * fallisce con un `TypeError` prima ancora di partire (`buildURL()`, vedi
 * src/lib/api/client.ts) e la UI lo mostra come "Accesso non autorizzato"
 * (CapabilitiesProvider interpreta l'errore come niente capability).
 *
 * Fix: per `--mode demo` questi tre valori sono forzati qui sotto via `define`
 * (sostituzione statica in fase di build, vedi `config()`), che bypassa del
 * tutto `process.env`/`.env.demo` — zero variabili da configurare a mano su
 * Vercel, e nessuna sorpresa se il dashboard ne ha di vuote.
 */
const DEMO_ENV = {
  VITE_API_BASE_URL: '/api/mock-api',
  VITE_SSO_AUTHORITY: 'http://mock-sso.local',
  VITE_COGNITO_CLIENT_ID: 'mock-client',
};

/** Ritardo artificiale: rende visibili skeleton e stati di caricamento. */
const LATENCY_MS = 120;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Guardia per `npm run dev` (modalità backend vero) senza `.env.local`.
 *
 * Senza queste variabili l'app parte lo stesso e sembra funzionare, ma fallisce
 * più tardi e in modo illeggibile:
 *
 *  - `VITE_SSO_AUTHORITY` mancante → `metadataUrl` diventa la stringa letterale
 *    `"undefined/api/.well-known/openid-configuration"`, che è un URL relativo:
 *    al click su "Log In" `signinRedirect()` lo chiede al dev server stesso e
 *    ottiene `Unhandled Promise Rejection: Error: Not Found (404)`, senza alcun
 *    indizio su cosa manchi davvero.
 *  - `VITE_API_BASE_URL` mancante → `TypeError` dentro `buildURL()` alla prima
 *    chiamata API (`src/lib/api/client.ts` non ha fallback).
 *
 * Meglio rifiutarsi di partire e dire cosa fare.
 */
function assertRealBackendEnv(env: Record<string, string>): void {
  const required = ['VITE_API_BASE_URL', 'VITE_SSO_AUTHORITY', 'VITE_COGNITO_CLIENT_ID'];
  const missing = required.filter((key) => !env[key]);
  if (missing.length === 0) return;

  throw new Error(
    `\n\n  Configurazione mancante per il backend vero: ${missing.join(', ')}.\n\n` +
      `  Per il prototipo con dati finti usa:\n` +
      `      npm run dev:mock          → http://localhost:${MOCK_PORT}\n\n` +
      `  Per puntare davvero allo staging:\n` +
      `      cp .env.example .env.local\n\n` +
      `  (Senza queste variabili l'app parte ma il login fallisce con un 404\n` +
      `   opaco: l'URL di metadata OIDC diventa la stringa "undefined/...".)\n`
  );
}

export function mockApiPlugin(): Plugin {
  let enabled = false;
  let env: Record<string, string> = {};

  const router = createRouter();
  registerQuestionRoutes(router);
  registerCatalogRoutes(router);
  registerPeopleRoutes(router);

  return {
    name: 'testbusters:mock-api',
    // 'serve' per il dev server (qualunque modalità, così `npm run dev` senza
    // .env.local può ancora far scattare assertRealBackendEnv sotto), più il
    // caso build per il deploy demo — vedi il commento in cima al file.
    apply: (_config, { command, mode }) => command === 'serve' || mode === 'demo',

    config(_config, { mode }) {
      if (mode === 'mock') {
        return { server: { port: MOCK_PORT, strictPort: true } };
      }
      if (mode === 'demo') {
        // Sostituzione statica in fase di build — vedi DEMO_ENV sopra per il
        // perché: bypassa process.env/.env.demo del tutto, immune a variabili
        // d'ambiente vuote impostate (anche per sbaglio) nel dashboard Vercel.
        return {
          define: Object.fromEntries(
            Object.entries(DEMO_ENV).map(([key, value]) => [
              `import.meta.env.${key}`,
              JSON.stringify(value),
            ])
          ),
        };
      }
      return;
    },

    configResolved(config) {
      enabled = config.mode === 'mock' || config.mode === 'demo';

      if (!enabled) {
        assertRealBackendEnv(config.env as Record<string, string>);
        return;
      }

      // In demo mode usiamo DEMO_ENV, non config.env — vedi il commento su
      // DEMO_ENV sopra: è la stessa `define` che src/ vede per davvero,
      // niente da leggere da .env.demo/process.env qui.
      if (config.mode === 'demo') {
        env = DEMO_ENV;
        return;
      }

      // `config.env` contiene le VITE_* già caricate da .env.mock: la chiave
      // di localStorage dipende da authority e client_id, quindi devono
      // essere esattamente le stesse che finiscono in `src/lib/auth/config.ts`.
      env = config.env as Record<string, string>;

      // Se .env.mock e il plugin puntano a porte diverse, l'app carica ma ogni
      // chiamata va nel vuoto: meglio dirlo subito e a voce alta.
      const base = env.VITE_API_BASE_URL ?? '';
      const expected = `http://localhost:${MOCK_PORT}${API_PREFIX}`;
      if (base !== expected) {
        config.logger.warn(
          `  \x1b[33m[mock]\x1b[0m VITE_API_BASE_URL è "${base}" ma il mock server ascolta su ` +
            `"${expected}". Allinea .env.mock, altrimenti nessuna chiamata arriverà al mock.`
        );
      }
    },

    transformIndexHtml() {
      if (!enabled) return;
      const authority = env.VITE_SSO_AUTHORITY || 'http://localhost:3000/mock-sso';
      const clientId = env.VITE_COGNITO_CLIENT_ID || 'mock-client';
      return [
        {
          tag: 'script',
          attrs: { type: 'module' },
          children: buildAuthBootstrapScript({
            authority,
            clientId,
            cognitoId: MOCK_USER.cognitoId,
            email: MOCK_USER.email,
            name: MOCK_USER.name,
            surname: MOCK_USER.surname,
          }),
          injectTo: 'head-prepend',
        },
      ];
    },

    configureServer(server) {
      if (!enabled) return;

      const db = getDb();
      server.config.logger.info(
        `\n  \x1b[36m➜\x1b[0m  \x1b[1mmock API\x1b[0m attiva su ${API_PREFIX} — ` +
          `${db.questions.length} domande, ${db.subjects.length} materie, ` +
          `${db.collections.length} collection, ${db.pools.length} banche dati\n` +
          `     loggato come ${MOCK_USER.email} (tutte le capability)\n`
      );

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url ?? '';
        if (!rawUrl.startsWith(API_PREFIX)) return next();

        const url = new URL(rawUrl, 'http://localhost');
        const path = url.pathname.slice(API_PREFIX.length) || '/';
        const method = (req.method ?? 'GET').toUpperCase();

        if (method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const matched = router.match(method, path);
        await delay(LATENCY_MS);

        if (!matched) {
          // Meglio un 200 vuoto che un 404: il client ritenta tutto tranne
          // 401/403 (src/lib/api/client.ts), quindi un endpoint dimenticato
          // costerebbe 4 tentativi e ~6s prima di far fallire la schermata.
          server.config.logger.warn(
            `  \x1b[33m[mock]\x1b[0m nessun handler per ${method} ${path} — risposta vuota`
          );
          sendJson(res, 200, { data: [], total: 0, page: 1, limit: 20 });
          return;
        }

        try {
          const body = await readBody(req);
          const result = await matched.handler({
            method,
            path,
            params: matched.params,
            query: url.searchParams,
            body,
          });
          sendJson(res, result === undefined ? 204 : 200, result);
        } catch (err) {
          const status = err instanceof HttpError ? err.status : 500;
          const message = err instanceof Error ? err.message : 'Mock server error';
          if (status >= 500) server.config.logger.error(`  [mock] ${method} ${path}: ${message}`);
          sendJson(res, status, { error: message, message, statusCode: status });
        }
      });
    },
  };
}
