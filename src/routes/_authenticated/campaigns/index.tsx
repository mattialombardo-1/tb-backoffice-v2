import { createFileRoute } from '@tanstack/react-router';
import { CampaignsPage } from '@/components/campaigns';

interface CampaignsSearch {
  page?: number;
  search?: string;
}

export const Route = createFileRoute('/_authenticated/campaigns/')({
  validateSearch: (raw: Record<string, unknown>): CampaignsSearch => ({
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
    search: typeof raw.search === 'string' && raw.search ? raw.search : undefined,
  }),
  component: CampaignsPage,
});
