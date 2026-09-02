import type { APIClient } from '@/lib/api/client';
import type {
  Alternative,
  CreateQuestionPayload,
  DifficultyLevel,
  HierarchyItem,
  Question,
  QuestionAssociations,
  QuestionListItem,
  QuestionStatus,
  QuestionType,
  QuestionsListResponse,
  QuestionsSearchQuery,
} from '@/lib/types/questions';
import type {
  BulkImportItem,
  BulkImportPayload,
  BulkJob,
  BulkJobStart,
} from '@/lib/types/questionsImport';

// ---------------------------------------------------------------------------
// Backend types (subset of what we read/send — see CDK module on backend repo)
// ---------------------------------------------------------------------------

interface BackendSubject {
  _id: string;
  name: string;
  topics?: BackendTopic[];
}

interface BackendTopic {
  _id: string;
  name: string;
  subtopics?: BackendSubtopic[];
}

interface BackendSubtopic {
  _id: string;
  name: string;
}

interface BackendAlternative {
  text: string;
  image?: string;
  correct: boolean;
}

interface BackendQuestion {
  _id: string;
  subjectId: string;
  subject?: { name: string };
  topicId: string;
  topic?: { name: string };
  subtopicId?: string;
  subtopic?: { name: string };
  type?: 'MULTIPLE_CHOICE' | 'COMPLETION';
  difficulty: number;
  language: 'IT-it' | 'EN-en';
  questionText: string;
  alternatives?: BackendAlternative[];
  completionAnswers?: string[];
  explanationText?: string;
  questionImages?: string[];
  explanationImages?: string[];
  status: 'DRAFT' | 'ACTIVE' | 'TO_REVIEW' | 'INACTIVE';
  versionCount?: number;
  authorId?: string;
  author?: { email: string };
  revisorId?: string;
  revisor?: { email: string };
  archived?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Mapping tables
// ---------------------------------------------------------------------------

const DIFFICULTY_TO_NUM: Record<DifficultyLevel, number> = {
  non_ancora_valutata: 0,
  facile: 1,
  medio_facile: 2,
  medio: 3,
  medio_difficile: 4,
  difficile: 5,
};

const DIFFICULTY_FROM_NUM: Record<number, DifficultyLevel> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

const mapDifficultyFromNumber = (n: number | undefined | null): DifficultyLevel => {
  if (n == null) return 'non_ancora_valutata';
  return DIFFICULTY_FROM_NUM[n] ?? 'non_ancora_valutata';
};

const deriveTypeFromBackend = (b: BackendQuestion): QuestionType => {
  if (b.type === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE';
  if (b.type === 'COMPLETION') return 'COMPLETION';
  // Fallback: infer from completionAnswers for documents without explicit type
  return (b.completionAnswers?.length ?? 0) > 0 ? 'COMPLETION' : 'MULTIPLE_CHOICE';
};

const mapStatusToBackend = (s: QuestionStatus): QuestionStatus => s;

const mapStatusFromBackend = (s: BackendQuestion['status']): QuestionStatus => s;

/** Builds the filter portion of a /questions/list(-ids) body — shared by
 *  listAdmin (paginated) and getAllFilteredIds (unbounded), page/limit excluded. */
const toBackendFilterBody = (
  query: Omit<QuestionsSearchQuery, 'page' | 'perPage'>
): Record<string, unknown> => {
  const body: Record<string, unknown> = {};
  if (query.statuses?.length) body.statuses = query.statuses.map(mapStatusToBackend);
  if (query.subjectIds?.length) body.subjectIds = query.subjectIds;
  if (query.topicIds?.length) body.topicIds = query.topicIds;
  if (query.languages?.length) body.languages = query.languages;
  if (query.difficulties?.length) {
    body.difficulties = query.difficulties.map((d) => DIFFICULTY_TO_NUM[d]);
  }
  if (query.types?.length) body.types = query.types;
  if (query.authors?.length) body.authors = query.authors;
  if (query.tags?.length) body.tags = query.tags;
  if (query.collectionIds?.length) {
    body.collectionIds = query.collectionIds;
    if (query.collectionIdsMode === 'exclude') body.collectionIdsMode = 'exclude';
  }
  if (query.poolIds?.length) {
    body.poolIds = query.poolIds;
    if (query.poolIdsMode === 'exclude') body.poolIdsMode = 'exclude';
  }
  if (query.dateFrom) body.dateFrom = query.dateFrom;
  if (query.dateTo) body.dateTo = query.dateTo;
  if (query.unpublished) body.unpublished = true;
  if (query.search?.trim()) body.search = query.search.trim();
  return body;
};

// Full includes for single-question fetch (edit/view form needs all fields).
const QUESTION_INCLUDES =
  'alternatives,explanationText,completionAnswers,questionImages,explanationImages,tags,author,revisor';

// ---------------------------------------------------------------------------
// Question adapters
// ---------------------------------------------------------------------------

const fromBackendQuestion = (b: BackendQuestion): Question => {
  const alternatives: Alternative[] = (b.alternatives ?? []).map((a, idx) => ({
    id: `${b._id}-alt-${idx}`,
    text: a.text,
    isCorrect: a.correct,
    order: idx,
    image: a.image,
  }));

  return {
    id: b._id,
    subjectId: b.subjectId,
    subjectName: b.subject?.name ?? '',
    topicId: b.topicId,
    topicName: b.topic?.name ?? '',
    sottoArgomentoId: b.subtopicId ?? '',
    type: deriveTypeFromBackend(b),
    difficulty: mapDifficultyFromNumber(b.difficulty),
    questionText: b.questionText,
    explanationText: b.explanationText ?? '',
    alternatives,
    completionAnswer: (b.completionAnswers ?? [])[0] ?? '',
    questionImages: b.questionImages ?? [],
    explanationImages: b.explanationImages ?? [],
    status: mapStatusFromBackend(b.status),
    reviewerId: b.revisorId ?? null,
    reviewerEmail: b.revisor?.email ?? null,
    language: b.language,
    authorEmail: b.author?.email,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
};

const fromBackendListItem = (b: BackendQuestion): QuestionListItem => ({
  ...fromBackendQuestion(b),
  materiaName: b.subject?.name ?? '',
  argomentoName: b.topic?.name ?? '',
  sottoArgomentoName: b.subtopic?.name ?? '',
});

// Body shape as required by the backend schema (additionalProperties: false).
interface ToBackendCreateBody {
  questionText: string;
  alternatives: BackendAlternative[];
  completionAnswers: string[];
  explanationText: string;
  questionImages: string[];
  explanationImages: string[];
  subject: { _id: string; name: string };
  topic: { _id: string; name: string };
  language: 'IT-it' | 'EN-en';
  difficulty: number;
  tags?: string[];
}

// PUT /questions/{id} uses updateQuestionModelSchema (same additionalProperties: false).
interface ToBackendUpdateBody {
  questionText?: string;
  alternatives?: BackendAlternative[];
  completionAnswers?: string[];
  explanationText?: string;
  questionImages?: string[];
  explanationImages?: string[];
  subject?: { _id?: string; name?: string };
  topic?: { _id?: string; name?: string };
  language?: 'IT-it' | 'EN-en';
  difficulty?: number;
  tags?: string[];
}

const toBackendCreate = (p: CreateQuestionPayload): ToBackendCreateBody => ({
  questionText: p.questionText,
  alternatives:
    p.type === 'COMPLETION'
      ? []
      : p.alternatives.map((a) => ({
          text: a.text,
          correct: a.isCorrect,
          ...(a.image ? { image: a.image } : {}),
        })),
  completionAnswers: p.type === 'COMPLETION' && p.completionAnswer ? [p.completionAnswer] : [],
  explanationText: p.explanationText ?? '',
  questionImages: p.questionImages ?? [],
  explanationImages: p.explanationImages ?? [],
  subject: { _id: p.subjectId, name: p.subjectName },
  topic: { _id: p.topicId, name: p.topicName },
  language: p.language ?? 'IT-it',
  difficulty: DIFFICULTY_TO_NUM[p.difficulty],
});

const toBackendUpdate = (p: Partial<CreateQuestionPayload>): ToBackendUpdateBody => {
  const body: ToBackendUpdateBody = {};
  if (p.questionText !== undefined) body.questionText = p.questionText;
  if (p.explanationText !== undefined) body.explanationText = p.explanationText;
  // For COMPLETION: clear alternatives and set completionAnswers.
  // For MULTIPLE_CHOICE: set alternatives and clear completionAnswers.
  if (p.type === 'COMPLETION') {
    body.alternatives = [];
    body.completionAnswers = p.completionAnswer ? [p.completionAnswer] : [];
  } else if (p.alternatives !== undefined) {
    body.alternatives = p.alternatives.map((a) => ({
      text: a.text,
      correct: a.isCorrect,
      ...(a.image ? { image: a.image } : {}),
    }));
    body.completionAnswers = [];
  }
  if (p.questionImages !== undefined) body.questionImages = p.questionImages;
  if (p.explanationImages !== undefined) body.explanationImages = p.explanationImages;
  if (p.subjectId !== undefined) body.subject = { _id: p.subjectId, name: p.subjectName ?? '' };
  if (p.topicId !== undefined) body.topic = { _id: p.topicId, name: p.topicName ?? '' };
  if (p.language !== undefined) body.language = p.language;
  if (p.difficulty !== undefined) body.difficulty = DIFFICULTY_TO_NUM[p.difficulty];
  return body;
};

// ---------------------------------------------------------------------------
// Subjects cache — single GET /subjects feeds all 3 hierarchy levels.
// ---------------------------------------------------------------------------

const SUBJECTS_TTL_MS = 5 * 60 * 1000;

let subjectsCache: { data: BackendSubject[]; fetchedAt: number } | null = null;
let subjectsInflight: Promise<BackendSubject[]> | null = null;

interface SubjectsListResponse {
  // Backend response shape can vary; handle both common forms.
  data?: BackendSubject[];
  subjects?: BackendSubject[];
}

async function fetchSubjects(client: APIClient): Promise<BackendSubject[]> {
  // Intentionally no `signal`: this fetch is shared across all hierarchy
  // consumers via `subjectsInflight`. Wiring a single consumer's AbortSignal
  // into a shared promise means one consumer aborting (e.g. React StrictMode's
  // mount→cleanup→mount cycle) kills the request for every other consumer too.
  // Per-consumer cancellation is handled at the hook layer via `fetchIdRef`.
  const raw = await client.get<SubjectsListResponse | BackendSubject[]>(
    '/subjects?includes=topics,subtopics'
  );
  if (Array.isArray(raw)) return raw;
  return raw.subjects ?? raw.data ?? [];
}

async function getSubjectsOnce(client: APIClient): Promise<BackendSubject[]> {
  const now = Date.now();
  if (subjectsCache && now - subjectsCache.fetchedAt < SUBJECTS_TTL_MS) {
    return subjectsCache.data;
  }
  if (subjectsInflight) return subjectsInflight;
  subjectsInflight = fetchSubjects(client)
    .then((data) => {
      subjectsCache = { data, fetchedAt: Date.now() };
      return data;
    })
    .finally(() => {
      subjectsInflight = null;
    });
  return subjectsInflight;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const questionsService = {
  async getMaterie(client: APIClient, _signal?: AbortSignal): Promise<HierarchyItem[]> {
    const subjects = await getSubjectsOnce(client);
    return subjects.map((s) => ({ id: s._id, name: s.name }));
  },

  async getArgomenti(
    client: APIClient,
    materiaId: string,
    _signal?: AbortSignal
  ): Promise<HierarchyItem[]> {
    const subjects = await getSubjectsOnce(client);
    const subject = subjects.find((s) => s._id === materiaId);
    return (subject?.topics ?? []).map((t) => ({ id: t._id, name: t.name }));
  },

  async getSottoArgomenti(
    client: APIClient,
    materiaId: string,
    argomentoId: string,
    _signal?: AbortSignal
  ): Promise<HierarchyItem[]> {
    const subjects = await getSubjectsOnce(client);
    const subject = subjects.find((s) => s._id === materiaId);
    const topic = subject?.topics?.find((t) => t._id === argomentoId);
    return (topic?.subtopics ?? []).map((st) => ({ id: st._id, name: st.name }));
  },

  async get(client: APIClient, questionId: string, signal?: AbortSignal): Promise<Question> {
    const raw = await client.get<BackendQuestion>(
      `/questions/${questionId}?includes=${QUESTION_INCLUDES}`,
      { signal }
    );
    return fromBackendQuestion(raw);
  },

  async create(client: APIClient, payload: CreateQuestionPayload): Promise<Question> {
    const raw = await client.post<BackendQuestion>('/questions', toBackendCreate(payload));
    return fromBackendQuestion(raw);
  },

  async update(
    client: APIClient,
    questionId: string,
    payload: Partial<CreateQuestionPayload>
  ): Promise<Question> {
    const raw = await client.put<BackendQuestion>(
      `/questions/${questionId}`,
      toBackendUpdate(payload)
    );
    return fromBackendQuestion(raw);
  },

  async submit(
    client: APIClient,
    questionId: string,
    reviewerId: string,
    signal?: AbortSignal
  ): Promise<void> {
    // Assign the reviewer, then transition status to TO_REVIEW.
    await client.put(`/questions/${questionId}`, { revisor: { id: reviewerId } }, { signal });
    await client.patch(`/questions/${questionId}/status`, { status: 'TO_REVIEW' }, { signal });
  },

  /** Approve a question: transitions status to ACTIVE (also cascades campaign slot → approved on backend). */
  async approve(client: APIClient, questionId: string, signal?: AbortSignal): Promise<void> {
    await client.patch(`/questions/${questionId}/status`, { status: 'ACTIVE' }, { signal });
  },

  /** Returns all questions assigned to the current user as reviewer with status TO_REVIEW. */
  async myReviews(client: APIClient, signal?: AbortSignal): Promise<QuestionListItem[]> {
    const [raw, subjects] = await Promise.all([
      client.get<BackendQuestion[]>('/questions/my-reviews', { signal }),
      getSubjectsOnce(client),
    ]);

    return (Array.isArray(raw) ? raw : []).map((b) => {
      const subjectDoc = subjects.find((s) => s._id === b.subjectId);
      const topicDoc = subjectDoc?.topics?.find((t) => t._id === b.topicId);
      const subtopicDoc = topicDoc?.subtopics?.find((st) => st._id === b.subtopicId);
      return {
        ...fromBackendQuestion(b),
        materiaName: subjectDoc?.name ?? '',
        argomentoName: topicDoc?.name ?? '',
        sottoArgomentoName: subtopicDoc?.name ?? '',
      };
    });
  },

  async list(
    client: APIClient,
    query: QuestionsSearchQuery,
    signal?: AbortSignal
  ): Promise<QuestionsListResponse> {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.perPage,
    };
    if (query.statuses?.length) params.statuses = query.statuses.map(mapStatusToBackend).join(',');
    if (query.subjectIds?.length) params.subjectIds = query.subjectIds.join(',');
    if (query.topicIds?.length) params.topicIds = query.topicIds.join(',');
    if (query.languages?.length) params.languages = query.languages.join(',');
    if (query.difficulties?.length) {
      params.difficulties = query.difficulties.map((d) => DIFFICULTY_TO_NUM[d]).join(',');
    }
    if (query.types?.length) params.types = query.types.join(',');
    if (query.authors?.length) params.authors = query.authors.join(',');
    if (query.tags?.length) params.tags = query.tags.join(',');
    if (query.dateFrom) params.dateFrom = query.dateFrom;
    if (query.dateTo) params.dateTo = query.dateTo;
    if (query.search?.trim()) params.search = query.search.trim();

    const res = await client.get<BackendListResponse>('/questions', { signal, params });
    return normalizeListResponse(res);
  },

  /** Admin questions list — uses POST /questions/list to send filters as JSON body,
   *  avoiding URL length limits when collectionIds/poolIds contain many entries. */
  async listAdmin(
    client: APIClient,
    query: QuestionsSearchQuery,
    signal?: AbortSignal
  ): Promise<QuestionsListResponse> {
    const body = toBackendFilterBody(query);
    body.page = query.page;
    body.limit = query.perPage;

    const res = await client.post<BackendListResponse>('/questions/list', body, { signal });
    return normalizeListResponse(res);
  },

  async getArgomentiForMany(
    client: APIClient,
    materiaIds: string[],
    _signal?: AbortSignal
  ): Promise<HierarchyItem[]> {
    const subjects = await getSubjectsOnce(client);
    const seen = new Set<string>();
    const result: HierarchyItem[] = [];
    for (const id of materiaIds) {
      const subject = subjects.find((s) => s._id === id);
      for (const t of subject?.topics ?? []) {
        if (!seen.has(t._id)) {
          seen.add(t._id);
          result.push({ id: t._id, name: t.name });
        }
      }
    }
    return result;
  },

  async getSottoArgomentiByArgomentoIds(
    client: APIClient,
    argomentoIds: string[],
    _signal?: AbortSignal
  ): Promise<HierarchyItem[]> {
    const subjects = await getSubjectsOnce(client);
    const seen = new Set<string>();
    const result: HierarchyItem[] = [];
    for (const id of argomentoIds) {
      for (const s of subjects) {
        const topic = s.topics?.find((t) => t._id === id);
        if (topic) {
          for (const st of topic.subtopics ?? []) {
            if (!seen.has(st._id)) {
              seen.add(st._id);
              result.push({ id: st._id, name: st.name });
            }
          }
          break;
        }
      }
    }
    return result;
  },

  async getAssociations(
    client: APIClient,
    questionId: string,
    signal?: AbortSignal
  ): Promise<QuestionAssociations> {
    return client.get<QuestionAssociations>(`/questions/${questionId}/associations`, { signal });
  },

  async delete(client: APIClient, questionId: string): Promise<void> {
    await client.delete(`/questions/${questionId}`);
  },

  // TODO(backend-questions): no bulk-delete endpoint exists.
  //   Two future options: (a) loop DELETE /questions/{id} client-side and
  //   aggregate failures, (b) ask backend to add POST /questions/bulk-delete.
  async bulkDelete(
    _client: APIClient,
    _ids: string[]
  ): Promise<{ deleted: number; failed: string[] }> {
    throw new Error('questions.bulkDelete: backend wiring not implemented');
  },

  // Backend caps this at 20000 ids as a safety valve (see listQuestionIds.ts).
  // `truncated` is true when the filtered set exceeds that cap, so the caller
  // can warn the user instead of silently selecting/exporting fewer than expected.
  async getAllFilteredIds(
    client: APIClient,
    query: Omit<QuestionsSearchQuery, 'page' | 'perPage'>
  ): Promise<{ ids: string[]; total: number; truncated: boolean }> {
    return client.post<{ ids: string[]; total: number; truncated: boolean }>(
      '/questions/list/ids',
      toBackendFilterBody(query)
    );
  },

  // Fetches full data (+ collection/pool associations) for the given question
  // ids via the batch POST /questions/export endpoint, preserving the input
  // order and enriching each with hierarchy names.
  //
  // The backend caps that endpoint at 2000 ids per call (full question bodies
  // have no length limit, unlike /questions/list/ids' bare id strings, so an
  // unbounded batch risks the Lambda response-size ceiling) — so ids are
  // chunked into batches run through a small concurrency pool. This replaces
  // what used to be one GET /questions/{id} + one GET /questions/{id}/associations
  // PER question (e.g. 20000 questions → 40000 requests) with a handful of
  // batched calls.
  //
  // Ids missing from a batch's response (not found, or the whole batch call
  // failed) are reported via `missingIds` rather than throwing, so a partially
  // -valid imported CSV — or one bad batch among several — still exports what
  // it can.
  async getExportData(
    client: APIClient,
    ids: string[],
    onProgress?: (success: number, failed: number, total: number) => void
  ): Promise<{
    items: QuestionListItem[];
    missingIds: string[];
    associationsById: Map<string, QuestionAssociations>;
  }> {
    const subjects = await getSubjectsOnce(client);

    const BATCH_SIZE = 2000; // matches exportQuestions.ts's per-request cap on the backend
    const CONCURRENCY = 4;
    const batches: string[][] = [];
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      batches.push(ids.slice(i, i + BATCH_SIZE));
    }

    const foundById = new Map<string, BackendQuestion & { associations: QuestionAssociations }>();
    const missingIds: string[] = [];

    let cursor = 0;
    const worker = async () => {
      for (;;) {
        const i = cursor++;
        if (i >= batches.length) return;
        const batch = batches[i];
        try {
          const res = await client.post<{
            questions: (BackendQuestion & { associations: QuestionAssociations })[];
          }>('/questions/export', { ids: batch });
          const returned = new Set<string>();
          for (const q of res.questions) {
            foundById.set(q._id, q);
            returned.add(q._id);
          }
          for (const id of batch) {
            if (!returned.has(id)) missingIds.push(id);
          }
        } catch {
          missingIds.push(...batch);
        }
        onProgress?.(foundById.size, missingIds.length, ids.length);
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, batches.length) }, () => worker())
    );

    // Build items in the original id order.
    const items: QuestionListItem[] = [];
    const associationsById = new Map<string, QuestionAssociations>();
    for (const id of ids) {
      const b = foundById.get(id);
      if (!b) continue;
      const q = fromBackendQuestion(b);
      const subjectDoc = subjects.find((s) => s._id === q.subjectId);
      const topicDoc = subjectDoc?.topics?.find((t) => t._id === q.topicId);
      const subtopicDoc = topicDoc?.subtopics?.find((st) => st._id === q.sottoArgomentoId);
      items.push({
        ...q,
        materiaName: subjectDoc?.name ?? q.subjectName ?? '',
        argomentoName: topicDoc?.name ?? q.topicName ?? '',
        sottoArgomentoName: subtopicDoc?.name ?? '',
      });
      associationsById.set(id, b.associations);
    }

    return { items, missingIds, associationsById };
  },

