# Known Issues & Limitations

## Backend audit 2026-05 — breaking changes

L'audit admin di maggio 2026 ha cambiato lo schema `CommunityUser` sul backend. I campi `email`, `name`, `surname`, `roles: string[]` sono stati rimossi, sostituiti da `cognitoId` + `roleIds: ObjectId[]`.

### Impatto sul frontend

| Feature | Stato | Blocco |
|---|---|---|
| Staff search per nome/email | **Rotto** | Backend filtra ora solo su `cognitoId` |
| `staffService.updateRole()` | **Disabilitato** | Backend richiede `roleIds` (ObjectId), FE ha solo role-name string |
| `staffService.create()` | **Disabilitato** | Stesso problema + mancanza `cognitoId` per candidati non-staff |
| Visualizzazione nome/email staff | **Rotto** | Campi rimossi da backend response |
| `ClientsPromoteDialog` | **Disabilitato** | Stessa dipendenza su cognitoId |

**Fix necessario:** Fetch lista `CommunityRoles` → mapping name→ObjectId. Il backend ha l'endpoint, non ancora wired nel frontend.

---

## Endpoint mancanti (mock permanenti)

Questi flag in `src/lib/mock/index.ts` rimangono `true` perché il backend non ha l'endpoint:

| Flag | Feature |
|---|---|
| `questions.submit` | Submit domanda per review (PATCH status → in_review) |
| `questions.bulkDelete` | Cancellazione bulk domande |
| `questions.getAllFilteredIds` | Recupero tutti gli ID con filtri attivi (per bulk ops) |
| `questions.export` | Export domande in formato esterno |
| `questions.hierarchy.sottoArgomenti` | Gerarchia sottoArgomenti (workaround: dati da cache subjects) |

---

## Altre limitazioni note

- **Staff list display**: senza nome/email, la tabella mostra solo `cognitoId` — UX molto degradata
- **Multi-brand**: `BrandProvider` esiste ma il backend non filtra ancora per brand
- **`ReviewerAssignDialog`**: fetcha reviewer list (`useReviewerList`), ma `questions.submit` è mock — l'assegnazione non arriva al backend
- **`docs/openapi.json`**: stale, non usare come reference — punta all'URL vecchio `b2wl5e6k10`
- **Rich editor autosave**: il debounce è configurato in `useQuestionForm`, ma il salvataggio intermediario non distingue bozza da submit intenzionale

---

## Deprecazioni nel codice

- `CommunityUser.roles: string[]` — campo mantenuto per compatibilità frontend, ignorato dal backend
- `CommunityUser.email/name/surname` — stessa situazione
- Interceptor 401 auto-logout in `src/lib/api/interceptors.ts` — commentato/disabilitato, gestione manuale
