import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { poolsService } from '@/lib/services/pools';
import { queryKeys } from '@/lib/query';
import type { DifficultyLevel, QuestionLanguage, QuestionType } from '@/lib/types/questions';
import type { PoolQuestionsFilters, PoolQuestionsState } from '@/lib/types/pools';

export function usePoolQuestions(poolId: string, filters: PoolQuestionsFilters): PoolQuestionsState {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.pools.questions(poolId, filters),
    queryFn: ({ signal }) =>
      poolsService.listQuestions(
        client,
        poolId,
        {
          search: filters.search || undefined,
          page: filters.page,
          subjectId: filters.subjectId || undefined,
          topicId: filters.topicId || undefined,
          difficulty: (filters.difficulty as DifficultyLevel) || undefined,
          type: (filters.type as QuestionType) || undefined,
          language: (filters.language as QuestionLanguage) || undefined,
        },
        signal
      ),
    enabled: !!poolId,
  });

  return {
    data: query.data?.questions ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
