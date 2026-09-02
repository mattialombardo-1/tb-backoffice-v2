import type { APIClient } from '@/lib/api/client';
import type { CreateTestPayload, Test, UpdateTestPayload } from '@/lib/types/tests';

interface BackendBrand {
  id: string;
  name: string;
}

interface BackendDefaultScores {
  correct: number;
  empty: number;
  wrong: number;
}

interface BackendSyllabusItem {
  baseSubject: string;
  baseTopic: string;
  baseSubtopic?: string;
  displaySubject: string;
  displayTopic: string;
  displaySubtopic?: string;
}

interface BackendTest {
  _id: string;
  name: string;
  year?: number;
  brandOrders?: Array<{ brandId: string; order: number }>;
  brands?: BackendBrand[];
  syllabus?: BackendSyllabusItem[];
  defaultScores?: BackendDefaultScores;
}

interface BackendListTestsResponse {
  data: BackendTest[];
  total: number;
  page: number;
  limit: number;
}

interface ListTestsResponse {
  tests: Test[];
  total: number;
}

function adaptTest(t: BackendTest): Test {
  return {
    id: t._id,
    name: t.name,
    year: t.year ?? null,
    brands: (t.brands ?? []).map((b) => ({ id: b.id, name: b.name })),
    syllabus: (t.syllabus ?? []).map((s) => ({
      baseSubject: s.baseSubject,
      baseTopic: s.baseTopic,
      ...(s.baseSubtopic ? { baseSubtopic: s.baseSubtopic } : {}),
      displaySubject: s.displaySubject,
      displayTopic: s.displayTopic,
      ...(s.displaySubtopic ? { displaySubtopic: s.displaySubtopic } : {}),
    })),
    defaultScores: t.defaultScores ?? { correct: 0, empty: 0, wrong: 0 },
    brandOrders: (t.brandOrders ?? []).map(bo => ({ brandId: String(bo.brandId), order: bo.order })),
  };
}

export const testsService = {
  async list(
    client: APIClient,
    query: { page: number; limit?: number; name?: string; brandId?: string; year?: string },
    signal?: AbortSignal
  ): Promise<ListTestsResponse> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 20),
    };
    if (query.name) params.name = query.name;
    if (query.brandId) params.brandId = query.brandId;
    if (query.year) params.year = query.year;
    const raw = await client.get<BackendListTestsResponse>('/tests', { params, signal });
    return {
      tests: (raw.data ?? []).map(adaptTest),
      total: raw.total ?? 0,
    };
  },

  async getById(client: APIClient, testId: string, signal?: AbortSignal): Promise<Test> {
    const raw = await client.get<BackendTest>(`/tests/${testId}`, { signal });
    return adaptTest(raw);
  },

  async create(
    client: APIClient,
    payload: CreateTestPayload,
    signal?: AbortSignal
  ): Promise<Test> {
    const raw = await client.post<BackendTest>('/tests', payload, { signal });
    return adaptTest(raw);
  },

  async update(
    client: APIClient,
    testId: string,
    payload: UpdateTestPayload,
    signal?: AbortSignal
  ): Promise<Test> {
    const raw = await client.put<BackendTest>(`/tests/${testId}`, payload, { signal });
    return adaptTest(raw);
  },

  async delete(client: APIClient, testId: string, signal?: AbortSignal): Promise<void> {
    await client.delete(`/tests/${testId}`, { signal });
  },

  async reorder(
    client: APIClient,
    brandId: string,
    items: Array<{ id: string; order: number }>,
    signal?: AbortSignal
  ): Promise<void> {
    await client.patch('/tests/reorder', { brandId, order: items }, { signal });
  },

  async getYears(client: APIClient, signal?: AbortSignal): Promise<number[]> {
    const raw = await client.get<BackendListTestsResponse>('/tests', {
      params: { page: '1', limit: '1000' },
      signal,
    });
    const years = (raw.data ?? [])
      .map((t) => t.year)
      .filter((y): y is number => typeof y === 'number');
    return [...new Set(years)].sort((a, b) => b - a);
  },
};
