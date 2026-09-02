import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { clientsService } from '@/lib/services/clients';
import { queryKeys } from '@/lib/query';
import type { ClientModule } from '@/lib/types/clients';

interface UseClientModulesResult {
  modules: ClientModule[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Hook name preserved (`useClientOrders`) to avoid churn across the dialog.
// FIXME(elliot-audit-2026-05): semantically this now fetches unlocked
// `Module[]` (GET /users/{userId}/modules), not "orders" — the original
// /users/{id}/package endpoint does not exist and OrdersRouteConstruct is
// commented out of the admin stack. Rename to `useClientModules` when the
// orders surface returns.
export function useClientOrders(clientId: string | null): UseClientModulesResult {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.clients.orders(clientId ?? ''),
    queryFn: ({ signal }) => clientsService.getOrders(client, clientId!, signal),
    enabled: !!clientId,
  });

  return {
    modules: query.data?.modules ?? [],
    isLoading: query.isLoading && !!clientId,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
