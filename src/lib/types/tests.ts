export interface Test {
  id: string;
  name: string;
  year: number | null;
  brands: TestBrand[];
  syllabus: TestSyllabusItem[];
  defaultScores: TestDefaultScores;
  brandOrders?: Array<{ brandId: string; order: number }>;
}

export interface TestFilters {
  search: string;
  brandId: string;
  year: string;
  page: number;
}

export interface TestsListState {
  data: Test[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface TestBrand {
  id: string;
  name: string;
}

export interface TestSyllabusItem {
  baseSubject: string;
  baseTopic: string;
  baseSubtopic?: string;
  displaySubject: string;
  displayTopic: string;
  displaySubtopic?: string;
}

export interface TestDefaultScores {
  correct: number;
  empty: number;
  wrong: number;
}

export interface CreateTestPayload {
  name: string;
  year?: number;
  brands: TestBrand[];
  syllabus: TestSyllabusItem[];
  defaultScores: TestDefaultScores;
}

export interface UpdateTestPayload {
  name?: string;
  year?: number;
  brands?: TestBrand[];
  syllabus?: TestSyllabusItem[];
  defaultScores?: TestDefaultScores;
}
