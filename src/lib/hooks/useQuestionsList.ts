import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { queryKeys } from '@/lib/query';
import type {
  QuestionsListFilters,
  QuestionsListResponse,
  QuestionsListState,
} from '@/lib/types/questions';
import { toQuestionsFilterQuery } from '@/lib/types/questions';

const PER_PAGE = 20;

export function useQuestionsList(filters: QuestionsListFilters): QuestionsListState {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.questions.list(filters),
    queryFn: ({ signal }) =>
      questionsService.listAdmin(
        client,
        { ...toQuestionsFilterQuery(filters), page: filters.page, perPage: PER_PAGE },
        signal
      ),
  });

  const deleteQuestion = useCallback(
    async (id: string) => {
      await questionsService.delete(client, id);
      queryClient.setQueryData(
        queryKeys.questions.list(filters),
        (old: QuestionsListResponse | undefined) => {
          if (!old) return old;
          return {
            total: old.total - 1,
            questions: old.questions.filter((q) => q.id !== id),
          };
        }
      );
    },
    [client, queryClient, filters]
  );

  return {
    data: query.data?.questions ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    deleteQuestion,
  };
}