  // Starts an asynchronous, atomic (all-or-nothing) bulk import. Returns a
  // 202 with a jobId; poll `getBulkJob` until the status is terminal.
  // Each item carries a `revisor` (the UI guarantees every row has a reviewer).
  // Items with an `id` are updates, the rest are creations.
  async bulkImport(client: APIClient, payload: BulkImportPayload): Promise<BulkJobStart> {
    return client.post<BulkJobStart>('/questions/bulk', {
      items: payload.items.map(toBackendBulkItem),
    });
  },

  /** Polls the status of a bulk import job. */
  async getBulkJob(client: APIClient, jobId: string, signal?: AbortSignal): Promise<BulkJob> {
    return client.get<BulkJob>(`/questions/bulk/${jobId}`, { signal });
  },
};

// Maps a domain bulk-import item to the backend body. `type` is NOT sent — the
// backend derives it: non-empty `completionAnswers` → COMPLETION (alternatives
// forced to []), otherwise MULTIPLE_CHOICE. `difficulty` is the raw number.
const toBackendBulkItem = (item: BulkImportItem) => {
  const isCompletion = item.type === 'COMPLETION';
  return {
    ...(item.id ? { id: item.id } : {}),
    subject: { _id: item.subjectId },
    topic: { _id: item.topicId },
    ...(item.sottoArgomentoId ? { subtopicId: item.sottoArgomentoId } : {}),
    difficulty: DIFFICULTY_TO_NUM[item.difficulty],
    questionText: item.questionText,
    explanationText: item.explanationText,
    questionImages: item.questionImages,
    explanationImages: item.explanationImages,
    alternatives: isCompletion
      ? []
      : item.alternatives.map((a) => ({
          text: a.text,
          correct: a.isCorrect,
          ...(a.image ? { image: a.image } : {}),
        })),
    completionAnswers: isCompletion && item.completionAnswer ? [item.completionAnswer] : [],
    language: item.language,
    revisor: { id: item.reviewerId },
  };
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BackendListResponse {
  data: BackendQuestion[];
  total: number;
  page: number;
  limit: number;
}

function normalizeListResponse(r: BackendListResponse): QuestionsListResponse {
  return {
    total: r.total,
    questions: r.data.map(fromBackendListItem),
  };
}
