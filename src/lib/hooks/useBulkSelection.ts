import { useCallback, useState } from 'react';

interface BulkSelectionState {
  isBulkMode: boolean;
  selectedIds: Set<string>;
  isAllSelected: boolean; // "select all filtered" mode
  allFilteredCount: number; // total matching the filter (across pages)
  selectedCount: number;
  toggleBulkMode: () => void;
  toggleItem: (id: string) => void;
  /** Replaces the whole selection with the given ids, preserving their order. */
  setSelection: (ids: string[]) => void;
  selectPage: (ids: string[]) => void;
  deselectPage: (ids: string[]) => void;
  selectAll: (totalCount: number) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  isPageFullySelected: (pageIds: string[]) => boolean;
}

export function useBulkSelection(): BulkSelectionState {
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [allFilteredCount, setAllFilteredCount] = useState(0);

  const toggleBulkMode = useCallback(() => {
    setIsBulkMode((prev) => {
      if (prev) {
        // Exiting bulk mode: clear all selections
        setSelectedIds(new Set());
        setIsAllSelected(false);
        setAllFilteredCount(0);
      }
      return !prev;
    });
  }, []);

  const toggleItem = useCallback(
    (id: string) => {
      // If in "select all" mode, switching to manual mode on deselect
      if (isAllSelected) {
        // Can't easily deselect from "all" mode without knowing all IDs,
        // so we just exit "all" mode and keep current page selections
        setIsAllSelected(false);
        setAllFilteredCount(0);
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [isAllSelected]
  );

  const setSelection = useCallback((ids: string[]) => {
    // A Set preserves insertion order, so `[...selectedIds]` later reflects
    // the ids' order here (e.g. the order of an imported CSV).
    setSelectedIds(new Set(ids));
    setIsAllSelected(false);
    setAllFilteredCount(0);
  }, []);

  const selectPage = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.add(id);
      return next;
    });
  }, []);

  const deselectPage = useCallback((ids: string[]) => {
    setIsAllSelected(false);
    setAllFilteredCount(0);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((totalCount: number) => {
    setIsAllSelected(true);
    setAllFilteredCount(totalCount);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setIsAllSelected(false);
    setAllFilteredCount(0);
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      if (isAllSelected) return true;
      return selectedIds.has(id);
    },
    [selectedIds, isAllSelected]
  );

  const isPageFullySelected = useCallback(
    (pageIds: string[]) => {
      if (isAllSelected) return true;
      if (pageIds.length === 0) return false;
      return pageIds.every((id) => selectedIds.has(id));
    },
    [selectedIds, isAllSelected]
  );

  const selectedCount = isAllSelected ? allFilteredCount : selectedIds.size;

  return {
    isBulkMode,
    selectedIds,
    isAllSelected,
    allFilteredCount,
    selectedCount,
    toggleBulkMode,
    toggleItem,
    setSelection,
    selectPage,
    deselectPage,
    selectAll,
    clearSelection,
    isSelected,
    isPageFullySelected,
  };
}
