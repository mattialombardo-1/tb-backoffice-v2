import { createFileRoute } from '@tanstack/react-router';
import { CollectionsListPage } from '@/components/collections';

type CollectionsTab = 'archived';

interface CollectionsListSearch {
  tab?: CollectionsTab;
  collectionId?: string;
  search?: string;
  statuses?: string;
  type?: string;
  tests?: string;
  tags?: string;
  tagsMode?: 'OR' | 'AND';
  page?: number;
}

export const Route = createFileRoute('/_authenticated/collections/')({
  validateSearch: (raw: Record<string, unknown>): CollectionsListSearch => ({
    tab: raw.tab === 'archived' ? 'archived' : undefined,
    collectionId: typeof raw.collectionId === 'string' ? raw.collectionId : undefined,
    search: typeof raw.search === 'string' ? raw.search : undefined,
    statuses: typeof raw.statuses === 'string' ? raw.statuses : undefined,
    type: typeof raw.type === 'string' ? raw.type : undefined,
    tests: typeof raw.tests === 'string' ? raw.tests : undefined,
    tags: typeof raw.tags === 'string' ? raw.tags : undefined,
    tagsMode: raw.tagsMode === 'AND' ? 'AND' : raw.tagsMode === 'OR' ? 'OR' : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
  }),
  component: CollectionsListPage,
});
