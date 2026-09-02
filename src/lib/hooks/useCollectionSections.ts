import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { collectionsService } from '@/lib/services/collections';
import { queryKeys } from '@/lib/query';
import type { CollectionSectionDetail } from '@/lib/services/collections';

/** Sections of a single collection, index-addressed as the backend addresses them. */
export function useCollectionSections(collectionId: string | null): {
  sections: CollectionSectionDetail[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.collections.sections(collectionId ?? ''),
    queryFn: ({ signal }) => collectionsService.getSections(client, collectionId!, signal),
    enabled: !!collectionId,
    // Short-lived: sections change as soon as anyone adds questions to them.
    staleTime: 30 * 1000,
  });

  return {
    sections: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    refetch: () => void query.refetch(),
  };
}
