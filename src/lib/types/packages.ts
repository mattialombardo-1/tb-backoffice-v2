export interface Package {
  id: string;
  skuId: string;
  skuCode: string | null;
  skuName: string | null;
  name: string | null;
  active: boolean;
  isFree: boolean;
  timed: boolean;
  collectionIds: string[];
  poolIds: string[];
  expiresAt: string | null;
}

export type PackageSearchField = 'name' | 'id' | 'code';

export interface PackageFilters {
  page: number;
  searchField?: PackageSearchField;
  search?: string;
}

export interface PackagesListState {
  data: Package[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
