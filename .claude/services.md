# Services & API Contracts

Source of truth per gli endpoint: CDK construct nella repo backend `Testbusters/elliotApiV2`, branch `StagingAdminStack`.
**Non usare** `docs/openapi.json` in questa repo — è stale (snapshot 2026-02-27, URL vecchio).

Base URL: solo `VITE_API_BASE_URL`, nessun fallback nel codice.
Valore di staging in `.env.example`; in mock mode `.env.mock` lo punta su
`http://localhost:4300/mock-api`.

> **I nomi dei file sono cambiati.** I service si chiamano `questions.ts`,
> `clients.ts`, `staff.ts`, `pools.ts`, `me.ts`, … — non `questionsService.ts`.
> L'unico col vecchio suffisso è `campaignsService.ts`. Ci sono 17 file in
> `src/lib/services/`, non i 5 elencati qui sotto: mancano `collections.ts`,
> `tests.ts`, `packages.ts`, `skus.ts`, `tags.ts`, `attributes.ts`,
> `communityRoles.ts`, `export.ts`, `questionImages.ts`, `campaignsService.ts`.

---

## questionsService (`src/lib/services/questions.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/questions` | filtri come parametri CSV |
| `listAdmin(query)` | POST | `/questions/list` | **usata dalla lista admin**: filtri nel body JSON, evita i limiti di lunghezza URL |
| `getAllFilteredIds(q)` | POST | `/questions/list/ids` | tutti gli id che matchano, cap 20000 |
| `getExportData(ids)` | POST | `/questions/export` | batch da 2000, concorrenza 4 |
| `myReviews()` | GET | `/questions/my-reviews` | domande TO_REVIEW assegnate a me |
| `submit(id, revisorId)` | PUT + PATCH | `/questions/{id}` poi `/questions/{id}/status` | assegna revisore, poi passa a TO_REVIEW |
| `approve(id)` | PATCH | `/questions/{id}/status` | passa ad ACTIVE |
| `getAssociations(id)` | GET | `/questions/{id}/associations` | collection e pool che la contengono |
| `bulkImport(payload)` | POST | `/questions/bulk` | 202 + jobId, poi polling |
| `getBulkJob(jobId)` | GET | `/questions/bulk/{jobId}` | stato del job |
| `get(id)` | GET | `/questions/{id}` | includes allegati |
| `create(payload)` | POST | `/questions` | mapping difficulty + type |
| `update(id, payload)` | PUT | `/questions/{id}` | partial update |
| `delete(id)` | DELETE | `/questions/{id}` | |
| `getMaterie()` | GET | `/subjects?includes=topics,subtopics` | cached 5min |
| `getArgomenti(materiaId)` | — | da cache subjects | |
| `getSottoArgomenti(materiaId, argomentoId)` | — | da cache subjects | |

**Mock flags**: non esistono più. Tutte le operazioni chiamano il backend vero.
L'unica non implementata è `bulkDelete`, che **lancia un errore**: non c'è
endpoint di bulk delete nemmeno lato backend.

**Shape mapping:**
- `difficulty`: numero **0-5** (backend) ↔ enum stringa (frontend), dove
  `0 = non_ancora_valutata`, 1 facile … 5 difficile. Tabella in `questions.ts`,
  **duplicata verbatim** in `pools.ts` invece di essere importata.
- `type`: `MULTIPLE_CHOICE` | `COMPLETION`, con fallback derivato dalla presenza
  di `completionAnswers`
- `status`: passa invariato, `DRAFT` | `ACTIVE` | `TO_REVIEW` | `INACTIVE`
- `alternatives`: `{ text, correct, image? }` array

---

## clientsService (`src/lib/services/clients.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/users` | params: page (0-indexed), search |
| `getOrders(clientId)` | GET | `/users/{clientId}/modules` | moduli acquistati |
| `delete(clientId)` | DELETE | `/users/{clientId}` | |
| `impersonate(token, email)` | POST | `https://sso.peerpetual.com/api/impersonate/start` | header `Authorization: Bearer {token}` |

**Impersonate response:** `{ message, data: { itk, ttlSec } }`
Il token `itk` va usato per aprire la sessione simulatore su `stg-simulazioni.testbusters.it`.

---

