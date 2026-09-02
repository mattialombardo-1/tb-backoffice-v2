import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { poolsService } from '@/lib/services/pools';
import { queryKeys } from '@/lib/query';
import type { Pool, PoolsFilters } from '@/lib/types/pools';

const PER_PAGE = 20;

export interface PoolsListResult {
  /** Pools for the current page after filtering */
  data: Pool[];
  /** All pools (unfiltered) — used to derive slider max */
  allPools: Pool[];
  /** Total matching pools (after filters, before pagination) */
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function filterPools(pools: Pool[], filters: PoolsFilters): Pool[] {
  const searchLower = filters.search.trim().toLowerCase();

  return pools.filter((pool) => {
    // Search by name or id
    if (searchLower) {
      const matchesName = pool.name.toLowerCase().includes(searchLower);
      const matchesId = pool.id.toLowerCase().includes(searchLower);
      if (!matchesName && !matchesId) return false;
    }

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(pool.status)) return false;

    // Questions range (skip if both are at sentinel value 0/Infinity)
    if (filters.maxQuestions > 0) {
      if (pool.totalQuestions < filters.minQuestions) return false;
      if (pool.totalQuestions > filters.maxQuestions) return false;
    }

    // Subjects filter — pool must have at least one matching subject
    if (filters.subjectIds.length > 0) {
      const poolSubjectIds = pool.questionCountBySubject.map((s) => s.subjectId);
      const hasMatch = filters.subjectIds.some((id) => poolSubjectIds.includes(id));
      if (!hasMatch) return false;
    }

    return true;
  });
}

export function usePoolsList(filters: PoolsFilters, page: number): PoolsListResult {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.pools.list(),
    queryFn: ({ signal }) => poolsService.listAll(client, signal),
    staleTime: 60_000,
  });

  const allPools = query.data ?? [];

  const filtered = useMemo(() => filterPools(allPools, filters), [allPools, filters]);

  const paged = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  return {
    data: paged,
    allPools,
    total: filtered.length,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
