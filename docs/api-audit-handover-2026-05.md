# API audit handover — 2026-05

> **Purpose:** bring the next maintainer up to speed on what changed in
> the admin backend (`elliotApiV2`) during the 2026-05 audit wave and
> what was done to keep this frontend running until the staff /
> promote-to-staff surfaces can be properly rebuilt.
>
> **Status (2026-05-16):** FE compiles and renders cleanly against the
> post-audit API. Several user-facing actions are intentionally gated;
> see "What was disabled" below. All gated sites carry an inline
> `FIXME(elliot-audit-2026-05):` comment that points back to this
> document, so the next dev hits a marker the moment they touch the
> code.

---

## Context

Between 2026-05-05 and 2026-05-16 the admin backend went through a
13-PR audit wave (`elliotApiV2`, `docs/plans/00-master-admin-audit.md`).
The wave reshaped four areas this FE consumes:

1. **REST verbs** on `community-users` and `community-roles` updates
   (`POST` → `PUT`).
2. **Response envelopes and status codes** — `getSubjects` wrapped in
   `{ data, total, page, limit }`; create handlers return `201`; delete
   handlers return `204` with empty body.
3. **`CommunityUser` schema slim** — `email`, `name`, `surname`,
   `roles` (role-NAME) dropped. Canonical fields are now
   `{ _id, cognitoId, roleIds: ObjectId[], lastLogin? }` plus
   timestamps.
4. **Questions write/read shape** — `type` and `isCompletion` removed
   from writes; backend derives question type from
   `completionAnswers.length`.

PRs 2, 3, 7, 10, 11, 12, 13 of the audit are **forward concerns**: they
reshaped domains this FE does not yet consume (pools, databanks, tests,
collections write-side, pool slots, search-collections). They are not a
problem today but will need attention when those modules are wired.

The FE call surface today is narrow:

| Service file | Endpoints used |
|---|---|
| `src/lib/services/staff.ts` | `GET /community-users`, `POST /community-users` (gated), `PUT /community-users/{id}` (gated) |
| `src/lib/services/clients.ts` | `GET /users`, `GET /users/{id}/package`, SSO impersonate |
| `src/lib/services/questions.ts` | `GET/POST/PUT/DELETE /questions/{...}`, `GET /subjects?includes=topics,subtopics` |

---

## What changed in the audit (FE-relevant subset)

| PR | Title | FE impact |
|---|---|---|
| **PR-01** | REST verbs + auth cleanup | `PUT /community-users/{id}` and `PUT /community-roles/{id}` (was `POST`). Wire updated in `staff.ts`. |
| **PR-04** | Response/status conventions | `getSubjects` envelope; `201` on create; **`204` on delete** — handled at `client.ts`. |
| **PR-05** | `CommunityUser` schema slim | Fields gone: `email`, `name`, `surname`, legacy `roles` (role-name). New fields: `roleIds: ObjectId[]`, `lastLogin?`. Search hits `cognitoId` only; role filter is `roleId` (ObjectId), not name. |
| **PR-06** | Questions `type`/`isCompletion` removal | Both fields dropped from writes. Reads must derive question type from `completionAnswers.length > 0`. |

Other PRs (2, 3, 7, 10, 11, 12, 13, 14) reshaped domains the FE does
not consume today. See `elliotApiV2/docs/plans/00-master-admin-audit.md`
for the full picture if you start wiring pools/collections/tests/etc.

---

## Punch list

### Critical — gated in code; needs product/backend decision

| ID | File | What's wrong | Action taken |
|---|---|---|---|
| **B1** | `src/lib/services/staff.ts` `create()` | `POST /community-users` no longer accepts `name/surname/email/roles`. New shape is `{ cognitoId, roleIds: ObjectId[] }`. FE has neither a Cognito sub for a non-staff Client nor CommunityRole ObjectIds. | Service throws `StaffActionUnsupportedError`. Promote action disabled in `ClientsRowActions.tsx` with tooltip. |
| **B2** | `src/lib/services/staff.ts` `updateRole()` | `PUT /community-users/{id}` expects `{ roleIds: ObjectId[] }`. FE only has role-NAME strings. No CommunityRoles fetch yet to map name → ObjectId. | Service throws `StaffActionUnsupportedError`. Change-role action disabled in `StaffRowActions.tsx` with tooltip. `StaffChangeRoleDialog` now renders a "non disponibile" stub. |
| **B3** | `src/components/staff/StaffTable.tsx` | Columns `Nome / Cognome / Email / Ruolo` had no backing fields post-audit. | Replaced with `Cognito ID / Ruoli (count) / Ultimo login / Azioni`. Banner above the table explains the situation. |
| **B4** | `src/components/questions/QuestionsListPage.tsx` | The Questions API spec defines `status ∈ {draft, in_review, approved, rejected}` and `GET /questions` matches on it exactly. ~10k legacy production docs still carry the pre-rewrite shape `status: "ACTIVE"` + `approved: true` boolean and so are excluded from every tab. Only freshly seeded records (the 2024-01-01 fixtures) appear. FE is spec-compliant; the gap is in the data layer. | Inline amber handover banner above the tabs; FIXME marker. No FE filter change — see Q6 below. |