## staffService (`src/lib/services/staff.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/community-users` | params: per_page, page (0-indexed), search |
| `create(data)` | POST | `/community-users` | body `{ cognitoId, roleIds }` |
| `updateRole(id, roleIds)` | PUT | `/community-users/{id}` | body `{ roleIds }` (ObjectId[]) |
| `delete(id)` | DELETE | `/community-users/{id}` | |

Entrambe **sono implementate** — la vecchia nota su `StaffActionUnsupportedError`
è superata, quell'errore non esiste più. Il backend arricchisce ora la risposta
con `name`/`surname`/`email` da Cognito, quindi la tabella staff non mostra più
solo il `cognitoId`.

`list` converte `page` da 1-based a 0-based prima di inviarlo.

---

## poolsService (`src/lib/services/pools.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/pools` | params: page, limit |
| `listQuestions(poolId, query)` | GET | `/pools/{poolId}/questions` | params: page, limit, subjectId, topicId, subtopicId, difficulty, type, language (tutti single-value) |

**Response Pool:** `{ _id, name, status ('active'|'inactive'|'draft'), totalQuestions, ... }`
**Response PoolQuestion:** `{ _id, questionId, subjectId, subject.name, topicId, topic.name, subtopicId, subtopic.name, difficulty (number 0-5), type ('completion'|'alternative'), language }`

**Mock flags:** nessuno — entrambe le operazioni chiamano il backend reale.

**Shape mapping PoolQuestion:**
- `difficulty`: 0-5 (backend) → DifficultyLevel enum (frontend), stessa tabella di questions
- `type`: 'completion' → 'completamento', 'alternative' → 'risposta_chiusa'

---

## meService (`src/lib/services/me.ts`)

| Operazione | HTTP | Endpoint |
|---|---|---|
| `profile()` | GET | `/community-profile` |

**Response:** `{ user: CommunityUser, capabilities: Capability[] }`

---

## Types principali

### Question (`src/lib/types/questions.ts`)
```typescript
type QuestionType = 'MULTIPLE_CHOICE' | 'COMPLETION';
type DifficultyLevel = 'facile' | 'medio_facile' | 'medio' | 'medio_difficile' | 'difficile' | 'non_ancora_valutata';
type QuestionStatus = 'DRAFT' | 'ACTIVE' | 'TO_REVIEW' | 'INACTIVE';
type QuestionLanguage = 'IT-it' | 'EN-en';

interface Question {
  id: string;
  subjectId: string; subjectName: string;
  topicId: string; topicName: string;
  sottoArgomentoId: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  explanationText: string;
  alternatives: Alternative[];   // { id, text, isCorrect, order, image?, imageViewUrl? }
  completionAnswer: string;
  questionImages: string[]; explanationImages: string[];
  status: QuestionStatus;
  reviewerId: string | null; reviewerEmail: string | null;
  language: QuestionLanguage;
  authorEmail?: string;
  createdAt: string; updatedAt: string;
}
```

**Non c'è nessun campo di punteggio sulla domanda.** I punti vivono sui
contenitori: `PoolScores { correct, wrong, empty }` (`types/pools.ts`),
`CollectionDetails.scoreCorrect/Wrong/Empty` (`types/collections.ts`),
`Test.defaultScores` (`types/tests.ts`). L'unico campo di valutazione sulla
domanda è `difficulty`.

### Client
```typescript
interface Client {
  id: string; cognitoId: string;
  name: string; surname: string; email: string;
}
```

### CommunityUser (staff)
```typescript
interface CommunityUser {
  _id: string; cognitoId: string;
  roleIds?: string[];   // ObjectId[]
  lastLogin?: string; createdAt?: string; updatedAt?: string;
  // Arricchiti dal backend leggendo Cognito (lambda searchCommunityUsers)
  name?: string; surname?: string; email?: string;
}
```

### Capability (permissions)
```typescript
type Resource =
  | 'users' | 'questions' | 'subjects' | 'community-users' | 'community-roles'
  | 'brands' | 'pools' | 'packages' | 'campaigns' | 'skus' | 'collections'
  | 'attributes' | (string & {});
// MAIUSCOLE — è l'errore più facile da fare qui
type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
interface Capability { resource: Resource; actions: Action[]; }
```
