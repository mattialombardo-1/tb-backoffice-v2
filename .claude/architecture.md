# Architecture

## Provider hierarchy (main.tsx)

```
ThemeProvider
  AuthProvider (react-oauth2-code-pkce)
    CapabilitiesProvider (fetches /community-profile)
      BrandProvider (fetches /brands)
        RouterProvider (TanStack Router, receives auth + capabilities as context)
```

## Auth flow

1. User clicca "Log In" → `auth.logIn()` avvia OAuth PKCE
2. SSO redirect → user autorizza → callback a `/callback`
3. OAuth library fa code exchange → salva token in localStorage (prefisso `ROCP_`)
4. `TokenRefreshSystem` avvia monitoring (ogni 60s, refresh 5min prima di scadenza)
5. Redirect a `/dashboard`

**Token Refresh System** (`src/lib/auth/TokenRefreshSystem.ts`):
- Controlla scadenza ogni 60s
- Refresh 5min prima della scadenza
- Max 3 retry con backoff
- Inattività >30min → stop monitoring
- Concurrency: requests in coda attendono refresh
- Fallimento dopo retry → logout + redirect `/login`

## Permission system

- `CapabilitiesProvider` fetcha `GET /community-profile` → `Capability[]`
- Index interno: `Map<resource, Set<action>>` per O(1) lookup
- Pure function `can(snapshot, resource, action)` per check sincrono
- Route guard in `_authenticated.tsx` `beforeLoad`
- Nav items gated da `can()` → nascosti se non autorizzati
- "Clienti" è l'unica voce nav non gated (nessun equivalente nel capability vocab)

## Data fetching pattern

```
Route component
  └─ Custom hook (useXxx)
       └─ Service function (xxxService.yyy)
            └─ APIClient.get/post/put/delete
                 └─ fetch + interceptors (auth header, retry)
```

- Services adattano la shape backend ↔ frontend (mapping tipi, date, etc.)
- `useApiClient()` è memoized per auth context — non creare APIClient manualmente
- Segnali AbortController passati da hook → service → client per cancellazione su unmount

## Mock system

Ogni service controlla `isMockEnabled('<feature>.<op>')` prima di scegliere branch mock vs reale.
Flags in `src/lib/mock/index.ts`, fixture in `src/lib/mock/data/*-data.ts`.
Per wiring un endpoint reale: flag `true` → `false` + verifica che il branch reale corrisponda al contratto backend.
Alcuni flag rimarranno `true` indefinitamente (endpoint backend non esiste ancora).

## File-based routing (TanStack Router)

```
/                         redirect (auth → /dashboard, else → /login)
/login                    pagina login OAuth
/callback                 OAuth callback handler
/_authenticated           layout protetto (sidebar)
  /dashboard              welcome page
  /questions              lista domande (tab: approved/to_approve/rejected)
  /questions/create       form creazione domanda
  /clients                lista clienti
  /staff                  lista staff
  /pools                  lista banche dati
  /pools/$poolId          dettaglio banca dati con domande paginate
```

Il plugin `@tanstack/router-plugin` genera `routeTree.gen.ts` automaticamente a dev/build.
Context del router: `{ auth: AuthContextValue, capabilities: CapabilitiesSnapshot }`.

## Styling

- Tailwind CSS 4 con CSS variables custom in `src/app.css`
- Dark mode: classe `dark` su `<html>`, toggle via `ThemeProvider` (`src/lib/theme.tsx`)
- Sempre usare token semantici (`bg-background`, `text-foreground`, `bg-card`, etc.) — mai colori hardcoded
- `dark:` variants Tailwind solo quando i token non bastano
- `cn()` da `src/lib/utils.ts` per merge/override classi

## Multi-brand

- `BrandProvider` (`src/lib/brand/BrandContext.tsx`) fetcha `GET /brands`
- `useBrand()` espone `brands`, `selectedBrandId`, `setSelectedBrandId`
- Selezione persistita in localStorage
- Backend per-brand permission filtering non ancora implementato