### Fixed (mechanical)

| ID | File:line | What was done |
|---|---|---|
| **F1** | `src/lib/services/staff.ts` | `POST` → `PUT` on update path (per PR-01); `role` query param no longer sent (legacy name-based filter ignored by backend). |
| **F2** | `src/lib/services/questions.ts` | Dropped `isCompletion` from `INCLUDES`, `ToBackendCreateBody`, `toBackendCreate`, `toBackendUpdate`. Replaced `mapTypeFromBackend(b.type)` with `deriveTypeFromBackend(b)` that prefers `b.type` for legacy docs and falls back to `completionAnswers.length > 0`. |
| **F3** | `src/lib/api/client.ts` | `request()` now early-returns `undefined as T` on `204` / `304` instead of calling `response.json()` on an empty body. Inoculates any future DELETE call against the PR-04 status change. |

### Stale but harmless (cleaned up while in the neighbourhood)

| ID | File | Note |
|---|---|---|
| **S1** | `src/lib/services/questions.ts` `BackendQuestion.type` | Now optional. Legacy documents may still carry it. |
| **S2** | `src/lib/services/questions.ts` subjects defensive fallback | `Array.isArray(raw)` branch is dead post PR-04 (envelope-only) but kept for backward read tolerance. Not worth removing. |
| **S3** | `src/lib/types/staff.ts` `CommunityUser` | Legacy fields `email/name/surname/roles` kept as optional so any unaudited read site does not crash. Delete entirely once you've audited every consumer. |

### Not fixed — flagged only (out of audit scope)

| ID | File:line | Note |
|---|---|---|
| **N1** | `src/lib/services/questions.ts` `toBackendCreate` shape vs `elliotApiV2/lambda_src/questions/newQuestion.ts:18` | **Pre-existing FE↔BE drift, NOT caused by the audit.** The FE sends `{ questionText, alternatives, explanationText, questionImages, explanationImages, subject: {_id}, topic: {_id}, language, difficulty, completionAnswers? }`. The backend handler destructures `{ text, alternatives, explaination, textImages, explainationImages, subjectId, topicId, difficulty, tags, language }` — different top-level field names. POST /questions has been broken end-to-end since at least the rewrite that introduced this handler. Out of audit scope; the next dev should align both ends in a single dedicated PR. |
| **N2** | `src/lib/services/staff.ts` search semantics | Backend now searches `cognitoId` only (PR-05). Placeholder updated to "Cerca per Cognito ID". If product wants name/email search back, that requires a backend join against Cognito or a denorm. |
| **N3** | `src/lib/services/staff.ts` role filter | Backend expects `roleId: ObjectId`, not role-NAME. Filter removed from UI for now. Re-add as a select that maps the user's chosen role to its CommunityRole ObjectId, once that list is wired. |

---

## Open questions for product / backend

These need answers before the gated flows can be un-gated.

1. **Identity attributes.** Where does the human-readable name/email of a
   CommunityUser come from now that `CommunityUser` doesn't store them?
   - Option A — Cognito join on read (admin endpoint returns
     `cognitoId` and the FE separately resolves to email via a Cognito
     admin API).
   - Option B — `Users` collection join (if `CommunityUser.cognitoId`
     maps 1:1 to a `Users` document that has `email/name/surname`).
   - Option C — restore some denorm on CommunityUser.
   Pick one and the staff table can show real names again.

2. **CommunityRoles list.** Is there a `GET /community-roles` endpoint
   the FE can call to populate role lookups? The change-role dialog
   and the role filter both need this.

