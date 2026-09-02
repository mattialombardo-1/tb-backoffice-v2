import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useApiClient } from '@/lib/api/useApiClient';
import { BRAND_STORAGE_KEY, BrandContext, getSelectedBrandId, type Brand } from './store';

export function BrandProvider({ children }: { children: ReactNode }) {
  const client = useApiClient();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, _setSelectedBrandId] = useState<string | null>(getSelectedBrandId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const setSelectedBrandId = useCallback((id: string | null) => {
    if (id) window.localStorage.setItem(BRAND_STORAGE_KEY, id);
    else window.localStorage.removeItem(BRAND_STORAGE_KEY);
    _setSelectedBrandId(id);
  }, []);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await client.get<Brand[]>('/brands');
      setBrands(list);
      const stored = getSelectedBrandId();
      if (stored && !list.some((b) => b._id === stored)) {
        setSelectedBrandId(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [client, setSelectedBrandId]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return (
    <BrandContext.Provider
      value={{
        brands,
        selectedBrandId,
        setSelectedBrandId,
        loading,
        error,
        refresh: fetchBrands,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}
