export interface SkuBrand {
  id: string;
  name: string;
}

export interface Sku {
  id: string;
  code: string;
  name: string;
  url: string | null;
  brands: SkuBrand[];
}

export type SkuSearchField = 'name' | 'id' | 'code';

export interface SkuFilters {
  page: number;
  searchField?: SkuSearchField;
  search?: string;
}

export interface SkusListState {
  data: Sku[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}
