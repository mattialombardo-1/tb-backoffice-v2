import { createFileRoute } from '@tanstack/react-router';
import { TestsPage } from '@/components/tests';

interface TestsSearch {
  search?: string;
  brandId?: string;
  year?: string;
  page?: number;
}

export const Route = createFileRoute('/_authenticated/tests')({
  validateSearch: (raw: Record<string, unknown>): TestsSearch => ({
    search: typeof raw.search === 'string' ? raw.search : undefined,
    brandId: typeof raw.brandId === 'string' ? raw.brandId : undefined,
    year: typeof raw.year === 'string' ? raw.year : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
  }),
  component: TestsPage,
});
