import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { skusService } from '@/lib/services/skus';
import { queryKeys } from '@/lib/query';
import type { SkuFilters, SkusListState } from '@/lib/types/skus';

export function useSkusList(filters: SkuFilters): SkusListState {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.skus.list(filters),
    queryFn: ({ signal }) =>
      skusService.list(client, { page: filters.page, searchField: filters.searchField, search: filters.search }, signal),
  });

  return {
    data: query.data?.skus ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
