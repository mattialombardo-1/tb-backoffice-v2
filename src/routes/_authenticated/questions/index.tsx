import { createFileRoute } from '@tanstack/react-router';
import { QuestionsListPage } from '@/components/questions';

interface QuestionsListSearch {
  materias?: string;
  argomenti?: string;
  difficulties?: string;
  languages?: string;
  statuses?: string;
  types?: string;
  authors?: string;
  tags?: string;
  collectionIds?: string;
  collectionIdsMode?: 'exclude';
  poolIds?: string;
  poolIdsMode?: 'exclude';
  dateFrom?: string;
  dateTo?: string;
  unpublished?: boolean;
  page?: number;
  search?: string;
}

export const Route = createFileRoute('/_authenticated/questions/')({
  validateSearch: (raw: Record<string, unknown>): QuestionsListSearch => ({
    materias: typeof raw.materias === 'string' ? raw.materias : undefined,
    argomenti: typeof raw.argomenti === 'string' ? raw.argomenti : undefined,
    difficulties: typeof raw.difficulties === 'string' ? raw.difficulties : undefined,
    languages: typeof raw.languages === 'string' ? raw.languages : undefined,
    statuses: typeof raw.statuses === 'string' ? raw.statuses : undefined,
    types: typeof raw.types === 'string' ? raw.types : undefined,
    authors: typeof raw.authors === 'string' ? raw.authors : undefined,
    tags: typeof raw.tags === 'string' ? raw.tags : undefined,
    collectionIds: typeof raw.collectionIds === 'string' ? raw.collectionIds : undefined,
    collectionIdsMode: raw.collectionIdsMode === 'exclude' ? 'exclude' : undefined,
    poolIds: typeof raw.poolIds === 'string' ? raw.poolIds : undefined,
    poolIdsMode: raw.poolIdsMode === 'exclude' ? 'exclude' : undefined,
    dateFrom: typeof raw.dateFrom === 'string' ? raw.dateFrom : undefined,
    dateTo: typeof raw.dateTo === 'string' ? raw.dateTo : undefined,
    unpublished: raw.unpublished === true || raw.unpublished === 'true' ? true : undefined,
    search: typeof raw.search === 'string' ? raw.search : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
  }),
  component: QuestionsListPage,
});
