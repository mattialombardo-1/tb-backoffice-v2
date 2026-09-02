import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { type QuestionImageEntry } from '@/lib/services/questionImages';
import { resolveViewUrls, toAbsoluteImageUrl } from '@/lib/export/resolveImageUrls';
import type {
  Alternative,
  AlternativeStyle,
  CreateQuestionPayload,
  DifficultyLevel,
  HierarchySelection,
  Question,
  QuestionType,
} from '@/lib/types/questions';

interface UseQuestionFormReturn {
  // Data
  questionId: string | null;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  explanationText: string;
  alternatives: Alternative[];
  completionAnswer: string;
  questionImageEntries: QuestionImageEntry[];
  explanationImageEntries: QuestionImageEntry[];
  status: Question['status'];
  reviewerId: string | null;
  loadedSubjectId: string | null;
  loadedSubjectName: string | null;
  loadedTopicId: string | null;
  loadedTopicName: string | null;
  alternativeStyle: AlternativeStyle;

  // Setters
  setType: (type: QuestionType) => void;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  setQuestionText: (text: string) => void;
  setExplanationText: (text: string) => void;
  setAlternatives: (alternatives: Alternative[]) => void;
  setCompletionAnswer: (answer: string) => void;
  setAlternativeStyle: (style: AlternativeStyle) => void;
  addQuestionImage: (entry: QuestionImageEntry) => void;
  removeQuestionImage: (index: number) => void;
  addExplanationImage: (entry: QuestionImageEntry) => void;
  removeExplanationImage: (index: number) => void;

  // State
  isDirty: boolean;
  isReadOnly: boolean;
  setIsReadOnly: (value: boolean) => void;
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  validationErrors: Record<string, string>;
  isLoadingQuestion: boolean;
  loadError: string | null;

  // Actions
  updateHierarchyRef: (h: HierarchySelection) => void;
  saveDraft: (hierarchy: HierarchySelection) => Promise<string | null>;
  /** Saves draft, submits to reviewer, and returns the saved question ID. */
  submitToReviewer: (hierarchy: HierarchySelection, reviewerId: string) => Promise<string>;
}


interface UseQuestionFormOptions {
  editQuestionId?: string;
  initialDifficulty?: DifficultyLevel;
  initialType?: QuestionType;
  initialReadOnly?: boolean;
}

