import { createFileRoute } from '@tanstack/react-router';
import { PoolsPage } from '@/components/pools';

interface PoolsSearch {
  page?: number;
  search?: string;
  statuses?: string;
  minQuestions?: number;
  maxQuestions?: number;
  subjectIds?: string;
}

export const Route = createFileRoute('/_authenticated/pools/')({
  validateSearch: (raw: Record<string, unknown>): PoolsSearch => ({
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
    search: typeof raw.search === 'string' && raw.search ? raw.search : undefined,
    statuses: typeof raw.statuses === 'string' && raw.statuses ? raw.statuses : undefined,
    minQuestions:
      typeof raw.minQuestions === 'number'
        ? raw.minQuestions
        : typeof raw.minQuestions === 'string'
          ? parseInt(raw.minQuestions, 10) || undefined
          : undefined,
    maxQuestions:
      typeof raw.maxQuestions === 'number'
        ? raw.maxQuestions
        : typeof raw.maxQuestions === 'string'
          ? parseInt(raw.maxQuestions, 10) || undefined
          : undefined,
    subjectIds: typeof raw.subjectIds === 'string' && raw.subjectIds ? raw.subjectIds : undefined,
  }),
  component: PoolsPage,
});
