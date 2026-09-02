# Backoffice Web App

React + TypeScript + Vite backoffice application with OIDC authentication.

> Questa copia è la baseline per il lavoro di design. Gira in locale con dati
> finti: `npm run dev:mock` → http://localhost:4300. Vedi `mock/README.md`.

## Tech Stack

- **Framework**: React 19, TypeScript 5.9, Vite 8
- **Routing**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Auth**: OIDC Authorization Code + PKCE via `oidc-client-ts` v3

## Commands

- `npm run dev:mock` — dev server con mock API + sessione finta, porta 4300 (nessun backend richiesto)
- `npm run dev` — dev server sul backend vero, porta 3000 (richiede `.env.local`)
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Project Structure

```
src/
  components/ui/   # shadcn/ui components (Button, Card, Input, etc.)
  lib/
    auth/          # UserManager config, AuthProvider, CapabilitiesProvider
    api/           # API client with interceptors
    utils.ts       # cn() utility (clsx + tailwind-merge)
    services/      # un file per risorsa (questions.ts, pools.ts, …)
    hooks/         # un hook per schermata, sopra i service
  routes/          # TanStack file-based routes
mock/              # mock server locale (fuori da src/, vedi mock/README.md)
```

## Authentication (OIDC + PKCE)

Uses **`oidc-client-ts` v3** (`UserManager`). Config in `src/lib/auth/config.ts`,
tutto da env — non ci sono valori hardcoded:

| Env | Uso |
|---|---|
| `VITE_SSO_AUTHORITY` | authority + `metadataUrl` (`{authority}/api/.well-known/openid-configuration`) |
| `VITE_COGNITO_CLIENT_ID` | client_id |
| `VITE_SIMULATOR_PREFIX` | prefisso host del simulatore, default `stg-` |

- **Redirect**: `{origin}/callback` · **Scopes**: `openid profile email offline_access`
- **Storage**: localStorage, chiave `oidc.user:{authority}:{client_id}`
  (`WebStorageStateStore` usa il prefisso `oidc.`)
- **Refresh**: `automaticSilentRenew: true` di `oidc-client-ts`, via iframe su
  `public/silent-renew.html`. **Non esiste** nessun `TokenRefreshSystem.ts`.
- `loadUserInfo: false` — il profilo viene dai claim dell'ID token, nessuna
  chiamata a `/userinfo`.

Il bearer usato nelle richieste è **`user.id_token`**, non l'access token:
l'authorizer Cognito deployato accetta solo ID token
(`src/lib/api/interceptors.ts`).

**Attenzione ai redirect impliciti.** L'interceptor di richiesta rilegge
`userManager.getUser()` da localStorage a *ogni* chiamata; su miss, token scaduto
o 401 tenta `signinSilent()` e poi `signinRedirect()` — cioè un redirect duro
verso l'SSO. Fingere lo stato React di `AuthProvider` non basta per girare
offline: serve una sessione scritta in localStorage (è quello che fa il mock).

## API Client

Configured in `src/lib/api/client.ts`:

- **Base URL**: solo `import.meta.env.VITE_API_BASE_URL`, **senza fallback nel
  codice**. Se non è impostata, `buildURL()` lancia `TypeError` alla prima
  chiamata. Il valore di staging è in `.env.example`.
- **Timeout**: 60s (tollera i cold start dei lambda)
- **Retry**: fino a 3 tentativi con delay crescente, per **tutto tranne 401/403**
  e gli abort — quindi anche 404 e 5xx. Un endpoint mancante costa 4 tentativi
  e ~6s prima di fallire.
- **Auth**: Bearer token injected automatically via request interceptor
- Use `skipAuth: true` for public endpoints

