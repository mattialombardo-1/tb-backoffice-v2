import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { attributesService } from '@/lib/services/attributes';
import { queryKeys } from '@/lib/query/queryKeys';
import type { Attribute, AttributeItem, AttributeResourceName } from '@/lib/types/attributes';

export interface AttributesByResourceState {
  data: Attribute | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  save: (attributes: AttributeItem[]) => Promise<Attribute>;
}

export function useAttributesByResource(resource: AttributeResourceName): AttributesByResourceState {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.attributes.byResource(resource),
    queryFn: ({ signal }) => attributesService.getByResource(client, resource, signal),
    // 404 means no attributes defined yet — treat as empty, not an error
    retry: (_, error: unknown) => {
      const status = (error as { status?: number })?.status;
      return status !== 404;
    },
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.attributes.byResource(resource) }),
    [queryClient, resource]
  );

  const save = useCallback(
    async (attributes: AttributeItem[]) => {
      const result = await attributesService.create(client, {
        resource: { name: resource, attributes },
      });
      await invalidate();
      return result;
    },
    [client, resource, invalidate]
  );

  const is404 =
    !query.isLoading &&
    query.error !== null &&
    (query.error as { status?: number })?.status === 404;

  return {
    data: is404 ? null : (query.data ?? null),
    isLoading: query.isLoading,
    error: is404 ? null : ((query.error as Error | null)?.message ?? null),
    refetch: query.refetch,
    save,
  };
}
