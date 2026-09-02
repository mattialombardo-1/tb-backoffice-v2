import type { APIClient } from '@/lib/api/client';
export type { Collection } from '@/lib/types/collections';
import type {
  Collection,
  CollectionDetails,
  CollectionSection,
  CollectionType,
  Tag,
} from '@/lib/types/collections';

interface BackendTest {
  // The collection's `tests` subdocument exposes `id` (the schema sets `_id: false`).
  id: string;
  name: string;
}

interface BackendSectionQuestion {
  questionId?: string;
  _id?: string;
  id?: string;
  points?: { correctPoint?: number; wrongPoint?: number; emptyPoint?: number };
}

interface BackendSection {
  _id?: string;
  name?: string;
  maxAttempts?: number;
  rules?: { duration?: number; pausable?: boolean; extraTime?: number[] };
  questions?: Array<string | BackendSectionQuestion>;
}

interface BackendTag {
  _id?: string;
  id?: string;
  value: string;
}

interface BackendCollection {
  _id: string;
  name: string;
  type?: string;
  status?: string;
  tests?: BackendTest[];
  sections?: BackendSection[];
  questionsCount?: number;
  updatedAt?: string;
  // Validity window — not in the (stale) OpenAPI schema, read defensively.
  validFrom?: string;
  validTo?: string;
  // Schema was previously [Mixed] (array); legacy docs may still have array shape.
  attributes?: Record<string, unknown> | Record<string, unknown>[];
  tags?: BackendTag[];
  enableCorrection?: boolean;
}

interface BackendListResponse {
  data: BackendCollection[];
  total: number;
  page: number;
  limit: number;
}

function adaptCollection(c: BackendCollection): Collection {
  return {
    id: c._id,
    name: c.name,
    type: c.type ?? '',
    status: c.status ?? '',
    tests: (c.tests ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      brandIds: [],
    })),
    questionCount:
      c.sections?.reduce((acc, section) => acc + (section.questions?.length ?? 0), 0) ??
      c.questionsCount ??
      0,
    updatedAt: c.updatedAt ?? '',
    tags: (c.tags ?? []).map((t) => ({ id: t._id ?? t.id ?? '', value: t.value })),
  };
}

export interface CreateCollectionPayload {
  name: string;
  type: string;
  testIds: string[];
  status?: string;
  attributes?: Record<string, unknown>;
}

export interface UpdateCollectionPayload {
  name: string;
  type: string;
  testIds: string[];
}

/** Full form-shaped representation of a collection, used to pre-populate the edit stepper. */
export interface CollectionFormData {
  type: CollectionType | null;
  testIds: string[];
  name: string;
  sections: CollectionSection[];
  details: Partial<CollectionDetails>;
  attributeValues: Record<string, unknown>;
}

function extractQuestionId(q: string | BackendSectionQuestion): string | null {
  if (typeof q === 'string') return q;
  return q?.questionId ?? q?._id ?? q?.id ?? null;
}

