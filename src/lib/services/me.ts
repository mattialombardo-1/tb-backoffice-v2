import type { APIClient } from '@/lib/api/client';
import type { MeResponse } from '@/lib/types/me';

export const meService = {
  async profile(client: APIClient, signal?: AbortSignal): Promise<MeResponse> {
    return client.get<MeResponse>('/community-profile', { signal });
  },
};
