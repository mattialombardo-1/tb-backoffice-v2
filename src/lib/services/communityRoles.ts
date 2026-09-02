import type { APIClient } from '@/lib/api/client';
import type {
  CommunityRole,
  CommunityRolesResponse,
  CreateCommunityRolePayload,
  UpdateCommunityRolePayload,
} from '@/lib/types/communityRoles';

export const communityRolesService = {
  async list(client: APIClient, signal?: AbortSignal): Promise<CommunityRole[]> {
    const res = await client.get<CommunityRolesResponse>('/community-roles', { signal });
    return res.data;
  },

  async create(
    client: APIClient,
    payload: CreateCommunityRolePayload,
    signal?: AbortSignal
  ): Promise<CommunityRole> {
    return client.post<CommunityRole>('/community-roles', payload, { signal });
  },

  async update(
    client: APIClient,
    roleId: string,
    payload: UpdateCommunityRolePayload,
    signal?: AbortSignal
  ): Promise<CommunityRole> {
    return client.put<CommunityRole>(`/community-roles/${roleId}`, payload, { signal });
  },

  async delete(client: APIClient, roleId: string, signal?: AbortSignal): Promise<void> {
    await client.delete(`/community-roles/${roleId}`, { signal });
  },
};
