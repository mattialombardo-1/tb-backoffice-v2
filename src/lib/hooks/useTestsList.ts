import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { testsService } from '@/lib/services/tests';
import { queryKeys } from '@/lib/query';
import type { TestFilters, TestsListState } from '@/lib/types/tests';

export function useTestsList(filters: TestFilters): TestsListState {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.tests.list(filters),
    queryFn: ({ signal }) =>
      testsService.list(
        client,
        {
          page: filters.page,
          name: filters.search || undefined,
          brandId: filters.brandId || undefined,
          year: filters.year || undefined,
        },
        signal
      ),
  });

  return {
    data: query.data?.tests ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
