import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { staffService } from '@/lib/services/staff';
import { queryKeys } from '@/lib/query';
import type { StaffFilters, StaffListState } from '@/lib/types/staff';

const PER_PAGE = 20;

export function useStaffList(filters: StaffFilters): StaffListState {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.staff.list(filters),
    queryFn: ({ signal }) =>
      staffService.list(
        client,
        {
          per_page: String(PER_PAGE),
          page: String(filters.page),
          search: filters.search || undefined,
          roleId: filters.roleId || undefined,
        },
        signal
      ),
  });

  // FIXME(elliot-audit-2026-05): `staffService.updateRole` throws
  // StaffActionUnsupportedError on the real-API branch (PR-01 + PR-05 broke the
  // legacy POST/{ roles: [name] } shape). We forward the error to the caller
  // and skip any optimistic update — the row state should match the server.
  const updateStaffRole = useCallback(
    async (staffId: string, roleIds: string[]) => {
      await staffService.updateRole(client, staffId, roleIds);
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(filters) });
    },
    [client, queryClient, filters]
  );

  const deleteStaff = useCallback(
    async (staffId: string) => {
      await staffService.delete(client, staffId);
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.list(filters) });
    },
    [client, queryClient, filters]
  );

  return {
    data: query.data?.communityUsers ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    updateStaffRole,
    deleteStaff,
  };
}
