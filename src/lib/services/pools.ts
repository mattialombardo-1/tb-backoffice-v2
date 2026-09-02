import type { APIClient } from '@/lib/api/client';
import type { Pool, PoolQuestion, PoolScores, PoolStatus, PoolSubjectCount } from '@/lib/types/pools';
import type { DifficultyLevel, QuestionLanguage, QuestionType } from '@/lib/types/questions';

interface BackendPool {
  _id: string;
  name: string;
  description?: string;
  status: string; // backend returns uppercase: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED'
  totalQuestions?: number;
  questionCountBySubject?: { subjectId: string; subjectName: string; count: number }[];
  scores?: { correct: number; wrong: number; empty: number };
}

interface BackendPoolQuestion {
  _id: string;
  questionId: string;
  subjectId: string;
  subject?: { name: string };
  topicId?: string;
  topic?: { name: string };
  subtopicId?: string;
  subtopic?: { name: string };
  difficulty?: number;
  type: 'completion' | 'alternative';
  language: 'IT-it' | 'EN-en';
  addedAt?: string;
}

interface BackendListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const DIFFICULTY_FROM_NUM: Record<number, DifficultyLevel> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

const DIFFICULTY_TO_NUM: Record<DifficultyLevel, number> = {
  non_ancora_valutata: 0,
  facile: 1,
  medio_facile: 2,
  medio: 3,
  medio_difficile: 4,
  difficile: 5,
};

function adaptPool(p: BackendPool): Pool {
  const questionCountBySubject: PoolSubjectCount[] = (p.questionCountBySubject ?? []).map((s) => ({
    subjectId: String(s.subjectId),
    subjectName: s.subjectName,
    count: s.count,
  }));
  return {
    id: p._id,
    name: p.name,
    description: p.description,
    status: (p.status ?? 'DRAFT') as PoolStatus,
    totalQuestions: p.totalQuestions ?? 0,
    questionCountBySubject,
    scores: p.scores,
  };
}

function adaptPoolQuestion(q: BackendPoolQuestion): PoolQuestion {
  const difficulty: DifficultyLevel =
    q.difficulty != null ? (DIFFICULTY_FROM_NUM[q.difficulty] ?? 'non_ancora_valutata') : 'non_ancora_valutata';
  const type: QuestionType = q.type === 'completion' ? 'COMPLETION' : 'MULTIPLE_CHOICE';
  const language: QuestionLanguage = q.language;

  return {
    id: q._id,
    questionId: String(q.questionId),
    subjectId: String(q.subjectId),
    subjectName: q.subject?.name ?? '',
    topicId: q.topicId ? String(q.topicId) : undefined,
    topicName: q.topic?.name,
    subtopicId: q.subtopicId ? String(q.subtopicId) : undefined,
    subtopicName: q.subtopic?.name,
    difficulty,
    type,
    language,
    addedAt: q.addedAt ?? '',
  };
}

export const poolsService = {
  async create(
    client: APIClient,
    payload: { name: string; status: PoolStatus; brands: string[]; scores?: PoolScores }
  ): Promise<Pool> {
    const raw = await client.post<BackendPool>('/pools', payload);
    return adaptPool(raw);
  },

  async update(
    client: APIClient,
    poolId: string,
    payload: { name?: string; description?: string; brands?: string[]; scores?: PoolScores }
  ): Promise<Pool> {
    const raw = await client.put<BackendPool>(`/pools/${poolId}`, payload);
    return adaptPool(raw);
  },

  async get(client: APIClient, poolId: string, signal?: AbortSignal): Promise<Pool> {
    const raw = await client.get<BackendPool>(`/pools/${poolId}`, { signal });
    return adaptPool(raw);
  },

  async listAll(
    client: APIClient,
    signal?: AbortSignal
  ): Promise<Pool[]> {
    // Fetch up to 100 pools (backend max) in one shot — we filter client-side
    const params: Record<string, string> = { page: '1', limit: '100' };
    const raw = await client.get<BackendListResponse<BackendPool>>('/pools', { params, signal });
    return (raw.data ?? []).map(adaptPool);
  },

  async delete(client: APIClient, poolId: string): Promise<void> {
    await client.delete(`/pools/${poolId}`);
  },

  async addQuestion(client: APIClient, poolId: string, questionId: string): Promise<void> {
    await client.post(`/pools/${poolId}/questions`, { questionId });
  },

  async bulkAddQuestions(
    client: APIClient,
    poolId: string,
    questionIds: string[]
  ): Promise<{ added: number; alreadyIn: number; notFound: number }> {
    return client.post(`/pools/${poolId}/questions/bulk`, { questionIds });
  },

  async removeQuestion(client: APIClient, poolId: string, questionId: string): Promise<void> {
    await client.delete(`/pools/${poolId}/questions/${questionId}`);
  },

  async bulkRemoveQuestions(
    client: APIClient,
    poolId: string,
    questionIds: string[]
  ): Promise<{ removed: number; notFound: number }> {
    return client.delete(`/pools/${poolId}/questions/bulk`, { data: { questionIds } });
  },

  /** @deprecated Use listAll — kept for backward compat with PackagesCreateDialog/EditDialog */
  async list(
    client: APIClient,
    query: { page: number; limit?: number },
    signal?: AbortSignal
  ): Promise<{ pools: Pool[]; total: number }> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 100),
    };
    const raw = await client.get<BackendListResponse<BackendPool>>('/pools', { params, signal });
    return {
      pools: (raw.data ?? []).map(adaptPool),
      total: raw.total ?? 0,
    };
  },

  async updateStatus(
    client: APIClient,
    poolId: string,
    status: PoolStatus
  ): Promise<void> {
    await client.patch(`/pools/${poolId}/status`, { status });
  },

  async listQuestions(
    client: APIClient,
    poolId: string,
    query: {
      search?: string;
      page: number;
      limit?: number;
      subjectId?: string;
      topicId?: string;
      subtopicId?: string;
      difficulty?: DifficultyLevel;
      type?: QuestionType;
      language?: QuestionLanguage;
    },
    signal?: AbortSignal
  ): Promise<{ questions: PoolQuestion[]; total: number }> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 20),
    };
    if (query.search) params.search = query.search;
    if (query.subjectId) params.subjectId = query.subjectId;
    if (query.topicId) params.topicId = query.topicId;
    if (query.subtopicId) params.subtopicId = query.subtopicId;
    if (query.difficulty) params.difficulty = String(DIFFICULTY_TO_NUM[query.difficulty]);
    if (query.type) params.type = query.type === 'COMPLETION' ? 'completion' : 'alternative';
    if (query.language) params.language = query.language;

    const raw = await client.get<BackendListResponse<BackendPoolQuestion>>(
      `/pools/${poolId}/questions`,
      { params, signal }
    );
    return {
      questions: (raw.data ?? []).map(adaptPoolQuestion),
      total: raw.total ?? 0,
    };
  },
};
