import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Slider } from '@/components/ui/slider';
import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { queryKeys } from '@/lib/query';
import type { Pool, PoolsFilters as FiltersType, PoolStatus } from '@/lib/types/pools';
import { POOL_STATUS_LABELS } from '@/lib/types/pools';

const STATUS_OPTIONS: { value: PoolStatus; label: string }[] = [
  { value: 'ACTIVE', label: POOL_STATUS_LABELS.ACTIVE },
  { value: 'INACTIVE', label: POOL_STATUS_LABELS.INACTIVE },
  { value: 'DRAFT', label: POOL_STATUS_LABELS.DRAFT },
];

interface PoolsFiltersProps {
  filters: FiltersType;
  allPools: Pool[];
  onFilterChange: (patch: Partial<FiltersType>) => void;
  onReset: () => void;
}

export function PoolsFilters({ filters, allPools, onFilterChange, onReset }: PoolsFiltersProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  const materieQuery = useQuery({
    queryKey: queryKeys.questions.materie,
    queryFn: ({ signal }) => questionsService.getMaterie(client, signal),
    staleTime: 5 * 60_000,
  });

  const sliderMax = useMemo(() => {
    if (allPools.length === 0) return 1000;
    return Math.max(...allPools.map((p) => p.totalQuestions), 1);
  }, [allPools]);

  const sliderValue: [number, number] = [
    filters.minQuestions,
    filters.maxQuestions > 0 ? filters.maxQuestions : sliderMax,
  ];

  const handleSliderChange = (values: number[]) => {
    onFilterChange({ minQuestions: values[0], maxQuestions: values[1] });
  };

  const hasAnyFilter =
    !!filters.search ||
    filters.statuses.length > 0 ||
    filters.minQuestions > 0 ||
    (filters.maxQuestions > 0 && filters.maxQuestions < sliderMax) ||
    filters.subjectIds.length > 0;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('pools.filters.search')}
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-8 h-9 w-[220px] text-sm"
        />
      </div>

      <MultiSelect
        options={STATUS_OPTIONS}
        value={filters.statuses}
        onChange={(v) => onFilterChange({ statuses: v as PoolStatus[] })}
        placeholder={t('pools.filters.status')}
        className="w-[160px]"
      />

      <MultiSelect
        options={(materieQuery.data ?? []).map((m) => ({ value: m.id, label: m.name }))}
        value={filters.subjectIds}
        onChange={(v) => onFilterChange({ subjectIds: v })}
        placeholder={materieQuery.isLoading ? t('pools.loading') : t('pools.filters.subject')}
        disabled={materieQuery.isLoading}
        className="w-[180px]"
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">{t('pools.filters.questions')}</span>
        <div className="w-[160px]">
          <Slider
            min={0}
            max={sliderMax}
            step={1}
            value={sliderValue}
            onValueChange={handleSliderChange}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
          {sliderValue[0]}–{sliderValue[1] >= sliderMax ? '∞' : sliderValue[1]}
        </span>
      </div>

      {hasAnyFilter && (
        <Button variant="ghost" size="sm" onClick={onReset} aria-label={t('pools.filters.reset')}>
          <RotateCcw className="h-4 w-4 mr-1" />
          {t('pools.filters.reset')}
        </Button>
      )}
    </div>
  );
}
