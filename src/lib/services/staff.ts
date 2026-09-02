import type { APIClient } from '@/lib/api/client';
import type {
  CommunityUser,
  CommunityUsersResponse,
  GetCommunityUsersQuery,
} from '@/lib/types/staff';

export const staffService = {
  async list(
    client: APIClient,
    query: GetCommunityUsersQuery,
    signal?: AbortSignal
  ): Promise<CommunityUsersResponse> {
    const pageZero = query.page ? Math.max(0, parseInt(query.page, 10) - 1) : 0;

    const params: Record<string, string> = { page: String(pageZero) };
    if (query.per_page) params.per_page = query.per_page;
    if (query.search) params.search = query.search;
    if (query.roleId) params.roleId = query.roleId;

    return client.get<CommunityUsersResponse>('/community-users', { params, signal });
  },

  async updateRole(
    client: APIClient,
    staffId: string,
    roleIds: string[]
  ): Promise<void> {
    await client.put(`/community-users/${staffId}`, { roleIds });
  },

  async delete(client: APIClient, staffId: string): Promise<void> {
    await client.delete(`/community-users/${staffId}`);
  },

  async create(
    client: APIClient,
    data: { cognitoId: string; roleIds: string[] }
  ): Promise<CommunityUser> {
    return client.post<CommunityUser>('/community-users', data);
  },
};
