import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { communityRolesService } from '@/lib/services/communityRoles';
import { queryKeys } from '@/lib/query';
import type { CommunityRole } from '@/lib/types/communityRoles';

export interface UseCommunityRolesResult {
  roles: CommunityRole[];
  rolesById: Map<string, CommunityRole>;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCommunityRoles(): UseCommunityRolesResult {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.communityRoles.all,
    queryFn: ({ signal }) => communityRolesService.list(client, signal),
    staleTime: 5 * 60 * 1000,
  });

  const rolesById = useMemo(() => {
    const map = new Map<string, CommunityRole>();
    for (const role of query.data ?? []) {
      map.set(role._id, role);
    }
    return map;
  }, [query.data]);

  return {
    roles: query.data ?? [],
    rolesById,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
