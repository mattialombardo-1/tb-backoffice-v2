import { createFileRoute } from '@tanstack/react-router';
import { PoolDetailPage } from '@/components/pools';

interface PoolDetailSearch {
  search?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  type?: string;
  language?: string;
  page?: number;
}

export const Route = createFileRoute('/_authenticated/pools/$poolId')({
  validateSearch: (raw: Record<string, unknown>): PoolDetailSearch => ({
    search: typeof raw.search === 'string' && raw.search ? raw.search : undefined,
    subjectId: typeof raw.subjectId === 'string' && raw.subjectId ? raw.subjectId : undefined,
    topicId: typeof raw.topicId === 'string' && raw.topicId ? raw.topicId : undefined,
    difficulty: typeof raw.difficulty === 'string' && raw.difficulty ? raw.difficulty : undefined,
    type: typeof raw.type === 'string' && raw.type ? raw.type : undefined,
    language: typeof raw.language === 'string' && raw.language ? raw.language : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
  }),
  component: PoolDetailPage,
});