export function useQuestionForm(
  editQuestionIdOrOptions?: string | UseQuestionFormOptions
): UseQuestionFormReturn {
  const client = useApiClient();

  // Normalise argument — supports both legacy `useQuestionForm(id)` and new options object
  const options: UseQuestionFormOptions =
    typeof editQuestionIdOrOptions === 'string'
      ? { editQuestionId: editQuestionIdOrOptions }
      : (editQuestionIdOrOptions ?? {});
  const editQuestionId = options.editQuestionId;

  // Question data
  const [questionId, setQuestionId] = useState<string | null>(editQuestionId ?? null);
  const [type, setType] = useState<QuestionType>(options.initialType ?? 'MULTIPLE_CHOICE');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(options.initialDifficulty ?? 'non_ancora_valutata');
  const [questionText, setQuestionText] = useState('');
  const [explanationText, setExplanationText] = useState('');
  const [alternatives, setAlternatives] = useState<Alternative[]>([
    { id: crypto.randomUUID(), text: '', isCorrect: false, order: 0 },
    { id: crypto.randomUUID(), text: '', isCorrect: false, order: 1 },
  ]);
  const [completionAnswer, setCompletionAnswer] = useState('');
  const [questionImageEntries, setQuestionImageEntries] = useState<QuestionImageEntry[]>([]);
  const [explanationImageEntries, setExplanationImageEntries] = useState<QuestionImageEntry[]>([]);
  const [loadedSubjectId, setLoadedSubjectId] = useState<string | null>(null);
  const [loadedSubjectName, setLoadedSubjectName] = useState<string | null>(null);
  const [loadedTopicId, setLoadedTopicId] = useState<string | null>(null);
  const [loadedTopicName, setLoadedTopicName] = useState<string | null>(null);
  const [alternativeStyle, setAlternativeStyle] = useState<AlternativeStyle>('alpha');
  const [status, setStatus] = useState<Question['status']>('ACTIVE');
  const [reviewerId, setReviewerId] = useState<string | null>(null);

  // Form state
  const [isDirty, setIsDirty] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(options.initialReadOnly ?? false);
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle'
  );
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(!!editQuestionId);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Hierarchy state for reactive validation + ref for autosave timer access
  const emptyHierarchy: HierarchySelection = {
    subjectId: null,
    subjectName: null,
    topicId: null,
    topicName: null,
    sottoArgomentoId: null,
  };
  const [hierarchyState, setHierarchyState] = useState<HierarchySelection>(emptyHierarchy);
  const hierarchyRef = useRef<HierarchySelection>(emptyHierarchy);
  // Ref always in sync with questionId state — used inside saveDraft to avoid
  // stale closures that cause duplicate creates when autosave and submit race.
  const questionIdRef = useRef<string | null>(editQuestionId ?? null);
  // Holds the in-flight create() promise so a concurrent saveDraft call can
  // await it and then do an update instead of starting a second create.
  const createPromiseRef = useRef<Promise<string | null> | null>(null);

  // Keep ref in sync whenever state updates (e.g. after load effect sets questionId)
  useEffect(() => {
    questionIdRef.current = questionId;
  }, [questionId]);

  // Load existing question for edit mode
  useEffect(() => {
    if (!editQuestionId) return;

    const controller = new AbortController();
    setIsLoadingQuestion(true);

    questionsService
      .get(client, editQuestionId, controller.signal)
      .then(async (q) => {
        if (controller.signal.aborted) return;

        const qStorageUrls = q.questionImages ?? [];
        const exStorageUrls = q.explanationImages ?? [];
        const altStorageUrls = q.alternatives
          .map((a) => a.image)
          .filter((img): img is string => !!img);

        // Resolve display URLs: presigns images in the `immaginidomande` bucket,
        // leaves other-bucket/absolute URLs untouched. The original storageUrl is
        // preserved below for saving back.
        let qViewUrls: string[] = [];
        let exViewUrls: string[] = [];
        let altViewUrls: string[] = [];

        try {
          [qViewUrls, exViewUrls, altViewUrls] = await Promise.all([
            resolveViewUrls(client, qStorageUrls, controller.signal),
            resolveViewUrls(client, exStorageUrls, controller.signal),
            resolveViewUrls(client, altStorageUrls, controller.signal),
          ]);
        } catch (e) {
          if ((e as Error)?.name === 'AbortError') return;
          // Graceful fallback — form still loads, thumbnails may be broken
          qViewUrls = qStorageUrls.map(toAbsoluteImageUrl);
          exViewUrls = exStorageUrls.map(toAbsoluteImageUrl);
          altViewUrls = altStorageUrls.map(toAbsoluteImageUrl);
        }

        if (controller.signal.aborted) return;

        const entries: QuestionImageEntry[] = qStorageUrls.map((storageUrl, i) => ({
          storageUrl,
          viewUrl: qViewUrls[i] ?? toAbsoluteImageUrl(storageUrl),
        }));

        const exEntries: QuestionImageEntry[] = exStorageUrls.map((storageUrl, i) => ({
          storageUrl,
          viewUrl: exViewUrls[i] ?? toAbsoluteImageUrl(storageUrl),
        }));

        let altViewUrlIdx = 0;
        const altsWithViewUrls: Alternative[] = q.alternatives.map((a) => {
          if (!a.image) return a;
          const idx = altViewUrlIdx++;
          return { ...a, imageViewUrl: altViewUrls[idx] ?? toAbsoluteImageUrl(a.image) };
        });

        setLoadedSubjectId(q.subjectId);
        setLoadedSubjectName(q.subjectName);
        setLoadedTopicId(q.topicId);
        setLoadedTopicName(q.topicName);
        setQuestionId(q.id);
        setType(q.type);
        setDifficulty(q.difficulty);
        setQuestionText(q.questionText);
        setExplanationText(q.explanationText ?? '');
        setAlternatives(altsWithViewUrls);
        setCompletionAnswer(q.completionAnswer);
        setQuestionImageEntries(entries);
        setExplanationImageEntries(exEntries);
        setStatus(q.status);
        setReviewerId(q.reviewerId);
        setIsLoadingQuestion(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setLoadError(err?.message ?? 'Errore caricamento domanda');
        setIsLoadingQuestion(false);
      });

    return () => controller.abort();
  }, [client, editQuestionId]);

  // Compute validation errors (for submit — full validation)
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!hierarchyState.subjectId) errors.materia = 'Seleziona una materia';
    if (!hierarchyState.topicId) errors.argomento = 'Seleziona un argomento';
    // sotto-argomento is optional — backend accepts subjects with topic-only granularity.
    if (difficulty === 'non_ancora_valutata') errors.difficulty = 'Seleziona la difficoltà';
    if (!questionText.trim() && questionImageEntries.length === 0)
      errors.questionText = 'Inserisci il testo della domanda o aggiungi almeno un\'immagine';
    if (type === 'MULTIPLE_CHOICE' && !alternatives.some((a) => a.isCorrect))
      errors.alternatives = 'Seleziona almeno una risposta corretta';
    if (type === 'MULTIPLE_CHOICE' && alternatives.filter((a) => a.text.trim() || a.image).length < 2)
      errors.alternativesText = 'Almeno 2 alternative devono avere del testo o un\'immagine';
    if (type === 'COMPLETION' && !completionAnswer.trim())
      errors.completionAnswer = 'Inserisci la risposta corretta';
    return errors;
  }, [hierarchyState, difficulty, questionText, alternatives, completionAnswer, type]);

  // Mark dirty on any field change
  const wrapSetter =
    <T>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (value: T | ((prev: T) => T)) => {
      setter(value);
      setIsDirty(true);
    };

  const addQuestionImage = useCallback((entry: QuestionImageEntry) => {
    setQuestionImageEntries((prev) => [...prev, entry]);
    setIsDirty(true);
  }, []);

  const removeQuestionImage = useCallback((index: number) => {
    setQuestionImageEntries((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  }, []);

  const addExplanationImage = useCallback((entry: QuestionImageEntry) => {
    setExplanationImageEntries((prev) => [...prev, entry]);
    setIsDirty(true);
  }, []);

  const removeExplanationImage = useCallback((index: number) => {
    setExplanationImageEntries((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  }, []);

  // Build payload
  const buildPayload = (hierarchy: HierarchySelection): CreateQuestionPayload => ({
    subjectId: hierarchy.subjectId!,
    subjectName: hierarchy.subjectName ?? '',
    topicId: hierarchy.topicId ?? '',
    topicName: hierarchy.topicName ?? '',
    sottoArgomentoId: hierarchy.sottoArgomentoId ?? '',
    type,
    difficulty,
    questionText,
    explanationText,
    alternatives,
    completionAnswer,
    questionImages: questionImageEntries.map((e) => e.storageUrl),
    explanationImages: explanationImageEntries.map((e) => e.storageUrl),
    language: 'IT-it',
  });

  // Save draft — only requires materiaId. Returns saved question ID.
  // Uses questionIdRef to avoid stale-closure reads of questionId state.
  // Uses createPromiseRef so that if two calls race on a null ID, the second
  // awaits the first create() and then does an update — preventing duplicates.
  const saveDraft = useCallback(
    async (hierarchy: HierarchySelection): Promise<string | null> => {
      if (!hierarchy.subjectId || !hierarchy.topicId) return null;
      setAutosaveStatus('saving');
      try {
        const payload = buildPayload(hierarchy);
        let savedId: string;

        if (questionIdRef.current) {
          await questionsService.update(client, questionIdRef.current, payload);
          savedId = questionIdRef.current;
        } else if (createPromiseRef.current) {
          // A create is already in flight — wait for it, then update with our payload
          const createdId = await createPromiseRef.current;
          if (!createdId) {
            setAutosaveStatus('error');
            return null;
          }
          await questionsService.update(client, createdId, payload);
          savedId = createdId;
        } else {
          // First create — expose promise so concurrent calls can await instead of racing
          let resolveCreate!: (id: string | null) => void;
          createPromiseRef.current = new Promise<string | null>((resolve) => {
            resolveCreate = resolve;
          });
          try {
            const created = await questionsService.create(client, payload);
            questionIdRef.current = created.id;
            setQuestionId(created.id);
            savedId = created.id;
            resolveCreate(created.id);
          } catch (err) {
            resolveCreate(null);
            throw err;
          } finally {
            createPromiseRef.current = null;
          }
        }

        setIsDirty(false);
        setLastSavedAt(new Date().toISOString());
        setAutosaveStatus('saved');
        return savedId;
      } catch {
        setAutosaveStatus('error');
        return null;
      }
    },
    // questionId intentionally omitted — read via questionIdRef to avoid stale closure
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, type, difficulty, questionText, explanationText, alternatives, completionAnswer, questionImageEntries, explanationImageEntries]
  );

  // Submit to reviewer — returns the saved question ID
  const submitToReviewer = useCallback(
    async (hierarchy: HierarchySelection, reviewerId: string): Promise<string> => {
      // Save first, then use the returned ID (avoids stale closure over questionId)
      const savedId = await saveDraft(hierarchy);
      if (!savedId) throw new Error('Salva prima la domanda');

      await questionsService.submit(client, savedId, reviewerId);
      setStatus('TO_REVIEW' as const);
      setIsReadOnly(true);
      return savedId;
    },
    [client, saveDraft]
  );

  // Expose a way for the parent to update hierarchy ref (used by saveDraft + validation)
  const updateHierarchyRef = useCallback((h: HierarchySelection) => {
    hierarchyRef.current = h;
    setHierarchyState(h);
  }, []);

  return {
    questionId,
    type,
    difficulty,
    questionText,
    explanationText,
    alternatives,
    completionAnswer,
    questionImageEntries,
    explanationImageEntries,
    status,
    reviewerId,
    loadedSubjectId,
    loadedSubjectName,
    loadedTopicId,
    loadedTopicName,
    alternativeStyle,

    setType: wrapSetter(setType),
    setDifficulty: wrapSetter(setDifficulty),
    setQuestionText: wrapSetter(setQuestionText),
    setExplanationText: wrapSetter(setExplanationText),
    setAlternatives: wrapSetter(setAlternatives),
    setCompletionAnswer: wrapSetter(setCompletionAnswer),
    setAlternativeStyle,
    addQuestionImage,
    removeQuestionImage,
    addExplanationImage,
    removeExplanationImage,

    isDirty,
    isReadOnly,
    setIsReadOnly,
    autosaveStatus,
    lastSavedAt,
    validationErrors,
    isLoadingQuestion,
    loadError,

    updateHierarchyRef,
    saveDraft: async (hierarchy: HierarchySelection) => {
      updateHierarchyRef(hierarchy);
      return saveDraft(hierarchy);
    },
    submitToReviewer: async (hierarchy: HierarchySelection, reviewerId: string): Promise<string> => {
      updateHierarchyRef(hierarchy);
      return submitToReviewer(hierarchy, reviewerId);
    },
  };
}
