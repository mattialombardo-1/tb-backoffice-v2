import { createFileRoute } from '@tanstack/react-router';
import { PackagesPage } from '@/components/packages';

type TabValue = 'packages' | 'skus';
type SearchField = 'name' | 'id' | 'code';

interface PackagesSearch {
  tab?: TabValue;
  page?: number;
  searchField?: SearchField;
  search?: string;
}

export const Route = createFileRoute('/_authenticated/packages')({
  validateSearch: (raw: Record<string, unknown>): PackagesSearch => ({
    tab: raw.tab === 'skus' ? 'skus' : raw.tab === 'packages' ? 'packages' : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
    searchField:
      raw.searchField === 'id' ? 'id' : raw.searchField === 'code' ? 'code' : undefined,
    search: typeof raw.search === 'string' && raw.search ? raw.search : undefined,
  }),
  component: PackagesPage,
});
