# Architecture

## Provider hierarchy (main.tsx)

```
PersistQueryClientProvider (cache TanStack Query persistita in localStorage)
  ThemeProvider
    AuthProvider (oidc-client-ts)
      CapabilitiesProvider (fetches /community-profile)
        ImpersonationProvider (override capability per debug, da /settings)
          RouterProvider (TanStack Router, riceve auth + capabilities come context)
```

**`BrandProvider` NON è montato.** Esiste in `src/lib/brand/BrandContext.tsx`, e
`BrandPicker` esiste in `src/components/`, ma nessuno dei due è renderizzato.

La cache di Query è persistita con `gcTime` 24h e **senza `buster`**: dopo un
cambio di dati puoi vedere valori vecchi finché non pulisci
`localStorage.REACT_QUERY_OFFLINE_CACHE`.

## Auth flow

1. User clicca "Log In" → `auth.login()` → `userManager.signinRedirect()`
2. SSO redirect → user autorizza → callback a `/callback`
3. `userManager.signinRedirectCallback()` fa il code exchange e salva l'utente in
   localStorage alla chiave `oidc.user:{authority}:{client_id}`
4. Redirect a `sessionStorage.redirectAfterLogin` ?? `/dashboard`

**Refresh**: `automaticSilentRenew: true` di `oidc-client-ts`. Il timer parte
solo quando un utente è caricato e usa `setInterval` con periodo ≤5s che
controlla la scadenza; il rinnovo avviene in un iframe su
`public/silent-renew.html` (che carica `oidc-client-ts` da **unpkg**, dipendenza
CDN a runtime). Non esiste nessun `TokenRefreshSystem.ts`.

**Redirect impliciti verso l'SSO** — tutti in `src/lib/api/interceptors.ts`:
- nessun utente in localStorage → `login()` → `signinRedirect()`
- utente scaduto → `signinSilent()`, e se fallisce `signinRedirect()`
- risposta 401 → `signinSilent()`, e se fallisce `signinRedirect()`

L'interceptor legge **sempre da localStorage**, mai dallo stato React: per
girare offline serve una sessione scritta lì (vedi `mock/README.md`).

**Quirk**: `auth.isLoading` è esposto sul context ma non è consumato da nessuno.
`RouterProvider` monta subito con `isAuthenticated: false` mentre `getUser()` è
ancora pendente, quindi anche un utente loggato passa per un istante da `/login`,
da cui un `useEffect` lo rimbalza su `/dashboard`.

## Permission system

- `CapabilitiesProvider` fetcha `GET /community-profile` → `Capability[]`
- Index interno: `Map<resource, Set<action>>` per O(1) lookup
- Pure function `can(snapshot, resource, action)` per check sincrono
- Le action sono **maiuscole**: `CREATE` / `READ` / `UPDATE` / `DELETE`
- Route guard in `_authenticated.tsx` `beforeLoad` (solo auth), più guard di
  capability su `questions/create`, `questions/$questionId`, `questions/import`,
  `my-slots`
- Nav items gated da `can()` → nascosti se non autorizzati
- "Clienti" e "Home" sono le uniche voci nav non gated
- `ImpersonationProvider` (`src/lib/debug/roleImpersonation.tsx`) può sostituire
  lo snapshot con quello di un ruolo, per provare la UI con permessi ridotti.
  `useRealCapabilities()` bypassa l'override per i guard che non devono cedere.

**`AuthenticatedLayout` fa muro finché le capability non sono pronte**: con
`state` `idle`/`loading` mostra uno spinner a tutto schermo, con `error` la
schermata "non autorizzato". Se `/community-profile` non risponde con un
`MeResponse` valido, **nessuna rotta protetta è raggiungibile**.

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

Il sistema di flag per-feature (`src/lib/mock/`, `isMockEnabled()`) **è stato
rimosso**: quella cartella non esiste e nessun service ha rami mock.

Al suo posto, un mock server dentro il dev server Vite (`mock/`, attivo solo con
`npm run dev:mock`) che intercetta `/mock-api`. `src/` non lo conosce.
Vedi `mock/README.md`.

## File-based routing (TanStack Router)

```
/                         redirect (auth → /dashboard, else → /login)
/login                    pagina login OIDC
/callback                 OIDC callback handler
/_authenticated           layout protetto (sidebar)
  /dashboard              riepilogo con contatori e grafici
  /questions              lista domande (18 parametri di filtro in validateSearch)
  /questions/create       form creazione domanda        [questions:CREATE]
  /questions/import       import CSV bulk               [questions:CREATE]
  /questions/to-review    domande assegnate a me come revisore
  /questions/$questionId  editor domanda                [questions:UPDATE]
  /collections            lista collection
  /collections/create     stepper creazione collection
  /subjects               materie e argomenti
  /campaigns              campagne di produzione
  /campaigns/$campaignId  dettaglio campagna
  /my-slots               slot di produzione assegnati a me
  /pools                  lista banche dati
  /pools/$poolId          dettaglio banca dati con domande paginate
  /packages               pacchetti e SKU
  /tests                  test
  /attributes             attributi per risorsa
  /clients                lista clienti (modello legacy /users)
  /staff                  lista staff
  /roles                  ruoli community
  /settings               impostazioni + role impersonation
```

Non esiste una rotta di sola lettura per la domanda: `$questionId` **è** la
pagina di modifica e richiede `questions:UPDATE`.

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