function adaptCollectionForm(c: BackendCollection): CollectionFormData {
  // Backend type/status are uppercase enums (`SIMULATION`/`EXERCISE`, `DRAFT`/`ACTIVE`/`INACTIVE`);
  // normalise defensively in case a stale/lowercase value comes through.
  const rawType = (c.type ?? '').toUpperCase();
  const type =
    rawType === 'SIMULATION' || rawType === 'EXERCISE' ? (rawType as CollectionType) : null;

  // The collection references its tests via the `tests` array of `{ id, name }`.
  const testIds = (c.tests ?? []).map((t) => t.id).filter(Boolean);

  // Duration, attempts and scores live inside the sections, not at the top level.
  const firstSection = c.sections?.[0];
  const firstPoints = (firstSection?.questions ?? [])
    .map((q) => (typeof q === 'object' ? q.points : undefined))
    .find((p): p is NonNullable<typeof p> => !!p);

  // Legacy docs may have attributes as an array; new docs store it as a plain object.
  const rawAttrs = c.attributes;
  let attributeValues: Record<string, unknown> = {};
  if (Array.isArray(rawAttrs)) {
    attributeValues = Object.assign(
      {},
      ...rawAttrs.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    );
  } else if (rawAttrs && typeof rawAttrs === 'object') {
    attributeValues = rawAttrs as Record<string, unknown>;
  }

  return {
    type,
    name: c.name ?? '',
    testIds,
    sections: (c.sections ?? []).map((s, i) => ({
      id: s._id ?? crypto.randomUUID(),
      name: s.name ?? `Sezione ${i + 1}`,
      questionIds: (s.questions ?? []).map(extractQuestionId).filter((id): id is string => !!id),
    })),
    details: {
      // rules.duration is stored in seconds on the backend; the form works in minutes.
      durationMinutes:
        typeof firstSection?.rules?.duration === 'number'
          ? firstSection.rules.duration / 60
          : undefined,
      pausable: firstSection?.rules?.pausable,
      // Backend defaults existing/older documents to true (schema default), so treat
      // a missing value the same way here.
      enableCorrection: c.enableCorrection ?? true,
      validFrom: c.validFrom,
      validTo: c.validTo,
      status: (c.status ?? '').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      maxAttempts: firstSection?.maxAttempts,
      scoreCorrect: firstPoints?.correctPoint,
      scoreWrong: firstPoints?.wrongPoint,
      scoreEmpty: firstPoints?.emptyPoint,
    },
    attributeValues,
  };
}

/** Score triple the backend requires on every question of a section. */
export interface SectionPoints {
  correctPoint: number;
  emptyPoint: number;
  wrongPoint: number;
}

/**
 * A section as addressed by the backend. Sections have **no** `name` field in the
 * Mongo schema and are addressed by positional index
 * (`PUT /collections/:id/sections/:sectionIdx`), so the label is positional too.
 */
export interface CollectionSectionDetail {
  index: number;
  label: string;
  questionIds: string[];
  /** Points shared by every question in the section, when they all agree — used to pre-fill the score step. */
  uniformPoints: SectionPoints | null;
}

export interface AddQuestionsPlan {
  /** Ids that will actually be appended to the section. */
  toAdd: string[];
  /** Ids already in the target section — appending them again would duplicate. */
  alreadyPresent: string[];
  /** Ids sitting in a *different* section of the same collection: the backend rejects
   *  the whole request with 409, so they're dropped from the payload. */
  inOtherSection: string[];
}

function normaliseSectionRules(rules: BackendSection['rules']): {
  pausable: boolean;
  duration?: number;
  extraTime?: number[];
} {
  const out: { pausable: boolean; duration?: number; extraTime?: number[] } = {
    pausable: rules?.pausable ?? false,
  };
  if (typeof rules?.duration === 'number') out.duration = rules.duration;
  // The request model types `extraTime` as number[] while the Mongo schema declares a
  // scalar Number. Only forward it when it already matches the model — a scalar would be
  // rejected by the API Gateway validator. (`addSection`/`replaceSections` drop it too.)
  if (Array.isArray(rules?.extraTime) && rules.extraTime.every((n) => typeof n === 'number')) {
    out.extraTime = rules.extraTime;
  }
  return out;
}

function normaliseSectionPoints(
  points: BackendSectionQuestion['points'] | undefined
): SectionPoints | null {
  if (
    typeof points?.correctPoint !== 'number' ||
    typeof points?.emptyPoint !== 'number' ||
    typeof points?.wrongPoint !== 'number'
  ) {
    return null;
  }
  return {
    correctPoint: points.correctPoint,
    emptyPoint: points.emptyPoint,
    wrongPoint: points.wrongPoint,
  };
}

function adaptSectionDetails(sections: BackendSection[]): CollectionSectionDetail[] {
  return sections.map((s, index) => {
    const questions = s.questions ?? [];
    const allPoints = questions.map((q) =>
      typeof q === 'object' ? normaliseSectionPoints(q.points) : null
    );
    const first = allPoints[0];
    const uniform =
      first &&
      allPoints.every(
        (p) =>
          p &&
          p.correctPoint === first.correctPoint &&
          p.emptyPoint === first.emptyPoint &&
          p.wrongPoint === first.wrongPoint
      )
        ? first
        : null;

    return {
      index,
      // Sections are unnamed on the backend; the collection editor labels them the
      // same positional way, so keep the two views consistent.
      label: `Sezione ${index + 1}`,
      questionIds: questions.map(extractQuestionId).filter((id): id is string => !!id),
      uniformPoints: uniform,
    };
  });
}

