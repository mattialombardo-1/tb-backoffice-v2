import type { APIClient } from '@/lib/api/client';
import type {
  Campaign,
  CampaignDetail,
  CampaignQuestionSlot,
  CampaignQuestionStatus,
  CampaignQuestionType,
  CampaignSlotWithContext,
  CreateCampaignPayload,
  UpdateCampaignPayload,
} from '@/lib/types/campaigns';

interface BackendCampaignSlot {
  _id: string;
  status: CampaignQuestionStatus;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty?: number;
  questionType?: CampaignQuestionType;
  assigneeId: string;
  revisorId: string;
  dueDate?: string;
  collection?: string;
  pool?: string;
  questionId?: string;
}

interface BackendSlotWithContext extends BackendCampaignSlot {
  campaignId: string;
  campaignName: string;
}

interface BackendCampaign {
  _id: string;
  name: string;
  totalQuestions: number;
  remainingQuestions: number;
  author?: string;
  createdAt: string;
  updatedAt: string;
  questions?: BackendCampaignSlot[];
}

interface BackendListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

function adaptSlot(s: BackendCampaignSlot): CampaignQuestionSlot {
  return {
    id: s._id,
    status: s.status,
    subjectId: String(s.subjectId),
    subjectName: s.subjectName,
    topicId: String(s.topicId),
    topicName: s.topicName,
    difficulty: s.difficulty,
    questionType: s.questionType,
    assigneeId: String(s.assigneeId),
    revisorId: String(s.revisorId),
    dueDate: s.dueDate,
    collection: s.collection ? String(s.collection) : undefined,
    pool: s.pool ? String(s.pool) : undefined,
    questionId: s.questionId ? String(s.questionId) : undefined,
  };
}

function adaptSlotWithContext(s: BackendSlotWithContext): CampaignSlotWithContext {
  return {
    ...adaptSlot(s),
    campaignId: String(s.campaignId),
    campaignName: s.campaignName,
  };
}

function adaptCampaign(c: BackendCampaign): Campaign {
  return {
    id: c._id,
    name: c.name,
    totalQuestions: c.totalQuestions ?? 0,
    remainingQuestions: c.remainingQuestions ?? 0,
    author: c.author ? String(c.author) : undefined,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function adaptCampaignDetail(c: BackendCampaign): CampaignDetail {
  return {
    ...adaptCampaign(c),
    questions: (c.questions ?? []).map(adaptSlot),
  };
}

export const campaignsService = {
  async list(
    client: APIClient,
    query: { page: number; limit?: number; search?: string },
    signal?: AbortSignal
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 20),
    };
    if (query.search) params.search = query.search;

    const raw = await client.get<BackendListResponse<BackendCampaign>>('/campaigns', {
      params,
      signal,
    });
    return {
      campaigns: (raw.data ?? []).map(adaptCampaign),
      total: raw.total ?? 0,
    };
  },

  async get(client: APIClient, campaignId: string, signal?: AbortSignal): Promise<CampaignDetail> {
    const raw = await client.get<BackendCampaign>(`/campaigns/${campaignId}`, { signal });
    return adaptCampaignDetail(raw);
  },

  async create(client: APIClient, payload: CreateCampaignPayload): Promise<CampaignDetail> {
    const raw = await client.post<BackendCampaign>('/campaigns', payload);
    return adaptCampaignDetail(raw);
  },

  async update(
    client: APIClient,
    campaignId: string,
    payload: UpdateCampaignPayload
  ): Promise<CampaignDetail> {
    const raw = await client.put<BackendCampaign>(`/campaigns/${campaignId}`, payload);
    return adaptCampaignDetail(raw);
  },

  async delete(client: APIClient, campaignId: string): Promise<void> {
    await client.delete(`/campaigns/${campaignId}`);
  },

  async mySlots(client: APIClient, signal?: AbortSignal): Promise<CampaignSlotWithContext[]> {
    const raw = await client.get<BackendSlotWithContext[]>('/campaigns/my-slots', { signal });
    return (Array.isArray(raw) ? raw : []).map(adaptSlotWithContext);
  },

  async updateSlot(
    client: APIClient,
    campaignId: string,
    slotId: string,
    payload: { status?: CampaignQuestionStatus; questionId?: string }
  ): Promise<void> {
    await client.patch(`/campaigns/${campaignId}/slots/${slotId}`, payload);
  },
};
