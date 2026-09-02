import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { collectionsService } from '@/lib/services/collections';
import { queryKeys } from '@/lib/query';
import type { CollectionFilters, CollectionsListState } from '@/lib/types/collections';

const PER_PAGE = 20;

export function useCollectionsList(filters: CollectionFilters): CollectionsListState {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.collections.list(filters),
    queryFn: ({ signal }) =>
      collectionsService.list(
        client,
        {
          page: filters.page,
          limit: PER_PAGE,
          id: filters.collectionId.trim() || undefined,
          search: filters.collectionId.trim() ? undefined : filters.search.trim() || undefined,
          statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
          type: filters.type || undefined,
          testIds: filters.tests.length > 0 ? filters.tests : undefined,
          tagIds: filters.tags.length > 0 ? filters.tags : undefined,
          tagsMode: filters.tagsMode,
          archived: filters.archived,
        },
        signal
      ),
  });

  return {
    data: query.data?.collections ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
