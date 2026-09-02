# Known Issues & Limitations

> **Revisionato 2026-09-02.** Diverse voci di questo file erano superate o
> sbagliate: sono state corrette leggendo il codice. Le sezioni marcate
> "SUPERATA" restano solo come storico.

## Backend audit 2026-05 — breaking changes

L'audit admin di maggio 2026 ha cambiato lo schema `CommunityUser` sul backend. I campi `email`, `name`, `surname`, `roles: string[]` sono stati rimossi, sostituiti da `cognitoId` + `roleIds: ObjectId[]`.

### Impatto sul frontend

**Questa sezione è in gran parte SUPERATA** — il fix è stato fatto. Tenuta solo
come storico.

| Feature | Stato oggi |
|---|---|
| Staff search per nome/email | **Funziona** — il backend arricchisce la risposta da Cognito |
| `staffService.updateRole()` | **Funziona** — `PUT /community-users/{id}` con `{ roleIds }` |
| `staffService.create()` | **Funziona** — `POST /community-users` con `{ cognitoId, roleIds }` |
| Visualizzazione nome/email staff | **Funziona** — `CommunityUser` espone di nuovo name/surname/email |

`communityRolesService` (`src/lib/services/communityRoles.ts`) e l'hook
`useCommunityRoles` sono wired: il mapping name→ObjectId non è più un problema.

---

## Endpoint mancanti

Il sistema di flag mock (`src/lib/mock/index.ts`) **non esiste più**. Quattro
delle cinque operazioni elencate qui in passato sono ora wired sul backend:

| Operazione | Stato oggi |
|---|---|
| `questions.submit` | **Wired** — `PUT /questions/{id}` + `PATCH /questions/{id}/status` |
| `questions.getAllFilteredIds` | **Wired** — `POST /questions/list/ids` |
| `questions.export` | **Wired** — `POST /questions/export` |
| `questions.hierarchy.sottoArgomenti` | **Wired** — servita dalla cache subjects |
| `questions.bulkDelete` | **Non implementata** — `questionsService.bulkDelete` lancia un errore, l'endpoint non esiste sul backend. Il bottone di bulk delete è rotto anche in produzione. |

---

## Altre limitazioni note

- **Multi-brand**: `BrandProvider` esiste in `src/lib/brand/` ma **non è montato**
  in `main.tsx`, e `BrandPicker` non è renderizzato da nessuna parte. Il backend
  non filtra ancora per brand.
- **`useReviewerList` restituisce tutti gli utenti, non i revisori**: manda
  `role: 'revisore'` ma il backend filtra per `roleId` (ObjectId) e ignora il
  campo. C'è un `FIXME` nel file. `ReviewerAssignDialog` mostra quindi la lista
  sbagliata — ma l'assegnazione in sé arriva al backend, quella funziona.
- **Sotto-argomento vuoto in modifica**: `QuestionEditContent` non passa
  `sottoArgomentoId` a `useHierarchy`, quindi il selettore parte sempre vuoto
  anche quando la domanda ne ha uno salvato.
- **Tabella difficoltà duplicata**: `DIFFICULTY_TO_NUM`/`FROM_NUM` sono copiate
  verbatim in `services/questions.ts` e `services/pools.ts` invece di essere
  importate — divergeranno appena qualcuno tocca i livelli.
- **`docs/openapi.json`**: stale, non usare come reference — punta all'URL vecchio `b2wl5e6k10`
- **Rich editor autosave**: il debounce è configurato in `useQuestionForm`, ma il salvataggio intermediario non distingue bozza da submit intenzionale
- **`npm run lint` fallisce** con ~2000 errori `prettier/prettier` preesistenti
  in `src/`. Non correggerli in blocco: un `--fix` di massa distruggerebbe la
  leggibilità del diff delle modifiche di design.

---

## Deprecazioni nel codice

- `CommunityUser.roles: string[]` — rimosso; il canonico è `roleIds: string[]`
- **Interceptor 401**: la vecchia nota diceva "commentato/disabilitato". È
  **falso e pericoloso**: `createAuthResponseInterceptor` è attivo e su 401 fa
  `signinSilent()`, con fallback `login()` → redirect duro all'SSO.
- `poolsService.list()` è marcato `@deprecated` in favore di `listAll()`, ma è
  ancora usato da `PackagesCreateDialog`/`EditDialog`.
