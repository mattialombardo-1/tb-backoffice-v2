import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { collectionsService } from '@/lib/services/collections';
import { queryKeys } from '@/lib/query';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import type { APIClient } from '@/lib/api/client';
import type { Collection } from '@/lib/types/collections';

const PAGE_SIZE = 100;

async function fetchAllCollections(client: APIClient, signal: AbortSignal): Promise<Collection[]> {
  const first = await collectionsService.list(client, { page: 1, limit: PAGE_SIZE }, signal);
  const all = [...first.collections];

  if (first.total > PAGE_SIZE) {
    const extraPages = Math.ceil((first.total - PAGE_SIZE) / PAGE_SIZE);
    const rest = await Promise.all(
      Array.from({ length: extraPages }, (_, i) =>
        collectionsService.list(client, { page: i + 2, limit: PAGE_SIZE }, signal)
      )
    );
    rest.forEach((r) => all.push(...r.collections));
  }

  return all;
}

export function useCollectionsForFilter(): {
  options: MultiSelectOption[];
  isLoading: boolean;
} {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.collections.forFilter,
    queryFn: ({ signal }) => fetchAllCollections(client, signal),
    staleTime: 5 * 60 * 1000,
  });

  const options: MultiSelectOption[] = Array.isArray(query.data)
    ? query.data.map((c) => ({ value: c.id, label: c.name }))
    : [];

  return { options, isLoading: query.isLoading };
}
