import type { APIClient } from '@/lib/api/client';
import type { Subject, SubjectsResponse } from '@/lib/types/subjects';

export const subjectsService = {
  async list(client: APIClient, signal?: AbortSignal): Promise<SubjectsResponse> {
    return client.get<SubjectsResponse>('/subjects', {
      params: { includes: 'topics' },
      signal,
    });
  },

  async create(client: APIClient, name: string): Promise<Subject> {
    return client.post<Subject>('/subjects', { name });
  },

  async update(client: APIClient, subjectId: string, name: string): Promise<Subject> {
    return client.put<Subject>(`/subjects/${subjectId}`, { name });
  },

  async delete(client: APIClient, subjectId: string): Promise<void> {
    await client.delete(`/subjects/${subjectId}`);
  },

  async addTopic(client: APIClient, subjectId: string, name: string): Promise<Subject> {
    return client.post<Subject>(`/subjects/${subjectId}/topics`, { name });
  },

  async updateTopic(
    client: APIClient,
    subjectId: string,
    topicId: string,
    name: string
  ): Promise<Subject> {
    return client.put<Subject>(`/subjects/${subjectId}/topics/${topicId}`, { name });
  },

  async deleteTopic(client: APIClient, subjectId: string, topicId: string): Promise<void> {
    await client.delete(`/subjects/${subjectId}/topics/${topicId}`);
  },
};
