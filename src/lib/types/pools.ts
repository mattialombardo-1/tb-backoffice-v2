import type { DifficultyLevel, QuestionLanguage, QuestionType } from '@/lib/types/questions';

export type PoolStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export const POOL_STATUS_LABELS: Record<PoolStatus, string> = {
  ACTIVE: 'Attivo',
  INACTIVE: 'Inattivo',
  DRAFT: 'Bozza',
};

export interface PoolSubjectCount {
  subjectId: string;
  subjectName: string;
  count: number;
}

export interface PoolScores {
  correct: number;
  wrong: number;
  empty: number;
}

export const DEFAULT_POOL_SCORES: PoolScores = { correct: 1, wrong: -0.25, empty: 0 };

export interface Pool {
  id: string;
  name: string;
  description?: string;
  status: PoolStatus;
  totalQuestions: number;
  questionCountBySubject: PoolSubjectCount[];
  scores?: PoolScores;
}

export interface PoolsFilters {
  search: string;
  statuses: PoolStatus[];
  minQuestions: number;
  maxQuestions: number;
  subjectIds: string[];
}

export interface PoolFilters {
  page: number;
}

export interface PoolsListState {
  data: Pool[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface PoolQuestion {
  id: string;
  questionId: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  subtopicId?: string;
  subtopicName?: string;
  difficulty: DifficultyLevel;
  type: QuestionType;
  language: QuestionLanguage;
  addedAt: string;
}

export interface PoolQuestionsFilters {
  search: string;
  subjectId: string;
  topicId: string;
  difficulty: string;
  type: string;
  language: string;
  page: number;
}

export interface PoolQuestionsState {
  data: PoolQuestion[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
