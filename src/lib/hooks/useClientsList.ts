import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { clientsService } from '@/lib/services/clients';
import { queryKeys } from '@/lib/query';
import type { ClientFilters, ClientListState } from '@/lib/types/clients';

export function useClientsList(filters: ClientFilters): ClientListState {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.clients.list(filters),
    queryFn: ({ signal }) =>
      clientsService.list(client, { page: String(filters.page), search: filters.search }, signal),
  });

  return {
    data: query.data?.clients ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
