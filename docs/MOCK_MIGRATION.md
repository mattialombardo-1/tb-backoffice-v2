> # ⚠️ DOCUMENTO OBSOLETO — NON USARE
>
> Descrive un sistema di mock (`src/lib/mock/`, `mockConfig`, `isMockEnabled()`)
> che **è stato rimosso dal codice**. Quella cartella non esiste più e nessun
> service ha rami mock: chiamano tutti il backend vero.
>
> Contiene anche contratti sbagliati, che hanno confuso più di una sessione:
> dice `/users/:userId/package` (il codice usa `/users/{id}/modules`),
> `staff.updateRole` come `POST` con `{ roles: [role] }` (il codice fa `PUT` con
> `{ roleIds }`), ed elenca un `clients.updateStatus` che non esiste.
>
> **Per far girare l'app in locale con dati finti: `mock/README.md`.**
> Tenuto solo come storico.

# Mock-to-Real Migration Guide

## How it works

- All mock toggles live in `src/lib/mock/index.ts` (`mockConfig` record)
- Search for `// MOCK: <endpoint>` comments to find all related code
- Each endpoint section below lists what to change when switching to real API

## Endpoints

### `staff.list` — GET /community-users

- **Toggle**: `src/lib/mock/index.ts` → set `'staff.list': false`
- **Service**: `src/lib/services/staff.ts` → remove mock branch + import
- **Types**: `src/lib/types/staff.ts` → verify `status` field exists in real API response
- **Mock data**: `src/lib/mock/staff-data.ts` → can delete when no longer needed
- **Query params**: Verify real API supports `role` and `status` filter params

### `staff.updateRole` — POST /community-users/{id}

- **Toggle**: `src/lib/mock/index.ts` → set `'staff.updateRole': false`
- **Service**: `src/lib/services/staff.ts` → remove mock branch in `updateRole`
- **Payload**: `{ roles: [role] }`
- **Real endpoint**: `POST /community-users/{communityUserId}`

### `staff.updateStatus` — POST /community-users/{id}

- **Toggle**: `src/lib/mock/index.ts` → set `'staff.updateStatus': false`
- **Service**: `src/lib/services/staff.ts` → remove mock branch in `updateStatus`
- **Payload**: `{ status: 'active' | 'inactive' }`
- **Real endpoint**: `POST /community-users/{communityUserId}`

### `staff.create` — POST /community-users

- **Toggle**: `src/lib/mock/index.ts` → set `'staff.create': false`
- **Service**: `src/lib/services/staff.ts` → remove mock branch in `create`
- **Payload**: `{ name, surname, email, roles: [role] }`
- **Real endpoint**: `POST /community-users`

### `clients.list` — GET /users

- **Toggle**: `src/lib/mock/index.ts` → set `'clients.list': false`
- **Service**: `src/lib/services/clients.ts` → remove mock branch + import
- **Types**: `src/lib/types/clients.ts` → verify `status` and `registrationDate` fields exist in real API response
- **Mock data**: `src/lib/mock/clients-data.ts` → can delete when no longer needed
- **Query params**: Verify real API supports `status` filter param and `search` across name/surname/email
- **Real endpoint**: `GET /users` (Admin)

### `clients.updateStatus` — PUT /users/:userId

- **Toggle**: `src/lib/mock/index.ts` → set `'clients.updateStatus': false`
- **Service**: `src/lib/services/clients.ts` → remove mock branch in `updateStatus`
- **Payload**: `{ status: 'active' | 'inactive' }`
- **Real endpoint**: `PUT /users/:userId` (Admin)

### `clients.orders` — GET /users/:userId/package

- **Toggle**: `src/lib/mock/index.ts` → set `'clients.orders': false`
- **Service**: `src/lib/services/clients.ts` → remove mock branch in `getOrders`
- **Types**: `src/lib/types/clients.ts` → verify `ClientOrder` fields match real API response
- **Mock data**: `src/lib/mock/clients-data.ts` → remove `MOCK_ORDERS` + `getMockClientOrders` when no longer needed
- **Real endpoint**: `GET /users/:userId/package` (Admin) — returns packages/orders that unlocked Simulator resources

### `clients.impersonate` — POST sso.peerpetual.com/api/impersonate/start

- **Toggle**: `src/lib/mock/index.ts` → set `'clients.impersonate': false`
- **Service**: `src/lib/services/clients.ts` → remove mock branch in `impersonate`
- **Types**: `src/lib/types/clients.ts` → verify `ImpersonateClientResponse` matches real SSO response
- **Body**: `{ userId: clientEmail }`
- **Response**: `{ data: { itk: string, ttl: number } }`
- **Real endpoint**: `POST https://sso.peerpetual.com/api/impersonate/start` (SSO domain, not API gateway) — returns an impersonation token
- **Note**: Redirect hostname (`SIMULATOR_HOSTNAME`) is hardcoded to `simulatore.testbusters.it`. Needs multi-brand config migration from Angular codebase.
