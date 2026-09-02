import { SSO_IMPERSONATE_URL } from '@/lib/auth/config';
import type { APIClient } from '@/lib/api/client';
import type {
  Client,
  ClientBrand,
  ClientModulesResponse,
  ClientsResponse,
  GetClientsQuery,
  ImpersonateClientResponse,
} from '@/lib/types/clients';

interface BackendUser {
  id: string;
  cognitoId: string;
  name: string;
  surname: string;
  email: string;
  brands?: { id: string; name: string }[];
}

interface BackendUsersResponse {
  total: number;
  users: BackendUser[];
}

function adaptUser(u: BackendUser): Client {
  return {
    id: u.id,
    cognitoId: u.cognitoId,
    name: u.name,
    surname: u.surname,
    email: u.email,
    brands: (u.brands ?? []).map<ClientBrand>(b => ({ id: b.id, name: b.name })),
  };
}

interface BackendModule {
  _id: string;
  name: string;
  skuCode?: string;
}

export const clientsService = {
  async list(
    client: APIClient,
    query: GetClientsQuery,
    signal?: AbortSignal
  ): Promise<ClientsResponse> {
    const pageZero = query.page ? Math.max(0, parseInt(query.page, 10) - 1) : 0;

    const params: Record<string, string> = { page: String(pageZero) };
    if (query.search?.trim()) params.search = query.search.trim();

    const raw = await client.get<BackendUsersResponse>('/users', { params, signal });

    return {
      total: raw.total ?? 0,
      clients: (raw.users ?? []).map(adaptUser),
    };
  },

  async getOrders(
    client: APIClient,
    clientId: string,
    signal?: AbortSignal
  ): Promise<ClientModulesResponse> {
    const raw = await client.get<BackendModule[]>(`/users/${clientId}/modules`, { signal });
    return {
      modules: (raw ?? []).map((m) => ({
        id: m._id,
        name: m.name,
        skuCode: m.skuCode ?? '',
      })),
    };
  },

  async getBrands(
    client: APIClient,
    clientId: string,
    signal?: AbortSignal
  ): Promise<ClientBrand[]> {
    const raw = await client.get<{ brands?: { id: string; name: string }[] }>(
      `/users/${clientId}`,
      { signal }
    );
    return (raw.brands ?? []).map<ClientBrand>((b) => ({ id: b.id, name: b.name }));
  },

  async delete(client: APIClient, clientId: string, signal?: AbortSignal): Promise<void> {
    await client.delete(`/users/${clientId}`, { signal });
  },

  async impersonate(token: string, clientEmail: string): Promise<ImpersonateClientResponse> {
    const res = await fetch(SSO_IMPERSONATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: clientEmail }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Errore SSO (${res.status})`);
    }

    return res.json() as Promise<ImpersonateClientResponse>;
  },
};
