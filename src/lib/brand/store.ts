import { createContext, useContext } from 'react';

export interface Brand {
  _id: string;
  name: string;
  code?: string;
}

export interface BrandContextValue {
  brands: Brand[];
  selectedBrandId: string | null;
  setSelectedBrandId: (id: string | null) => void;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

export const BRAND_STORAGE_KEY = 'currentBrandId';

export const BrandContext = createContext<BrandContextValue | null>(null);

export function getSelectedBrandId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(BRAND_STORAGE_KEY);
}

export function useBrand(): BrandContextValue {
  const ctx = useContext(BrandContext);
  if (!ctx) throw new Error('useBrand must be used within a BrandProvider');
  return ctx;
}
