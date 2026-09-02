import type { APIClient } from '@/lib/api/client';
import type { Tag } from '@/lib/types/collections';

/**
 * Tags are scoped to a "resource" on the backend
 * (`/resources/{resource}/tags`). For the Collections screens the resource
 * is always `collections`.
 */
export const COLLECTIONS_TAG_RESOURCE = 'collections';

interface BackendTag {
  id: string;
  value: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  style?: { color?: string };
}

interface TagInput {
  value: string;
  style?: { color?: string };
}

function adaptTag(t: BackendTag): Tag {
  return {
    id: t.id,
    value: t.value,
    ...(t.style ? { style: t.style } : {}),
  };
}

export const tagsService = {
  // GET /resources/{resource}/tags -> AdminTagsListPayload (array)
  async list(client: APIClient, resource: string, signal?: AbortSignal): Promise<Tag[]> {
    const raw = await client.get<BackendTag[]>(`/resources/${resource}/tags`, { signal });
    return (Array.isArray(raw) ? raw : []).map(adaptTag);
  },

  // POST /resources/{resource}/tags (NewTagModel) -> AdminTagPayload
  async create(
    client: APIClient,
    resource: string,
    input: string | TagInput,
    signal?: AbortSignal
  ): Promise<Tag> {
    const body: TagInput = typeof input === 'string' ? { value: input } : input;
    const raw = await client.post<BackendTag>(`/resources/${resource}/tags`, body, { signal });
    return adaptTag(raw);
  },

  // PUT /resources/{resource}/tags/{tagId} (UpdateTagModel) -> AdminTagPayload
  async update(
    client: APIClient,
    resource: string,
    tagId: string,
    input: Partial<TagInput>,
    signal?: AbortSignal
  ): Promise<Tag> {
    const raw = await client.put<BackendTag>(
      `/resources/${resource}/tags/${tagId}`,
      input,
      { signal }
    );
    return adaptTag(raw);
  },

  // DELETE /resources/{resource}/tags/{tagId} -> 204
  async remove(
    client: APIClient,
    resource: string,
    tagId: string,
    signal?: AbortSignal
  ): Promise<void> {
    await client.delete(`/resources/${resource}/tags/${tagId}`, { signal });
  },
};
