import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { queryKeys } from '@/lib/query';
import type { HierarchyItem, HierarchySelection } from '@/lib/types/questions';

interface HierarchyLevel {
  items: HierarchyItem[];
  isLoading: boolean;
  error: string | null;
}

interface UseHierarchyReturn {
  selection: HierarchySelection;
  materie: HierarchyLevel;
  argomenti: HierarchyLevel;
  sottoArgomenti: HierarchyLevel;
  setMateria: (id: string | null, name?: string) => void;
  setArgomento: (id: string | null, name?: string) => void;
  setSottoArgomento: (id: string | null) => void;
  isComplete: boolean;
  retryMaterie: () => void;
  retryArgomenti: () => void;
  retrySottoArgomenti: () => void;
}

export function useHierarchy(initial?: Partial<HierarchySelection>): UseHierarchyReturn {
  const client = useApiClient();

  const [selection, setSelection] = useState<HierarchySelection>({
    subjectId: initial?.subjectId ?? null,
    subjectName: initial?.subjectName ?? null,
    topicId: initial?.topicId ?? null,
    topicName: initial?.topicName ?? null,
    sottoArgomentoId: initial?.sottoArgomentoId ?? null,
  });

  const materieQuery = useQuery({
    queryKey: queryKeys.questions.materie,
    queryFn: ({ signal }) => questionsService.getMaterie(client, signal),
    staleTime: 5 * 60_000,
  });

  const argomentiQuery = useQuery({
    queryKey: queryKeys.questions.argomenti(selection.subjectId ?? ''),
    queryFn: ({ signal }) => questionsService.getArgomenti(client, selection.subjectId!, signal),
    enabled: !!selection.subjectId,
    staleTime: 5 * 60_000,
  });

  const sottoArgomentiQuery = useQuery({
    queryKey: queryKeys.questions.sottoArgomenti(
      selection.subjectId ?? '',
      selection.topicId ?? ''
    ),
    queryFn: ({ signal }) =>
      questionsService.getSottoArgomenti(
        client,
        selection.subjectId!,
        selection.topicId!,
        signal
      ),
    enabled: !!selection.subjectId && !!selection.topicId,
    staleTime: 5 * 60_000,
  });

  // When initial arrives late (e.g. edit route loads question async), seed selection once.
  useEffect(() => {
    if (initial?.subjectId && !selection.subjectId) {
      setSelection({
        subjectId: initial.subjectId,
        subjectName: initial.subjectName ?? null,
        topicId: initial.topicId ?? null,
        topicName: initial.topicName ?? null,
        sottoArgomentoId: initial.sottoArgomentoId ?? null,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.subjectId]);

  // When initialized with only IDs (e.g. review mode navigation), resolve names
  // from the loaded items so the save payload has the correct subject/topic names.
  useEffect(() => {
    if (selection.subjectId && !selection.subjectName && materieQuery.data?.length) {
      const found = materieQuery.data.find((m) => m.id === selection.subjectId);
      if (found) setSelection((prev) => ({ ...prev, subjectName: found.name }));
    }
  }, [selection.subjectId, selection.subjectName, materieQuery.data]);

  useEffect(() => {
    if (selection.topicId && !selection.topicName && argomentiQuery.data?.length) {
      const found = argomentiQuery.data.find((a) => a.id === selection.topicId);
      if (found) setSelection((prev) => ({ ...prev, topicName: found.name }));
    }
  }, [selection.topicId, selection.topicName, argomentiQuery.data]);

  const setMateria = useCallback((id: string | null, name?: string) => {
    setSelection({ subjectId: id, subjectName: name ?? null, topicId: null, topicName: null, sottoArgomentoId: null });
  }, []);

  const setArgomento = useCallback((id: string | null, name?: string) => {
    setSelection((prev) => ({ ...prev, topicId: id, topicName: name ?? null, sottoArgomentoId: null }));
  }, []);

  const setSottoArgomento = useCallback((id: string | null) => {
    setSelection((prev) => ({ ...prev, sottoArgomentoId: id }));
  }, []);

  // Sotto-argomento is optional on the backend (subtopic is optional in Question shape).
  // Form is "complete" once materia + argomento are selected.
  const isComplete = !!(selection.subjectId && selection.topicId);

  return {
    selection,
    materie: {
      items: materieQuery.data ?? [],
      isLoading: materieQuery.isLoading,
      error: materieQuery.error?.message ?? null,
    },
    argomenti: {
      items: argomentiQuery.data ?? [],
      isLoading: argomentiQuery.isLoading,
      error: argomentiQuery.error?.message ?? null,
    },
    sottoArgomenti: {
      items: sottoArgomentiQuery.data ?? [],
      isLoading: sottoArgomentiQuery.isLoading,
      error: sottoArgomentiQuery.error?.message ?? null,
    },
    setMateria,
    setArgomento,
    setSottoArgomento,
    isComplete,
    retryMaterie: () => materieQuery.refetch(),
    retryArgomenti: () => argomentiQuery.refetch(),
    retrySottoArgomenti: () => sottoArgomentiQuery.refetch(),
  };
}
