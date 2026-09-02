import { RotateCcw, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { MultiSelectWithMode } from '@/components/ui/multi-select-with-mode';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiClient } from '@/lib/api/useApiClient';
import { testsService } from '@/lib/services/tests';
import { useTags } from '@/lib/hooks/useTags';
import type { CollectionFilters } from '@/lib/types/collections';
import { COLLECTION_STATUS_LABELS, COLLECTION_TYPE_LABELS } from '@/lib/types/collections';

const STATUS_OPTIONS = Object.entries(COLLECTION_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const TYPE_OPTIONS = Object.entries(COLLECTION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface CollectionsListFiltersProps {
  filters: CollectionFilters;
  onFilterChange: (patch: Partial<CollectionFilters>) => void;
  onReset: () => void;
}

export function CollectionsListFilters({
  filters,
  onFilterChange,
  onReset,
}: CollectionsListFiltersProps) {
  const apiClient = useApiClient();

  const testsQuery = useQuery({
    queryKey: ['tests', 'options'],
    queryFn: ({ signal }) => testsService.list(apiClient, { page: 1, limit: 500 }, signal),
    staleTime: 5 * 60 * 1000,
  });

  const testOptions = (testsQuery.data?.tests ?? []).map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const { tags, isLoading: tagsLoading } = useTags();
  const tagOptions = tags.map((t) => ({ value: t.id, label: t.value }));

  const hasAnyFilter =
    !!filters.collectionId ||
    !!filters.search ||
    filters.statuses.length > 0 ||
    !!filters.type ||
    filters.tests.length > 0 ||
    filters.tags.length > 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cerca per ID…"
          value={filters.collectionId}
          onChange={(e) => onFilterChange({ collectionId: e.target.value })}
          className="pl-8 w-[200px] font-mono text-xs"
        />
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cerca per nome…"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-8 w-[220px]"
        />
      </div>

      <MultiSelect
        options={STATUS_OPTIONS}
        value={filters.statuses}
        onChange={(v) => onFilterChange({ statuses: v })}
        placeholder="Stato"
        className="w-[160px]"
      />

      <Select
        value={filters.type || '_all'}
        onValueChange={(v) => onFilterChange({ type: v === '_all' ? '' : v })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Tutti i tipi</SelectItem>
          {TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <MultiSelect
        options={testOptions}
        value={filters.tests}
        onChange={(v) => onFilterChange({ tests: v })}
        placeholder={testsQuery.isLoading ? 'Caricamento test…' : 'Test'}
        disabled={testsQuery.isLoading}
        className="w-[200px]"
      />

      <MultiSelectWithMode
        options={tagOptions}
        value={filters.tags}
        onChange={(v) => onFilterChange({ tags: v })}
        mode={filters.tagsMode}
        onModeChange={(m) => onFilterChange({ tagsMode: m })}
        placeholder={tagsLoading ? 'Caricamento tag…' : 'Tag'}
        disabled={tagsLoading}
        className="w-[200px]"
      />

      {hasAnyFilter && (
        <Button variant="ghost" size="sm" onClick={onReset} aria-label="Rimuovi tutti i filtri">
          <RotateCcw className="h-4 w-4 mr-1" />
          Rimuovi filtri
        </Button>
      )}
    </div>
  );
}
