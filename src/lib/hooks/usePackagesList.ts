import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { packagesService } from '@/lib/services/packages';
import { queryKeys } from '@/lib/query';
import type { PackageFilters, PackagesListState } from '@/lib/types/packages';

export function usePackagesList(filters: PackageFilters): PackagesListState {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.packages.list(filters),
    queryFn: ({ signal }) =>
      packagesService.list(client, { page: filters.page, searchField: filters.searchField, search: filters.search }, signal),
  });

  return {
    data: query.data?.packages ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