3. **Promote-to-staff flow.** Given the new create shape
   `{ cognitoId, roleIds }`, can a *Client* (which lives in `/users`,
   not in Cognito's backoffice pool) even be promoted? Or does promotion
   now require an out-of-band Cognito provisioning step before a
   CommunityUser can be created?

4. **Capability mapping vs role names.** The legacy FE used role names
   (`admin`/`supervisor`/`produttore`/...) to drive peer-grant rules and
   role badges. The new schema is ObjectId-based and (per
   `lambda_src/_utils/authUser.ts:getCallerRankContext`) uses a
   rank/capability matrix on `CommunityRole` documents. Reimplement the
   FE's peer-grant logic on top of that matrix, not on hard-coded names.

5. **Token claims.** Does the admin Cognito User Pool still emit
   `custom:role` (used by `StaffPage` to gate the supervisor UI)? If
   so, what values does it carry post-audit? `StaffPage.tsx` still reads
   it; if values changed, the gating breaks silently.

6. **Legacy questions data migration.** Production has ~10k question
   documents with `status ∈ {ACTIVE, INACTIVE, ...}` and a separate
   `approved: boolean`. The Questions API spec mandates
   `status ∈ {draft, in_review, approved, rejected}` (see the spec
   under `PATCH /:id/status` and the `status` query param on `GET /`).
   `GET /questions?status=approved` therefore returns ~0 real records.
   Two options:
   - **A — one-shot migration** mapping legacy combos to the new enum:
     `(ACTIVE, approved=true) → approved`,
     `(ACTIVE, approved=false) → in_review` (or `draft`, depending on
     intended lifecycle), `INACTIVE → rejected` or `archived=true`.
   - **B — tolerant list handler** that treats `?status=approved` as
     matching `status="approved" OR (status="ACTIVE" AND approved=true)`,
     and analogous translations for the other enum values. Doesn't fix
     `PATCH /:id/status` semantics for legacy docs but unblocks the UI.
   Until one of these lands, the questions list page is effectively
   blank for staging/prod data and no FE-side workaround is viable
   (the spec doesn't expose `approved` as a query param).

---

## Recommended next-step ordering

1. **Wire a CommunityRoles fetch.** Lightest blocker — unlocks B2, B3,
   and N3. Suggest a small `src/lib/services/communityRoles.ts` +
   `useCommunityRoles` hook with `GET /community-roles`. Cache like
   `subjectsCache` in `questions.ts`.

2. **Decide on identity surface (Q1 above).** Without this, the staff
   table will keep showing `cognitoId` truncated. The least-effort path
   is probably Option B (`Users` join) since `/users` already returns
   `email/name/surname` and is wired in `clientsService`.

3. **Un-gate change-role.** Once #1 lands, replace
   `StaffChangeRoleDialog`'s stub with a real selector that maps the
   chosen CommunityRole label → ObjectId and sends `{ roleIds: [id] }`
   via the (now-PUT) endpoint. Re-enable the row action.

4. **Decide on promote-to-staff (Q3).** This is the longest chain — it
   depends on whether the product still wants client → staff promotion
   as a one-click flow. If yes, the backend probably needs a new
   higher-level endpoint that handles Cognito provisioning + CommunityUser
   creation atomically. If no, delete the promote UI entirely.

5. **Fix N1.** The questions POST shape mismatch is pre-existing and
   loud — POST /questions has been broken since whenever. Worth a
   dedicated tiny PR to align the FE wire shape with the backend
   destructure (or to fix the backend to accept the FE's shape — both
   sides are ours).

6. **Migrate legacy questions data (Q6).** Until this is decided and
   shipped, the questions list page only renders seed fixtures. This is
   purely a backend / data concern — the FE is spec-compliant. Banner
   in `QuestionsListPage` stays until the migration (or tolerant
   handler) lands.

7. **Polish.** Remove the audit banner from `StaffTable`, remove the
   legacy optional fields from `CommunityUser` (`email`, `name`,
   `surname`, `roles`), drop the `FIXME(elliot-audit-2026-05)` markers.
   `grep -rn "FIXME(elliot-audit-2026-05)" src/` is the to-do list.

---

## Where to look

- Inline markers across the FE: `grep -rn "FIXME(elliot-audit-2026-05)" src/`
- Backend audit master plan:
  `elliotApiV2/docs/plans/00-master-admin-audit.md` (especially the
  "Decisions taken" matrix at lines 100–111 and the per-PR table at
  lines 510–521).
- Per-PR docs in the backend repo: `elliotApiV2/docs/plans/pr-*.md`.
- This FE's existing mock-migration doc: `docs/MOCK_MIGRATION.md`
  (separate concern but adjacent).
