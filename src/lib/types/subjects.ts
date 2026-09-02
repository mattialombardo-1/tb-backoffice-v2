export interface SubjectTopic {
  _id: string;
  name: string;
}

export interface Subject {
  _id: string;
  name: string;
  topics?: SubjectTopic[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubjectsResponse {
  data: Subject[];
  total: number;
  page: number;
  limit: number;
}

export interface SubjectFilters {
  search: string;
}
