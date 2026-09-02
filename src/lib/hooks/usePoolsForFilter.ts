import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { poolsService } from '@/lib/services/pools';
import { queryKeys } from '@/lib/query';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import type { APIClient } from '@/lib/api/client';
import type { Pool } from '@/lib/types/pools';

const PAGE_SIZE = 100;

async function fetchAllPools(client: APIClient, signal: AbortSignal): Promise<Pool[]> {
  const first = await poolsService.list(client, { page: 1, limit: PAGE_SIZE }, signal);
  const all = [...first.pools];

  if (first.total > PAGE_SIZE) {
    const extraPages = Math.ceil((first.total - PAGE_SIZE) / PAGE_SIZE);
    const rest = await Promise.all(
      Array.from({ length: extraPages }, (_, i) =>
        poolsService.list(client, { page: i + 2, limit: PAGE_SIZE }, signal)
      )
    );
    rest.forEach((r) => all.push(...r.pools));
  }

  return all;
}

export function usePoolsForFilter(): {
  options: MultiSelectOption[];
  isLoading: boolean;
} {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.pools.forFilter,
    queryFn: ({ signal }) => fetchAllPools(client, signal),
    staleTime: 5 * 60 * 1000,
  });

  const options: MultiSelectOption[] = Array.isArray(query.data)
    ? query.data.map((p) => ({ value: p.id, label: p.name }))
    : [];

  return { options, isLoading: query.isLoading };
}
