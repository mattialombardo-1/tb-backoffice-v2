import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { tagsService, COLLECTIONS_TAG_RESOURCE } from '@/lib/services/tags';
import { queryKeys } from '@/lib/query';
import type { Tag } from '@/lib/types/collections';

export function useTags(
  resource: string = COLLECTIONS_TAG_RESOURCE
): { tags: Tag[]; isLoading: boolean } {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.tags.byResource(resource),
    queryFn: ({ signal }) => tagsService.list(client, resource, signal),
    staleTime: 5 * 60 * 1000,
  });

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
  };
}
