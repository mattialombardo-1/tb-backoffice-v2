export interface Tag {
  id: string;
  value: string;
  style?: { color?: string };
}

export type CollectionStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type CollectionType = 'SIMULATION' | 'EXERCISE';

export const COLLECTION_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Bozza',
  ACTIVE: 'Attiva',
  INACTIVE: 'Inattiva',
};

export const COLLECTION_TYPE_LABELS: Record<string, string> = {
  SIMULATION: 'Simulazione',
  EXERCISE: 'Esercitazione',
};

export interface CollectionTest {
  id: string;
  name: string;
  brandIds: string[];
}

export interface Collection {
  id: string;
  name: string;
  type: string;
  status: string;
  tests: CollectionTest[];
  questionCount: number;
  updatedAt: string;
  tags: Tag[];
}

export interface CollectionSection {
  id: string;
  name: string;
  questionIds: string[];
}

export interface CollectionDetails {
  durationMinutes: number;
  pausable: boolean;
  enableCorrection: boolean;
  validFrom: string;
  validTo: string;
  status: 'DRAFT' | 'ACTIVE';
  maxAttempts: number;
  uniformScores: boolean;
  scoreCorrect: number;
  scoreWrong: number;
  scoreEmpty: number;
}

export interface CollectionFilters {
  collectionId: string;
  search: string;
  statuses: string[];
  type: string;
  tests: string[];
  tags: string[];
  /** How selected tags are combined when filtering (OR = any, AND = all). */
  tagsMode: 'OR' | 'AND';
  page: number;
  archived: boolean;
}

export interface CollectionsListState {
  data: Collection[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
