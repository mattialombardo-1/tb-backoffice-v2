import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { subjectsService } from '@/lib/services/subjects';
import { queryKeys } from '@/lib/query/queryKeys';
import type { Subject } from '@/lib/types/subjects';

export interface SubjectsListState {
  data: Subject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createSubject: (name: string) => Promise<Subject>;
  updateSubject: (subjectId: string, name: string) => Promise<Subject>;
  deleteSubject: (subjectId: string) => Promise<void>;
  addTopic: (subjectId: string, name: string) => Promise<Subject>;
  updateTopic: (subjectId: string, topicId: string, name: string) => Promise<Subject>;
  deleteTopic: (subjectId: string, topicId: string) => Promise<void>;
}

export function useSubjectsList(): SubjectsListState {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: ({ signal }) => subjectsService.list(client, signal),
  });

  const invalidate = useCallback(
    () => queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all }),
    [queryClient]
  );

  const createSubject = useCallback(
    async (name: string) => {
      const result = await subjectsService.create(client, name);
      await invalidate();
      return result;
    },
    [client, invalidate]
  );

  const updateSubject = useCallback(
    async (subjectId: string, name: string) => {
      const result = await subjectsService.update(client, subjectId, name);
      await invalidate();
      return result;
    },
    [client, invalidate]
  );

  const deleteSubject = useCallback(
    async (subjectId: string) => {
      await subjectsService.delete(client, subjectId);
      await invalidate();
    },
    [client, invalidate]
  );

  const addTopic = useCallback(
    async (subjectId: string, name: string) => {
      const result = await subjectsService.addTopic(client, subjectId, name);
      await invalidate();
      return result;
    },
    [client, invalidate]
  );

  const updateTopic = useCallback(
    async (subjectId: string, topicId: string, name: string) => {
      const result = await subjectsService.updateTopic(client, subjectId, topicId, name);
      await invalidate();
      return result;
    },
    [client, invalidate]
  );

  const deleteTopic = useCallback(
    async (subjectId: string, topicId: string) => {
      await subjectsService.deleteTopic(client, subjectId, topicId);
      await invalidate();
    },
    [client, invalidate]
  );

  return {
    data: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  };
}
