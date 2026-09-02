import { useQueries } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';

interface NamedResource {
  _id?: string;
  id?: string;
  name?: string;
}

interface UseResourceNamesResult {
  names: Record<string, string>;
  isLoading: boolean;
}

export function useResourceNames(
  ids: string[],
  endpointFor: (id: string) => string,
  queryPrefix: string,
  enabled: boolean
): UseResourceNamesResult {
  const client = useApiClient();

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: [queryPrefix, id],
      queryFn: async ({ signal }: { signal: AbortSignal }) => {
        const raw = await client.get<NamedResource>(endpointFor(id), { signal });
        return { id, name: raw.name ?? id };
      },
      enabled: enabled && ids.length > 0,
      staleTime: 5 * 60 * 1000,
    })),
  });

  const names: Record<string, string> = {};
  let isLoading = false;

  queries.forEach((q, i) => {
    if (q.data) names[ids[i]] = q.data.name;
    if (q.isPending && enabled) isLoading = true;
  });

  return { names, isLoading };
}