The backend lives at [Testbusters/elliotApiV2](https://github.com/Testbusters/elliotApiV2), branch `StagingAdminStack`. The active admin modules (per `lib/constructs/modules/_admin_modules.config.ts`) are: **Users, CommunityUsers, CommunityRoles, Questions, Subjects, Syllabi, Collections, Brands, Modules**. Other route constructs exist in the repo but are commented out of the active stack.

> **Source of truth**: when wiring a new endpoint, read the CDK route construct (`lib/constructs/modules/<name>.ts`) and its model file (`<name>.models.ts`) on the backend repo. **Do NOT** trust `docs/openapi.json` in this repo — it's stale (snapshot from 2026-02-27, points at the old `b2wl5e6k10` URL) and we cannot regenerate it locally.

## Mock locale

Il vecchio sistema di flag per-feature (`src/lib/mock/`, `isMockEnabled()`) **non
esiste più**: è stato rimosso e ogni service chiama il backend vero. Se trovi
documentazione che lo cita, è vecchia.

Al suo posto c'è un **mock server nel dev server Vite**, in `mock/`, attivo solo
con `npm run dev:mock`. Intercetta `/mock-api` e serve ~200 domande finte da un
seed deterministico. `src/` non lo conosce: i service fanno vere chiamate HTTP e
non contengono nessun ramo mock.

Dettagli, dati e limiti: **`mock/README.md`**.

L'unica operazione davvero non implementata è `questionsService.bulkDelete`, che
lancia un errore lato client: l'endpoint non esiste nemmeno sul backend.

## Cosa sta nel repo e cosa no

Una domanda sola, prima di scrivere un file:
**serve a chi implementa, o serve solo a noi per decidere?**

| Serve a implementare → **tracciato** | Serve a decidere → **`design/`, gitignored** |
|---|---|
| `docs/specs/` — cosa costruire | note di call, chi ha detto cosa |
| `docs/decisions/` — decisioni prese e il vincolo tecnico | opzioni scartate, ipotesi non validate |
| `.claude/*.md` — come funziona il codice oggi | benchmark, riferimenti, esplorazioni |
| `mock/README.md`, `README.md` — come far girare l'app | dinamiche di cliente e di team |

Il repo contiene il **risultato** del ragionamento, non il ragionamento. Scrivi
i file tracciati per Edoardo: se una frase ha senso solo per chi era in call,
va in `design/`.

Regole complete e casi limite: **`design/CLAUDE.md`**.
Template: `docs/specs/_TEMPLATE.md`, `docs/decisions/_TEMPLATE.md`.

Corollario che questo repo ha già violato: la documentazione tracciata descrive
il codice **com'è adesso**. Quando smette di essere vera si corregge o si marca
obsoleta, altrimenti diventa un altro `docs/MOCK_MIGRATION.md`.

## UI Components (shadcn/ui)

Components live in `src/components/ui/` and come from the [bundui/shadcn-ui-kit-dashboard](https://github.com/bundui/shadcn-ui-kit-dashboard) repo. They use:
- Radix UI primitives (`@radix-ui/react-*`)
- `class-variance-authority` for variants
- `cn()` from `src/lib/utils.ts` for class merging
- CSS variables for theming (defined in `src/app.css`)

## Conventions

- Path alias: `@/` maps to `src/`
- Use named imports for shadcn components
- Use `cn()` for conditional/merged Tailwind classes
- Protected routes go under `_authenticated` layout route
- Dark mode is first-class: always use semantic tokens (`bg-background`, `text-foreground`, etc.), never hardcoded colors

## Context files (read these for deeper context)

- `.claude/architecture.md` — provider hierarchy, auth/permission flow, routing, data fetching pattern
- `mock/README.md` — mock server locale, seed, come far girare l'app offline
- `.claude/services.md` — API contracts, endpoint table, types, shape mappings per service
- `.claude/components.md` — inventory completo di componenti custom e hook
- `.claude/known-issues.md` — problemi noti, feature disabilitate, impatto audit 2026-05
- `.claude/memory/` — preferenze e feedback dell'utente
- `design/CLAUDE.md` — cosa sta nel repo e cosa no (specifiche vs deliberazione)
