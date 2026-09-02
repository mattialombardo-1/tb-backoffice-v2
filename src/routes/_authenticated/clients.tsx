import { createFileRoute } from '@tanstack/react-router';
import { ClientsPage } from '@/components/clients';

interface ClientsSearch {
  page?: number;
  search?: string;
}

export const Route = createFileRoute('/_authenticated/clients')({
  validateSearch: (raw: Record<string, unknown>): ClientsSearch => ({
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
    search: typeof raw.search === 'string' && raw.search ? raw.search : undefined,
  }),
  component: ClientsPage,
});
