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
    // isFetching copre anche il refetch manuale (isLoading resta false quando ci sono già
    // dati in cache, quindi da solo non basta a far girare l'icona di ricarica).
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
