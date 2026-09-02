# Backoffice Web App

React + TypeScript + Vite backoffice application with OAuth 2.0 PKCE authentication.

## Tech Stack

- **Framework**: React 19, TypeScript 5.9, Vite 8
- **Routing**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS 4, shadcn/ui components
- **Auth**: OAuth 2.0 + PKCE via `react-oauth2-code-pkce`

## Commands

- `npm run dev` — dev server on port 3000
- `npm run build` — typecheck + production build
- `npm run lint` — ESLint
- `npm run format` / `npm run format:check` — Prettier

## Project Structure

```
src/
  components/ui/   # shadcn/ui components (Button, Card, Input, etc.)
  lib/
    auth/          # OAuth config, AuthProvider, TokenRefreshSystem
    api/           # API client with interceptors
    utils.ts       # cn() utility (clsx + tailwind-merge)
  routes/          # TanStack file-based routes
```

## Authentication (OAuth 2.0 + PKCE)

Uses `react-oauth2-code-pkce`. Key config in `src/lib/auth/config.ts`:

- **Client ID**: `19eekkg0921ktg7nh24ii72pcn`
- **SSO domain**: `sso.peerpetual.com`
- **Authorization**: `https://sso.peerpetual.com/api/oauth2/authorize`
- **Token endpoint**: `https://sso.peerpetual.com/api/oauth2/token`
- **Redirect**: `{origin}/callback`
- **Scopes**: `openid profile email`
- **Storage**: localStorage (keys prefixed `ROCP_`)

Token refresh runs automatically via `TokenRefreshSystem`:
- Checks every 60s, refreshes 5min before expiry
- Max 3 retries, 30min inactivity timeout
- Queues concurrent requests during refresh

On 401 or expired refresh token: logout + redirect to `/login`.

## API Client

Configured in `src/lib/api/client.ts`:

- **Base URL**: `https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/prod` (new `AdminApiStackStg` deployment)
- **Override**: set `VITE_API_BASE_URL` in `.env.local` to point at a different stage/stack
- **Timeout**: 30s
- **Retry**: up to 3 attempts (network errors and 5xx only), 1s exponential delay
- **Auth**: Bearer token injected automatically via request interceptor
- Use `skipAuth: true` for public endpoints

The backend lives at [Testbusters/elliotApiV2](https://github.com/Testbusters/elliotApiV2), branch `StagingAdminStack`. The active admin modules (per `lib/constructs/modules/_admin_modules.config.ts`) are: **Users, CommunityUsers, CommunityRoles, Questions, Subjects, Syllabi, Collections, Brands, Modules**. Other route constructs exist in the repo but are commented out of the active stack.

> **Source of truth**: when wiring a new endpoint, read the CDK route construct (`lib/constructs/modules/<name>.ts`) and its model file (`<name>.models.ts`) on the backend repo. **Do NOT** trust `docs/openapi.json` in this repo — it's stale (snapshot from 2026-02-27, points at the old `b2wl5e6k10` URL) and we cannot regenerate it locally.

## Mocks

The app has a per-feature mock toggle system in `src/lib/mock/index.ts`. Each service in `src/lib/services/*.ts` checks `isMockEnabled('<feature>.<op>')` before deciding mock vs. real branch. Fixtures live in `src/lib/mock/data/*-data.ts`. To wire a real endpoint, flip the matching flag from `true` → `false` and verify the service's real branch matches the backend contract. Some flags will stay `true` indefinitely because the backend has no equivalent endpoint yet (e.g. `questions.submit`, `questions.bulkDelete`, `questions.export`, `questions.hierarchy.sottoArgomenti`).

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

- `.claude/architecture.md` — provider hierarchy, auth/permission flow, routing, data fetching pattern, mock system
- `.claude/services.md` — API contracts, endpoint table, types, shape mappings per service
- `.claude/components.md` — inventory completo di componenti custom e hook
- `.claude/known-issues.md` — problemi noti, feature disabilitate, impatto audit 2026-05
- `.claude/memory/` — preferenze e feedback dell'utente
