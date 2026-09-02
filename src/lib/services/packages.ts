import type { APIClient } from '@/lib/api/client';
import type { Package } from '@/lib/types/packages';

interface BackendPackage {
  _id: string;
  skuId?: string;
  skuCode?: string;
  skuName?: string;
  name?: string;
  active?: boolean;
  isFree?: boolean;
  timed?: boolean;
  collectionIds?: string[];
  poolIds?: string[];
  expiresAt?: string;
}

interface BackendListPackagesResponse {
  data: BackendPackage[];
  total: number;
  page: number;
  limit: number;
}

function adaptPackage(p: BackendPackage): Package {
  return {
    id: p._id,
    skuId: p.skuId ?? '',
    skuCode: p.skuCode ?? null,
    skuName: p.skuName ?? null,
    name: p.name ?? null,
    active: p.active ?? false,
    isFree: p.isFree ?? false,
    timed: p.timed ?? false,
    collectionIds: p.collectionIds ?? [],
    poolIds: p.poolIds ?? [],
    expiresAt: p.expiresAt ?? null,
  };
}

export const packagesService = {
  async list(
    client: APIClient,
    query: { page: number; limit?: number; searchField?: string; search?: string },
    signal?: AbortSignal
  ): Promise<{ packages: Package[]; total: number }> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 20),
    };
    if (query.search) {
      const field = query.searchField ?? 'name';
      if (field === 'id') params.id = query.search;
      else if (field === 'code') params.code = query.search;
      else params.name = query.search;
    }
    const raw = await client.get<BackendListPackagesResponse>('/packages', { params, signal });
    return {
      packages: (raw.data ?? []).map(adaptPackage),
      total: raw.total ?? 0,
    };
  },

  async create(
    client: APIClient,
    payload: {
      skuId: string;
      active: boolean;
      isFree: boolean;
      timed: boolean;
      name: string;
      expiresAt?: string | null;
      collectionIds?: string[];
      poolIds?: string[];
    },
    signal?: AbortSignal
  ): Promise<Package> {
    const body: Record<string, unknown> = {
      skuId: payload.skuId,
      active: payload.active,
      isFree: payload.isFree,
      timed: payload.timed,
      name: payload.name,
      collectionIds: payload.collectionIds ?? [],
      poolIds: payload.poolIds ?? [],
    };
    if (payload.expiresAt != null) body.expiresAt = payload.expiresAt;
    const raw = await client.post<BackendPackage>('/packages', body, { signal });
    return adaptPackage(raw);
  },

  async update(
    client: APIClient,
    packageId: string,
    payload: {
      name?: string;
      timed?: boolean;
      expiresAt?: string | null;
      collectionIds?: string[];
      poolIds?: string[];
    },
    signal?: AbortSignal
  ): Promise<Package> {
    const body: Record<string, unknown> = {};
    if (payload.name !== undefined) body.name = payload.name;
    if (payload.timed !== undefined) body.timed = payload.timed;
    if (payload.expiresAt) body.expiresAt = payload.expiresAt;
    if (payload.collectionIds !== undefined) body.collectionIds = payload.collectionIds;
    if (payload.poolIds !== undefined) body.poolIds = payload.poolIds;
    const raw = await client.put<BackendPackage>(`/packages/${packageId}`, body, { signal });
    return adaptPackage(raw);
  },

  async setActive(
    client: APIClient,
    packageId: string,
    active: boolean,
    signal?: AbortSignal
  ): Promise<Package> {
    const raw = await client.patch<BackendPackage>(
      `/packages/${packageId}/active`,
      { active },
      { signal }
    );
    return adaptPackage(raw);
  },

  async delete(client: APIClient, packageId: string, signal?: AbortSignal): Promise<void> {
    await client.delete(`/packages/${packageId}`, { signal });
  },
};
