import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import type { HierarchyItem } from '@/lib/types/questions';

interface HierarchyLevel {
  items: HierarchyItem[];
  isLoading: boolean;
  error: string | null;
}

interface UseHierarchyMultiReturn {
  materie: HierarchyLevel;
  argomenti: HierarchyLevel;
  retryMaterie: () => void;
  retryArgomenti: () => void;
}

export function useHierarchyMulti(selection: {
  materiaIds: string[];
}): UseHierarchyMultiReturn {
  const client = useApiClient();

  const [materie, setMaterie] = useState<HierarchyLevel>({
    items: [],
    isLoading: true,
    error: null,
  });
  const [argomenti, setArgomenti] = useState<HierarchyLevel>({
    items: [],
    isLoading: false,
    error: null,
  });

  const [materieRefreshKey, setMaterieRefreshKey] = useState(0);
  const [argomentiRefreshKey, setArgomentiRefreshKey] = useState(0);
  const fetchIdRef = useRef({ materie: 0, argomenti: 0 });

  const materiaIdsKey = selection.materiaIds.join(',');

  useEffect(() => {
    const fetchId = ++fetchIdRef.current.materie;
    const controller = new AbortController();
    setMaterie({ items: [], isLoading: true, error: null });

    questionsService
      .getMaterie(client, controller.signal)
      .then((items) => {
        if (fetchId !== fetchIdRef.current.materie) return;
        setMaterie({ items, isLoading: false, error: null });
      })
      .catch((err) => {
        if (fetchId !== fetchIdRef.current.materie) return;
        if (err?.name === 'AbortError') return;
        setMaterie({
          items: [],
          isLoading: false,
          error: err?.message ?? 'Errore caricamento materie',
        });
      });

    return () => controller.abort();
  }, [client, materieRefreshKey]);

  useEffect(() => {
    const ids = materiaIdsKey ? materiaIdsKey.split(',') : [];
    if (ids.length === 0) {
      setArgomenti({ items: [], isLoading: false, error: null });
      return;
    }

    const fetchId = ++fetchIdRef.current.argomenti;
    setArgomenti({ items: [], isLoading: true, error: null });

    questionsService
      .getArgomentiForMany(client, ids)
      .then((items) => {
        if (fetchId !== fetchIdRef.current.argomenti) return;
        setArgomenti({ items, isLoading: false, error: null });
      })
      .catch((err) => {
        if (fetchId !== fetchIdRef.current.argomenti) return;
        setArgomenti({
          items: [],
          isLoading: false,
          error: err?.message ?? 'Errore caricamento argomenti',
        });
      });
  }, [client, materiaIdsKey, argomentiRefreshKey]);

  return {
    materie,
    argomenti,
    retryMaterie: useCallback(() => setMaterieRefreshKey((k) => k + 1), []),
    retryArgomenti: useCallback(() => setArgomentiRefreshKey((k) => k + 1), []),
  };
}
