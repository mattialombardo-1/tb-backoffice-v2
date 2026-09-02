import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { queryKeys } from '@/lib/query';

export function useMyReviews() {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.questions.myReviews,
    queryFn: ({ signal }) => questionsService.myReviews(client, signal),
    staleTime: 0,
  });

  return {
    questions: query.data ?? [],
    total: query.data?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
