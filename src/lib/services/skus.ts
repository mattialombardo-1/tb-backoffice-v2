import type { APIClient } from '@/lib/api/client';
import type { Sku } from '@/lib/types/skus';

interface BackendSkuBrand {
  id: string;
  name: string;
}

interface BackendSku {
  _id: string;
  code: string;
  name: string;
  url?: string;
  brands?: BackendSkuBrand[];
}

interface BackendListSkusResponse {
  data: BackendSku[];
  total: number;
  page: number;
  limit: number;
}

function adaptSku(s: BackendSku): Sku {
  return {
    id: s._id,
    code: s.code,
    name: s.name,
    url: s.url ?? null,
    brands: (s.brands ?? []).map((b) => ({ id: b.id, name: b.name })),
  };
}

export const skusService = {
  async create(
    client: APIClient,
    payload: { code: string; name: string; brands: { id: string; name: string }[]; url?: string },
    signal?: AbortSignal
  ): Promise<Sku> {
    const raw = await client.post<BackendSku>('/skus', payload, { signal });
    return adaptSku(raw);
  },

  async update(
    client: APIClient,
    skuId: string,
    payload: { name?: string; code?: string },
    signal?: AbortSignal
  ): Promise<Sku> {
    const raw = await client.put<BackendSku>(`/skus/${skuId}`, payload, { signal });
    return adaptSku(raw);
  },

  async delete(client: APIClient, skuId: string, signal?: AbortSignal): Promise<void> {
    await client.delete(`/skus/${skuId}`, { signal });
  },

  async list(
    client: APIClient,
    query: { page: number; limit?: number; search?: string; searchField?: string },
    signal?: AbortSignal
  ): Promise<{ skus: Sku[]; total: number }> {
    const params: Record<string, string> = {
      page: String(query.page),
      limit: String(query.limit ?? 20),
    };
    if (query.search) {
      const field = query.searchField;
      if (field === 'id') params.id = query.search;
      else if (field === 'code') params.code = query.search;
      else if (field === 'name') params.name = query.search;
      else params.search = query.search; // unified search (name + code)
    }
    const raw = await client.get<BackendListSkusResponse>('/skus', { params, signal });
    return {
      skus: (raw.data ?? []).map(adaptSku),
      total: raw.total ?? 0,
    };
  },
};
