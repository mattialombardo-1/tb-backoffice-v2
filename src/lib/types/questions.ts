export type QuestionType = 'MULTIPLE_CHOICE' | 'COMPLETION';

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Risposta chiusa',
  COMPLETION: 'Completamento',
};

export type DifficultyLevel =
  | 'facile'
  | 'medio_facile'
  | 'medio'
  | 'medio_difficile'
  | 'difficile'
  | 'non_ancora_valutata';

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  facile: 'Facile',
  medio_facile: 'Medio-facile',
  medio: 'Medio',
  medio_difficile: 'Medio-difficile',
  difficile: 'Difficile',
  non_ancora_valutata: 'Non ancora valutata',
};

export type QuestionStatus = 'DRAFT' | 'ACTIVE' | 'TO_REVIEW' | 'INACTIVE';

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  DRAFT: 'Bozza',
  ACTIVE: 'Attiva',
  TO_REVIEW: 'Da revisionare',
  INACTIVE: 'Inattiva',
};

export type QuestionLanguage = 'IT-it' | 'EN-en';

export const LANGUAGE_LABELS: Record<QuestionLanguage, string> = {
  'IT-it': 'Italiano',
  'EN-en': 'Inglese',
};

export type AlternativeStyle = 'numeric' | 'alpha';

export const ALTERNATIVE_STYLE_LABELS: Record<AlternativeStyle, string> = {
  numeric: 'Numerico',
  alpha: 'Letterale',
};

export interface HierarchyItem {
  id: string;
  name: string;
}

export interface HierarchySelection {
  subjectId: string | null;
  subjectName: string | null;
  topicId: string | null;
  topicName: string | null;
  sottoArgomentoId: string | null;
}

export interface Alternative {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
  image?: string;
  /** Presigned GET URL for display only — not sent to the backend. */
  imageViewUrl?: string;
}

