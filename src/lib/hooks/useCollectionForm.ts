import { useState, useCallback, useEffect } from 'react';
import { useApiClient } from '@/lib/api/useApiClient';
import { useQueryClient } from '@tanstack/react-query';
import { collectionsService } from '@/lib/services/collections';
import { queryKeys } from '@/lib/query/queryKeys';
import type { CollectionType, CollectionSection, CollectionDetails } from '@/lib/types/collections';

export interface CollectionFormState {
  type: CollectionType | null;
  testIds: string[];
  name: string;
  sections: CollectionSection[];
  details: CollectionDetails;
  attributeValues: Record<string, unknown>;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const DEFAULT_COLLECTION_DETAILS: CollectionDetails = {
  durationMinutes: 60,
  pausable: true,
  enableCorrection: true,
  validFrom: '',
  validTo: '',
  status: 'DRAFT',
  maxAttempts: 1,
  uniformScores: true,
  scoreCorrect: 1,
  scoreWrong: 0,
  scoreEmpty: 0,
};

export function useCollectionForm(editId?: string) {
  const client = useApiClient();
  const queryClient = useQueryClient();
  const [draftId, setDraftId] = useState<string | null>(editId ?? null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isLoading, setIsLoading] = useState(!!editId);
  const [loadError, setLoadError] = useState<string | null>(null);
  // Track the status as it was when loaded from the server (edit mode only).
  const [loadedStatus, setLoadedStatus] = useState<'DRAFT' | 'ACTIVE' | null>(null);
  const [form, setForm] = useState<CollectionFormState>({
    type: null,
    testIds: [],
    name: '',
    sections: [{ id: crypto.randomUUID(), name: 'Sezione 1', questionIds: [] }],
    details: DEFAULT_COLLECTION_DETAILS,
    attributeValues: {},
  });

  // Edit mode: load the existing collection and pre-populate every stepper field.
  useEffect(() => {
    if (!editId) return;

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    collectionsService
      .getFormData(client, editId, controller.signal)
      .then((data) => {
        const resolvedStatus =
          (data.details?.status ?? 'DRAFT') === 'ACTIVE' ? 'ACTIVE' : 'DRAFT';
        setLoadedStatus(resolvedStatus);
        setForm((prev) => ({
          type: data.type,
          testIds: data.testIds,
          name: data.name,
          sections: data.sections.length > 0 ? data.sections : prev.sections,
          details: { ...DEFAULT_COLLECTION_DETAILS, ...data.details },
          attributeValues: Object.keys(data.attributeValues).length > 0
            ? data.attributeValues
            : prev.attributeValues,
        }));
        setDraftId(editId);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setLoadError(err?.message ?? 'Errore nel caricamento della collezione');
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [client, editId]);

  const updateForm = useCallback((patch: Partial<CollectionFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  }, []);

  const saveDraft = useCallback(async (): Promise<string | null> => {
    if (!form.type || !form.name.trim() || form.testIds.length === 0) return null;
    setSaveStatus('saving');
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        testIds: form.testIds,
      };
      const saved = draftId
        ? await collectionsService.update(client, draftId, payload)
        : await collectionsService.create(client, payload);
      setDraftId(saved.id);
      setSaveStatus('saved');
      await queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      return saved.id;
    } catch {
      setSaveStatus('error');
      return null;
    }
  }, [client, queryClient, draftId, form.type, form.name, form.testIds]);

  /**
   * Saves sections, attributes and status at step 4. Always requires a draftId
   * (saveDraft must have been called first). Returns the collection id or null on error.
   *
   * Attributes and status are saved independently of sections so that attribute
   * changes are never silently lost when the sections call fails (e.g. 409 from
   * archived/missing questions).
   */
  const saveDetails = useCallback(async (): Promise<string | null> => {
    const id = draftId;
    if (!id) return null;
    setSaveStatus('saving');

    const details = form.details ?? DEFAULT_COLLECTION_DETAILS;
    const scoreCorrect = details.uniformScores ? details.scoreCorrect : 1;
    const scoreWrong   = details.uniformScores ? details.scoreWrong   : 0;
    const scoreEmpty   = details.uniformScores ? details.scoreEmpty   : 0;

    const makeSectionPayload = (section: CollectionSection) => ({
      rules: {
        pausable: details.pausable,
        // Backend stores rules.duration in seconds; the form collects minutes.
        ...(form.type === 'SIMULATION' && details.durationMinutes > 0
          ? { duration: details.durationMinutes * 60 }
          : {}),
      },
      questions: section.questionIds.map((questionId) => ({
        questionId,
        points: { correctPoint: scoreCorrect, emptyPoint: scoreEmpty, wrongPoint: scoreWrong },
      })),
      maxAttempts: details.maxAttempts > 0 ? details.maxAttempts : undefined,
    });

    // 1. Save sections — failure is tracked but does not block the calls below.
    let sectionsOk = true;
    try {
      if (editId) {
        // Edit mode: atomically replace all sections so cross-section question moves
        // don't trigger the backend's per-section duplicate check mid-sequence.
        await collectionsService.replaceSections(
          client,
          id,
          form.sections.map(makeSectionPayload)
        );
      } else {
        // Create mode: collection starts empty, POST one section at a time.
        for (const section of form.sections) {
          if (section.questionIds.length === 0) continue;
          await collectionsService.addSection(client, id, makeSectionPayload(section));
        }
      }
    } catch {
      sectionsOk = false;
    }

    // 2. Save attributes and status regardless of whether sections succeeded.
    try {
      await collectionsService.updateAttributes(client, id, {
        attributes: form.attributeValues,
        enableCorrection: details.enableCorrection,
      });

      // Only call updateStatus when the status is actually changing.
      const targetStatus = details.status ?? 'DRAFT';
      const statusChanged = targetStatus !== (loadedStatus ?? 'DRAFT');
      if (statusChanged || (!editId && targetStatus === 'ACTIVE')) {
        await collectionsService.updateStatus(client, id, targetStatus);
      }
    } catch {
      setSaveStatus('error');
      return null;
    }

    if (!sectionsOk) {
      setSaveStatus('error');
      return null;
    }

    setSaveStatus('saved');
    await queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
    return id;
  }, [client, queryClient, draftId, editId, loadedStatus, form.sections, form.type, form.details, form.attributeValues]);

  return {
    form,
    updateForm,
    draftId,
    saveStatus,
    saveDraft,
    saveDetails,
    isLoading,
    loadError,
    isEditMode: !!editId,
  };
}
