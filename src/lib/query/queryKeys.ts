import type { ClientFilters } from '@/lib/types/clients';
import type { StaffFilters } from '@/lib/types/staff';
import type { QuestionsListFilters } from '@/lib/types/questions';
import type { TestFilters } from '@/lib/types/tests';
import type { SubjectFilters } from '@/lib/types/subjects';
import type { PackageFilters } from '@/lib/types/packages';
import type { SkuFilters } from '@/lib/types/skus';
import type { PoolQuestionsFilters } from '@/lib/types/pools';
import type { CollectionFilters } from '@/lib/types/collections';

export const queryKeys = {
  communityRoles: {
    all: ['communityRoles'] as const,
  },
  clients: {
    all: ['clients'] as const,
    list: (filters: ClientFilters) => ['clients', 'list', filters] as const,
    orders: (clientId: string) => ['clients', clientId, 'orders'] as const,
  },
  staff: {
    all: ['staff'] as const,
    list: (filters: StaffFilters) => ['staff', 'list', filters] as const,
    reviewers: ['staff', 'reviewers'] as const,
  },
  tests: {
    all: ['tests'] as const,
    list: (filters: TestFilters) => ['tests', 'list', filters] as const,
    years: ['tests', 'years'] as const,
  },
  questions: {
    all: ['questions'] as const,
    list: (filters: QuestionsListFilters) => ['questions', 'list', filters] as const,
    materie: ['questions', 'materie'] as const,
    argomenti: (materiaId: string) => ['questions', 'argomenti', materiaId] as const,
    sottoArgomenti: (materiaId: string, argomentoId: string) =>
      ['questions', 'sottoArgomenti', materiaId, argomentoId] as const,
    myReviews: ['questions', 'my-reviews'] as const,
    associations: (questionId: string) => ['questions', questionId, 'associations'] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    list: (_filters?: SubjectFilters) => ['subjects', 'list'] as const,
  },
  packages: {
    all: ['packages'] as const,
    list: (filters: PackageFilters) => ['packages', 'list', filters] as const,
  },
  skus: {
    all: ['skus'] as const,
    list: (filters: SkuFilters) => ['skus', 'list', filters] as const,
  },
  authors: {
    all: ['authors'] as const,
  },
  pools: {
    all: ['pools'] as const,
    list: () => ['pools', 'list'] as const,
    detail: (poolId: string) => ['pools', poolId] as const,
    questions: (poolId: string, filters: PoolQuestionsFilters) =>
      ['pools', poolId, 'questions', filters] as const,
    forFilter: ['pools', 'for-filter-all'] as const,
  },
  campaigns: {
    all: ['campaigns'] as const,
    list: (page: number, search?: string) => ['campaigns', 'list', page, search] as const,
    detail: (campaignId: string) => ['campaigns', campaignId] as const,
    mySlots: ['campaigns', 'my-slots'] as const,
  },
  collections: {
    all: ['collections'] as const,
    list: (filters: CollectionFilters) => ['collections', 'list', filters] as const,
    forFilter: ['collections', 'for-filter-all'] as const,
    sections: (collectionId: string) => ['collections', collectionId, 'sections'] as const,
  },
  tags: {
    all: ['tags'] as const,
    byResource: (resource: string) => ['tags', resource] as const,
  },
  attributes: {
    all: ['attributes'] as const,
    byResource: (resource: string) => ['attributes', resource] as const,
  },
};
