import { useQueries } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { queryKeys } from '@/lib/query';
import type { QuestionAssociations } from '@/lib/types/questions';

export function useQuestionAssociations(questionIds: string[]): Map<string, QuestionAssociations> {
  const client = useApiClient();

  const results = useQueries({
    queries: questionIds.map((id) => ({
      queryKey: queryKeys.questions.associations(id),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        questionsService.getAssociations(client, id, signal),
      staleTime: 2 * 60 * 1000,
    })),
  });

  const map = new Map<string, QuestionAssociations>();
  questionIds.forEach((id, i) => {
    const data = results[i]?.data;
    if (data) map.set(id, data);
  });
  return map;
}
