import { createFileRoute } from '@tanstack/react-router';
import { MyReviewsPage } from '@/components/questions/MyReviewsPage';

interface MyReviewsSearch {
  materias?: string;
  argomenti?: string;
  statuses?: string;
  outcomes?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
}

export const Route = createFileRoute('/_authenticated/questions/to-review')({
  validateSearch: (raw: Record<string, unknown>): MyReviewsSearch => ({
    materias: typeof raw.materias === 'string' ? raw.materias : undefined,
    argomenti: typeof raw.argomenti === 'string' ? raw.argomenti : undefined,
    statuses: typeof raw.statuses === 'string' ? raw.statuses : undefined,
    outcomes: typeof raw.outcomes === 'string' ? raw.outcomes : undefined,
    dateFrom: typeof raw.dateFrom === 'string' ? raw.dateFrom : undefined,
    dateTo: typeof raw.dateTo === 'string' ? raw.dateTo : undefined,
    search: typeof raw.search === 'string' ? raw.search : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
  }),
  component: MyReviewsPage,
});
