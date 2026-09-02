# Services & API Contracts

Source of truth per gli endpoint: CDK construct nella repo backend `Testbusters/elliotApiV2`, branch `StagingAdminStack`.
**Non usare** `docs/openapi.json` in questa repo — è stale (snapshot 2026-02-27, URL vecchio).

Base URL: `https://tw16nt2svf.execute-api.eu-south-1.amazonaws.com/prod`
Override: `VITE_API_BASE_URL` in `.env.local`

---

## questionsService (`src/lib/services/questionsService.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/questions` | params: page, limit, status[], subject, topic, subtopic |
| `get(id)` | GET | `/questions/{id}` | includes allegati |
| `create(payload)` | POST | `/questions` | mapping difficulty + type |
| `update(id, payload)` | PUT | `/questions/{id}` | partial update |
| `delete(id)` | DELETE | `/questions/{id}` | |
| `getMaterie()` | GET | `/subjects?includes=topics,subtopics` | cached 5min |
| `getArgomenti(materiaId)` | — | da cache subjects | |
| `getSottoArgomenti(materiaId, argomentoId)` | — | da cache subjects | |

**Mock flags** (tutti in `src/lib/mock/index.ts`):
- `questions.list` / `questions.get` / `questions.create` / `questions.update` / `questions.delete` → wired reale
- `questions.submit` / `questions.bulkDelete` / `questions.export` / `questions.hierarchy.sottoArgomenti` → **mock permanente** (backend non ha l'endpoint)

**Shape mapping:**
- `difficulty`: numero 0-5 (backend) ↔ enum stringa (frontend)
- `type`: derivato dalla presenza di `completionAnswers` (post-audit 2026-05)
- `status`: backend `active`/`inactive` → frontend `draft`
- `alternatives`: `{ text, correct }` array

---

## clientsService (`src/lib/services/clientsService.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/users` | params: page (0-indexed), search |
| `getOrders(clientId)` | GET | `/users/{clientId}/modules` | moduli acquistati |
| `delete(clientId)` | DELETE | `/users/{clientId}` | |
| `impersonate(token, email)` | POST | `https://sso.peerpetual.com/api/impersonate/start` | header `Authorization: Bearer {token}` |

**Impersonate response:** `{ message, data: { itk, ttlSec } }`
Il token `itk` va usato per aprire la sessione simulatore su `stg-simulazioni.testbusters.it`.

---

## staffService (`src/lib/services/staffService.ts`)

| Operazione | HTTP | Endpoint | Note |
|---|---|---|---|
| `list(query)` | GET | `/community-users` | params: per_page, page (0-indexed), search |
| `create(data)` | — | — | **DISABILITATO** — lancia `StaffActionUnsupportedError` |
| `updateRole(id, role)` | — | — | **DISABILITATO** — lancia `StaffActionUnsupportedError` |

`create` e `updateRole` sono bloccati dall'audit 2026-05: il backend ora richiede `cognitoId` + `roleIds` (ObjectId[]), il frontend ha solo role-name strings. Serve fetch dei CommunityRoles + mapping name→ObjectId.

**Attenzione:** search filtra ora solo su `cognitoId`, non su nome/email (cambiamento backend 2026-05).

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

## meService (`src/lib/services/meService.ts`)

| Operazione | HTTP | Endpoint |
|---|---|---|
| `profile()` | GET | `/community-profile` |

**Response:** `{ user: CommunityUser, capabilities: Capability[] }`

---

## Types principali

### Question
```typescript
type QuestionType = 'completamento' | 'risposta_chiusa';
type DifficultyLevel = 'facile' | 'medio_facile' | 'medio' | 'medio_difficile' | 'difficile' | 'non_ancora_valutata';
type QuestionStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'rejected';

interface Question {
  id: string;
  materiaId: string; argomentoId: string; sottoArgomentoId: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  alternatives: Alternative[];   // { id, text, isCorrect, order }
  completionAnswer: string;
  status: QuestionStatus;
  reviewerId: string | null;
  language: 'it' | 'en';
  createdAt: string; updatedAt: string;
}
```

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
  roleIds?: string[];   // ObjectId[] — canonical post-audit 2026-05
  lastLogin?: string; createdAt?: string; updatedAt?: string;
  // Deprecated (pre-audit): email, name, surname, roles: string[]
}
```

### Capability (permissions)
```typescript
type Resource = 'users' | 'questions' | 'subjects' | 'community-users' | 'community-roles' | 'brands' | string;
type Action = 'create' | 'read' | 'update' | 'delete';
interface Capability { resource: Resource; actions: Action[]; }
```