export interface Question {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  sottoArgomentoId: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  explanationText: string;
  alternatives: Alternative[];
  completionAnswer: string;
  questionImages: string[];
  explanationImages: string[];
  status: QuestionStatus;
  reviewerId: string | null;
  reviewerEmail: string | null;
  language: QuestionLanguage;
  authorEmail?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionPayload {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  sottoArgomentoId: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  questionText: string;
  explanationText?: string;
  alternatives: Alternative[];
  completionAnswer: string;
  questionImages?: string[];
  explanationImages?: string[];
  language?: QuestionLanguage;
}

export interface UpdateQuestionPayload extends Partial<CreateQuestionPayload> {
  id: string;
}

export interface QuestionFormState {
  isDirty: boolean;
  isReadOnly: boolean;
  lastSavedAt: string | null;
  autosaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  validationErrors: Record<string, string>;
}

// --- Associations ---

export interface QuestionAssociation {
  id: string;
  name: string;
}

export interface QuestionAssociations {
  collections: QuestionAssociation[];
  pools: QuestionAssociation[];
}

// --- List page types ---

export const ALL_QUESTION_STATUSES: QuestionStatus[] = ['DRAFT', 'ACTIVE', 'TO_REVIEW', 'INACTIVE'];

export interface QuestionListItem extends Question {
  materiaName: string;
  argomentoName: string;
  sottoArgomentoName: string;
}

export interface QuestionsListFilters {
  materias: string[];
  argomenti: string[];
  difficulties: DifficultyLevel[];
  languages: QuestionLanguage[];
  statuses: QuestionStatus[];
  types: QuestionType[];
  authors: string[];
  tags: string[];
  collectionIds: string[];
  collectionIdsMode: 'include' | 'exclude';
  poolIds: string[];
  poolIdsMode: 'include' | 'exclude';
  dateFrom: string;
  dateTo: string;
  unpublished: boolean;
  page: number;
  search?: string;
}

// Stato del filtro "Stato" in "Domande da revisionare" — non un vero QuestionStatus di
// backend: myReviews() restituisce solo domande TO_REVIEW, quindi non c'è mai un DRAFT/ACTIVE/
// INACTIVE da filtrare qui. REVIEWED è uno stato derivato lato client (vedi
// ReviewBatchQuestion.reviewedInSession in useReviewBatches): una domanda approvata o
// rigettata in questa sessione, non più TO_REVIEW sul server ma ancora tenuta in vista.
export type MyReviewStatus = 'TO_REVIEW' | 'REVIEWED';

export const MY_REVIEW_STATUS_LABELS: Record<MyReviewStatus, string> = {
  TO_REVIEW: 'Da revisionare',
  REVIEWED: 'Già revisionate',
};

// Esito della generazione asincrona del batch (brief: "in corso con avanzamento, completata,
// parziale o in errore"). Non esiste ancora un job di generazione da interrogare — né sul
// backend né nel mock — quindi oggi è un campo mockato lato client (vedi
// mockOutcomeForBatch in useReviewBatches), solo per popolare il filtro nella demo. Quando
// il backend esporrà lo stato reale del job, questo mock va sostituito con quel dato.
export type BatchOutcome = 'IN_PROGRESS' | 'COMPLETED' | 'PARTIAL' | 'ERROR';

export const BATCH_OUTCOME_LABELS: Record<BatchOutcome, string> = {
  IN_PROGRESS: 'In corso',
  COMPLETED: 'Completata',
  PARTIAL: 'Parziale',
  ERROR: 'In errore',
};

// Sottoinsieme dei filtri di QuestionsListFilters usato in "Domande da revisionare" —
// stessi campi/nomi per coerenza, ma applicati client-side (myReviews() non ha parametri di
// filtro: vedi useReviewBatches) invece che come query al backend.
export interface MyReviewsFilters {
  materias: string[];
  argomenti: string[];
  statuses: MyReviewStatus[];
  outcomes: BatchOutcome[];
  dateFrom: string;
  dateTo: string;
  search: string;
}

export interface QuestionsSearchQuery {
  statuses?: QuestionStatus[];
  subjectIds?: string[];
  topicIds?: string[];
  difficulties?: DifficultyLevel[];
  languages?: QuestionLanguage[];
  types?: QuestionType[];
  authors?: string[];
  tags?: string[];
  collectionIds?: string[];
  collectionIdsMode?: 'include' | 'exclude';
  poolIds?: string[];
  poolIdsMode?: 'include' | 'exclude';
  dateFrom?: string;
  dateTo?: string;
  unpublished?: boolean;
  search?: string;
  page: number;
  perPage: number;
}

export interface QuestionsListResponse {
  total: number;
  questions: QuestionListItem[];
}

export interface QuestionsListState {
  data: QuestionListItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  deleteQuestion: (id: string) => Promise<void>;
}

/** Maps UI filter state to the backend query shape shared by list/select-all/export. */
export function toQuestionsFilterQuery(
  filters: Omit<QuestionsListFilters, 'page'>
): Omit<QuestionsSearchQuery, 'page' | 'perPage'> {
  return {
    statuses: filters.statuses.length > 0 ? filters.statuses : undefined,
    subjectIds: filters.materias.length > 0 ? filters.materias : undefined,
    topicIds: filters.argomenti.length > 0 ? filters.argomenti : undefined,
    difficulties: filters.difficulties.length > 0 ? filters.difficulties : undefined,
    languages: filters.languages.length > 0 ? filters.languages : undefined,
    types: filters.types.length > 0 ? filters.types : undefined,
    authors: filters.authors.length > 0 ? filters.authors : undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    collectionIds:
      filters.unpublished || filters.collectionIds.length === 0 ? undefined : filters.collectionIds,
    collectionIdsMode: filters.collectionIds.length > 0 ? filters.collectionIdsMode : undefined,
    poolIds: filters.unpublished || filters.poolIds.length === 0 ? undefined : filters.poolIds,
    poolIdsMode: filters.poolIds.length > 0 ? filters.poolIdsMode : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    unpublished: filters.unpublished || undefined,
    search: filters.search || undefined,
  };
}