/** Splits the requested ids into what can be appended vs. what has to be dropped. */
export function planQuestionsForSection(
  sections: Pick<CollectionSectionDetail, 'index' | 'questionIds'>[],
  sectionIdx: number,
  questionIds: string[]
): AddQuestionsPlan {
  const target = new Set(sections.find((s) => s.index === sectionIdx)?.questionIds ?? []);
  const others = new Set(
    sections.filter((s) => s.index !== sectionIdx).flatMap((s) => s.questionIds)
  );

  const plan: AddQuestionsPlan = { toAdd: [], alreadyPresent: [], inOtherSection: [] };
  for (const id of questionIds) {
    if (target.has(id)) plan.alreadyPresent.push(id);
    else if (others.has(id)) plan.inOtherSection.push(id);
    else if (!plan.toAdd.includes(id)) plan.toAdd.push(id);
  }
  return plan;
}

export const collectionsService = {
  async create(
    client: APIClient,
    payload: CreateCollectionPayload,
    signal?: AbortSignal
  ): Promise<Collection> {
    const raw = await client.post<BackendCollection>('/collections', payload, { signal });
    return adaptCollection(raw);
  },
  async update(
    client: APIClient,
    id: string,
    payload: UpdateCollectionPayload,
    signal?: AbortSignal
  ): Promise<Collection> {
    const raw = await client.put<BackendCollection>(`/collections/${id}`, payload, { signal });
    return adaptCollection(raw);
  },
  async list(
    client: APIClient,
    query: {
      page: number;
      limit?: number;
      id?: string;
      search?: string;
      statuses?: string[];
      type?: string;
      testIds?: string[];
      tagIds?: string[];
      tagsMode?: 'OR' | 'AND';
      archived?: boolean;
    },
    signal?: AbortSignal
  ): Promise<{ collections: Collection[]; total: number }> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 20),
    };
    if (query.id) params.id = query.id;
    if (query.search) params.search = query.search;
    if (query.statuses?.length) params.statuses = query.statuses.join(',');
    if (query.type) params.type = query.type;
    if (query.testIds?.length) params.testIds = query.testIds.join(',');
    if (query.tagIds?.length) params.tagIds = query.tagIds.join(',');

    // `filterMode` is a CSV list of `<paramKey>:<OR|AND>` entries declaring how
    // each multi-value filter should be combined. Only emitted for filters that
    // are actually applied.
    const filterModes: string[] = [];
    if (query.tagIds?.length && query.tagsMode) filterModes.push(`tagIds:${query.tagsMode}`);
    if (filterModes.length) params.filterMode = filterModes.join(',');

    if (query.archived !== undefined) params.archived = String(query.archived);

    const raw = await client.get<BackendListResponse>('/collections', { params, signal });
    return {
      collections: (raw.data ?? []).map(adaptCollection),
      total: raw.total ?? 0,
    };
  },

  async getById(
    client: APIClient,
    id: string,
    signal?: AbortSignal
  ): Promise<{ collections: Collection[]; total: number }> {
    try {
      const raw = await client.get<BackendCollection>(`/collections/${id}`, { signal });
      return { collections: [adaptCollection(raw)], total: 1 };
    } catch {
      return { collections: [], total: 0 };
    }
  },

  async getFormData(
    client: APIClient,
    id: string,
    signal?: AbortSignal
  ): Promise<CollectionFormData> {
    const raw = await client.get<BackendCollection>(`/collections/${id}`, { signal });
    return adaptCollectionForm(raw);
  },

  async addSection(
    client: APIClient,
    collectionId: string,
    payload: {
      rules: { pausable: boolean; duration?: number };
      questions: Array<{ questionId: string; points: { correctPoint: number; emptyPoint: number; wrongPoint: number } }>;
      maxAttempts?: number;
    },
    signal?: AbortSignal
  ): Promise<void> {
    await client.post(`/collections/${collectionId}/sections`, payload, { signal });
  },

  async replaceSections(
    client: APIClient,
    collectionId: string,
    sections: Array<{
      rules: { pausable: boolean; duration?: number };
      questions: Array<{ questionId: string; points: { correctPoint: number; emptyPoint: number; wrongPoint: number } }>;
      maxAttempts?: number;
    }>,
    signal?: AbortSignal
  ): Promise<void> {
    await client.put(`/collections/${collectionId}/sections`, { sections }, { signal });
  },

  /** Sections of a collection, index-addressed exactly like the backend addresses them. */
  async getSections(
    client: APIClient,
    collectionId: string,
    signal?: AbortSignal
  ): Promise<CollectionSectionDetail[]> {
    const raw = await client.get<BackendCollection>(`/collections/${collectionId}`, { signal });
    return adaptSectionDetails(raw.sections ?? []);
  },

  /**
   * Appends questions to an existing section.
   *
   * `PUT /collections/:id/sections/:sectionIdx` **replaces** the whole section, so this
   * re-reads the collection right before writing and merges: existing questions keep their
   * own scores, the new ones get `points`. Ids already present, or already used by another
   * section (which the backend rejects with 409 for the entire request), are dropped and
   * reported back in the returned plan.
   */
  async addQuestionsToSection(
    client: APIClient,
    collectionId: string,
    sectionIdx: number,
    questionIds: string[],
    points: SectionPoints,
    signal?: AbortSignal
  ): Promise<AddQuestionsPlan> {
    const raw = await client.get<BackendCollection>(`/collections/${collectionId}`, { signal });
    const sections = raw.sections ?? [];
    const section = sections[sectionIdx];
    if (!section) throw new Error(`Sezione ${sectionIdx + 1} non trovata nella collection`);

    const plan = planQuestionsForSection(adaptSectionDetails(sections), sectionIdx, questionIds);
    if (plan.toAdd.length === 0) return plan;

    const existing = (section.questions ?? []).flatMap((q) => {
      const id = extractQuestionId(q);
      if (!id) return [];
      const own = typeof q === 'object' ? normaliseSectionPoints(q.points) : null;
      // The request model requires the full score triple on every question; legacy rows
      // with missing/partial points inherit the scores chosen for this import.
      return [{ questionId: id, points: own ?? points }];
    });

    const body: {
      rules: ReturnType<typeof normaliseSectionRules>;
      questions: Array<{ questionId: string; points: SectionPoints }>;
      maxAttempts?: number;
    } = {
      rules: normaliseSectionRules(section.rules),
      questions: [...existing, ...plan.toAdd.map((questionId) => ({ questionId, points }))],
    };
    if (Number.isInteger(section.maxAttempts)) body.maxAttempts = section.maxAttempts;

    await client.put(`/collections/${collectionId}/sections/${sectionIdx}`, body, { signal });
    return plan;
  },

  async updateAttributes(
    client: APIClient,
    id: string,
    payload: { attributes?: Record<string, unknown>; enableCorrection?: boolean },
    signal?: AbortSignal
  ): Promise<void> {
    await client.put(`/collections/${id}`, payload, { signal });
  },

  async updateStatus(
    client: APIClient,
    id: string,
    status: string,
    signal?: AbortSignal
  ): Promise<void> {
    await client.patch(`/collections/${id}/status`, { status }, { signal });
  },

  async setArchived(
    client: APIClient,
    id: string,
    archived: boolean,
    signal?: AbortSignal
  ): Promise<void> {
    await client.patch(`/collections/${id}/archive`, { archived }, { signal });
  },

  async updateTags(
    client: APIClient,
    id: string,
    tags: Tag[],
    signal?: AbortSignal
  ): Promise<void> {
    await client.put(`/collections/${id}`, { tags: tags.map((t) => t.id) }, { signal });
  },

  async duplicate(
    client: APIClient,
    id: string,
    name: string,
    signal?: AbortSignal
  ): Promise<Collection> {
    const raw = await client.post<BackendCollection>(`/collections/${id}/duplicate`, { name }, { signal });
    return adaptCollection(raw);
  },
};
