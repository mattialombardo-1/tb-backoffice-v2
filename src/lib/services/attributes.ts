import type { APIClient } from '@/lib/api/client';
import type { Attribute, AttributeResourceName, CreateAttributesPayload } from '@/lib/types/attributes';

export const attributesService = {
  async getByResource(
    client: APIClient,
    resource: AttributeResourceName,
    signal?: AbortSignal
  ): Promise<Attribute> {
    return client.get<Attribute>(`/resources/${resource}`, { signal });
  },

  async create(client: APIClient, payload: CreateAttributesPayload): Promise<Attribute> {
    return client.post<Attribute>(`/resources/${payload.resource.name}`, {
      attributes: payload.resource.attributes,
    });
  },
};
