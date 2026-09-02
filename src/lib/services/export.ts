import type { APIClient } from '@/lib/api/client';
import type { CollectionFilters } from '@/lib/types/collections';
import type { ExportResponse } from '@/lib/types/export';

export const exportService = {
  async exportByFilters(
    client: APIClient,
    filters: Omit<CollectionFilters, 'page'>,
    signal?: AbortSignal,
  ): Promise<ExportResponse> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search.trim();
    if (filters.statuses.length) params.statuses = filters.statuses.join(',');
    if (filters.type) params.type = filters.type;
    if (filters.tests.length) params.testIds = filters.tests.join(',');
    if (filters.tags.length) params.tagIds = filters.tags.join(',');
    if (filters.archived !== undefined) params.archived = String(filters.archived);

    const filterModes: string[] = [];
    if (filters.tags.length && filters.tagsMode) filterModes.push(`tagIds:${filters.tagsMode}`);
    if (filterModes.length) params.filterMode = filterModes.join(',');

    return client.get<ExportResponse>('/collections/export', { params, signal });
  },

  async exportById(
    client: APIClient,
    collectionId: string,
    signal?: AbortSignal,
  ): Promise<ExportResponse> {
    return client.get<ExportResponse>(`/collections/${collectionId}/export`, { signal });
  },

  /** Export an explicit set of collections (e.g. selected via checkboxes in the list). */
  async exportByIds(
    client: APIClient,
    collectionIds: string[],
    signal?: AbortSignal,
  ): Promise<ExportResponse> {
    const responses = await Promise.all(
      collectionIds.map((id) => exportService.exportById(client, id, signal))
    );
    const collections = responses.flatMap((r) => r.collections);
    return { collections, total: collections.length };
  },
};
