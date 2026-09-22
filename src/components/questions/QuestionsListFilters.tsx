import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { RotateCcw, AlertCircle, CalendarIcon, X, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useHierarchyMulti } from '@/lib/hooks/useHierarchyMulti';
import { useAuthorsList } from '@/lib/hooks/useAuthorsList';
import { useCollectionsForFilter } from '@/lib/hooks/useCollectionsForFilter';
import { usePoolsForFilter } from '@/lib/hooks/usePoolsForFilter';
import type { QuestionsListFilters as FiltersType } from '@/lib/types/questions';
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  STATUS_LABELS,
  QUESTION_TYPE_LABELS,
} from '@/lib/types/questions';
import type {
  DifficultyLevel,
  QuestionLanguage,
  QuestionStatus,
  QuestionType,
} from '@/lib/types/questions';
import { cn } from '@/lib/utils';

const DIFFICULTY_OPTIONS = (
  [
    'facile',
    'medio_facile',
    'medio',
    'medio_difficile',
    'difficile',
    'non_ancora_valutata',
  ] as DifficultyLevel[]
).map((v) => ({ value: v, label: DIFFICULTY_LABELS[v] }));

const LANGUAGE_OPTIONS = (['IT-it', 'EN-en'] as QuestionLanguage[]).map((v) => ({
  value: v,
  label: LANGUAGE_LABELS[v],
}));

const STATUS_OPTIONS = (['DRAFT', 'ACTIVE', 'TO_REVIEW', 'INACTIVE'] as QuestionStatus[]).map(
  (v) => ({ value: v, label: STATUS_LABELS[v] })
);

const TYPE_OPTIONS = (['MULTIPLE_CHOICE', 'COMPLETION'] as QuestionType[]).map((v) => ({
  value: v,
  label: QUESTION_TYPE_LABELS[v],
}));

// Parse "yyyy-MM-dd" string to a local Date without timezone shift
function parseLocalDate(s: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface QuestionsListFiltersProps {
  filters: FiltersType;
  onFilterChange: (patch: Partial<FiltersType>) => void;
  onReset: () => void;
}

export function QuestionsListFilters({
  filters,
  onFilterChange,
  onReset,
}: QuestionsListFiltersProps) {
  const { t } = useTranslation();
  const authors = useAuthorsList();
  const collections = useCollectionsForFilter();
  const pools = usePoolsForFilter();

  const [searchInput, setSearchInput] = useState(filters.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search ?? '');
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search: value || undefined });
    }, 400);
  };

  const hierarchy = useHierarchyMulti({
    materiaIds: filters.materias,
  });

  const handleMateriasChange = (values: string[]) => {
    onFilterChange({ materias: values, argomenti: [] });
  };

  const handleArgomentiChange = (values: string[]) => {
    onFilterChange({ argomenti: values });
  };

  const selectedRange: DateRange | undefined =
    filters.dateFrom || filters.dateTo
      ? {
          from: parseLocalDate(filters.dateFrom),
          to: parseLocalDate(filters.dateTo),
        }
      : undefined;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    onFilterChange({
      dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
      dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
    });
  };

  const periodLabel =
    filters.dateFrom || filters.dateTo ? (
      <>
        {filters.dateFrom ? format(parseLocalDate(filters.dateFrom)!, 'dd/MM/yy') : '…'}
        {' → '}
        {filters.dateTo ? format(parseLocalDate(filters.dateTo)!, 'dd/MM/yy') : '…'}
      </>
    ) : (
      <span className="text-muted-foreground">{t('questions.filters.period')}</span>
    );

  const hasAnyFilter =
    filters.materias.length > 0 ||
    filters.argomenti.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.languages.length > 0 ||
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.authors.length > 0 ||
    filters.tags.length > 0 ||
    filters.collectionIds.length > 0 ||
    filters.poolIds.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.unpublished;

  const materiePlaceholder = hierarchy.materie.isLoading
    ? t('questions.filters.loadingSubjects')
    : hierarchy.materie.error
      ? t('questions.filters.errorSubjects')
      : t('questions.filters.subject');

  const argomentiPlaceholder =
    filters.materias.length === 0
      ? t('questions.filters.topic')
      : hierarchy.argomenti.isLoading
        ? t('questions.filters.loadingTopics')
        : hierarchy.argomenti.error
          ? t('questions.filters.errorTopics')
          : t('questions.filters.topic');

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Cerca per testo o ID…"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => handleSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Stato */}
        <MultiSelect
          options={STATUS_OPTIONS}
          value={filters.statuses}
          onChange={(v) => onFilterChange({ statuses: v as FiltersType['statuses'] })}
          placeholder={t('questions.filters.status')}
          className="w-[160px]"
        />

        {/* Tipo */}
        <MultiSelect
          options={TYPE_OPTIONS}
          value={filters.types}
          onChange={(v) => onFilterChange({ types: v as FiltersType['types'] })}
          placeholder={t('questions.filters.type')}
          className="w-[160px]"
        />

        {/* Autore */}
        <MultiSelect
          options={authors.options}
          value={filters.authors}
          onChange={(v) => onFilterChange({ authors: v })}
          placeholder={
            authors.isLoading
              ? t('questions.filters.loadingAuthors')
              : t('questions.filters.author')
          }
          disabled={authors.isLoading}
          className="w-[180px]"
        />

        {/* Periodo */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-[200px] h-9 justify-between font-normal gap-2 text-sm',
                'group border-input bg-background hover:bg-background'
              )}
            >
              <span className="truncate">{periodLabel}</span>
              <CalendarIcon
                aria-hidden="true"
                className="text-muted-foreground/80 group-hover:text-foreground shrink-0 transition-colors"
                size={16}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-2">
            <Calendar mode="range" selected={selectedRange} onSelect={handleDateRangeSelect} />
            {(filters.dateFrom || filters.dateTo) && (
              <div className="px-1 pb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-7 text-xs"
                  onClick={() => onFilterChange({ dateFrom: '', dateTo: '' })}
                >
                  <X className="h-3 w-3" />
                  {t('questions.filters.removePeriod')}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* Materia */}
        <div className="flex items-center gap-1">
          <MultiSelect
            options={hierarchy.materie.items.map((m) => ({ value: m.id, label: m.name }))}
            value={filters.materias}
            onChange={handleMateriasChange}
            placeholder={materiePlaceholder}
            disabled={hierarchy.materie.isLoading || !!hierarchy.materie.error}
            className="w-[180px]"
          />
          {hierarchy.materie.error && (
            <Button
              variant="ghost"
              size="icon"
              onClick={hierarchy.retryMaterie}
              aria-label={t('questions.filters.retrySubjects')}
              title={hierarchy.materie.error}
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>

        {/* Argomento */}
        <div className="flex items-center gap-1">
          <MultiSelect
            options={hierarchy.argomenti.items.map((a) => ({ value: a.id, label: a.name }))}
            value={filters.argomenti}
            onChange={handleArgomentiChange}
            placeholder={argomentiPlaceholder}
            disabled={
              filters.materias.length === 0 ||
              hierarchy.argomenti.isLoading ||
              !!hierarchy.argomenti.error
            }
            className="w-[180px]"
          />
          {filters.materias.length > 0 && hierarchy.argomenti.error && (
            <Button
              variant="ghost"
              size="icon"
              onClick={hierarchy.retryArgomenti}
              aria-label={t('questions.filters.retryTopics')}
              title={hierarchy.argomenti.error}
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>

        {/* Difficoltà */}
        <MultiSelect
          options={DIFFICULTY_OPTIONS}
          value={filters.difficulties}
          onChange={(v) => onFilterChange({ difficulties: v as FiltersType['difficulties'] })}
          placeholder={t('questions.filters.difficulty')}
          className="w-[180px]"
        />

        {/* Lingua */}
        <MultiSelect
          options={LANGUAGE_OPTIONS}
          value={filters.languages}
          onChange={(v) => onFilterChange({ languages: v as FiltersType['languages'] })}
          placeholder={t('questions.filters.language')}
          className="w-[140px]"
        />

        {/* Tag */}
        <MultiSelect
          options={[]}
          value={filters.tags}
          onChange={(v) => onFilterChange({ tags: v })}
          placeholder={t('questions.filters.tags')}
          searchPlaceholder={t('questions.filters.tagsSearch')}
          allowCreate
          className="w-[160px]"
        />

        {/* Collection */}
        <div className="flex items-center gap-1">
          <MultiSelect
            options={collections.options}
            value={filters.collectionIds}
            onChange={(v) =>
              onFilterChange({
                collectionIds: v,
                ...(v.length === 0 ? { collectionIdsMode: 'include' } : {}),
              })
            }
            placeholder={collections.isLoading ? 'Caricamento...' : 'Collection'}
            searchPlaceholder="Cerca collection..."
            disabled={collections.isLoading}
            showSelectAll
            className="w-[200px]"
          />
          <Button
            variant={filters.collectionIdsMode === 'exclude' ? 'destructive' : 'outline'}
            size="sm"
            className="h-9 px-2 text-xs shrink-0"
            onClick={() =>
              onFilterChange({
                collectionIdsMode: filters.collectionIdsMode === 'exclude' ? 'include' : 'exclude',
              })
            }
            title={
              filters.collectionIdsMode === 'exclude'
                ? 'NON in queste collection — clicca per invertire'
                : 'IN queste collection — clicca per invertire'
            }
          >
            {filters.collectionIdsMode === 'exclude' ? 'NON IN' : 'IN'}
          </Button>
        </div>

        {/* Pool */}
        <div className="flex items-center gap-1">
          <MultiSelect
            options={pools.options}
            value={filters.poolIds}
            onChange={(v) =>
              onFilterChange({
                poolIds: v,
                ...(v.length === 0 ? { poolIdsMode: 'include' } : {}),
              })
            }
            placeholder={pools.isLoading ? 'Caricamento...' : 'Pool'}
            searchPlaceholder="Cerca pool..."
            disabled={pools.isLoading}
            showSelectAll
            className="w-[200px]"
          />
          <Button
            variant={filters.poolIdsMode === 'exclude' ? 'destructive' : 'outline'}
            size="sm"
            className="h-9 px-2 text-xs shrink-0"
            onClick={() =>
              onFilterChange({
                poolIdsMode: filters.poolIdsMode === 'exclude' ? 'include' : 'exclude',
              })
            }
            title={
              filters.poolIdsMode === 'exclude'
                ? 'NON in questi pool — clicca per invertire'
                : 'IN questi pool — clicca per invertire'
            }
          >
            {filters.poolIdsMode === 'exclude' ? 'NON IN' : 'IN'}
          </Button>
        </div>

        {/* Domande inedite */}
        <div className="flex items-center gap-2">
          <Switch
            id="unpublished-switch"
            checked={filters.unpublished}
            onCheckedChange={(checked) =>
              onFilterChange({
                unpublished: checked,
                ...(checked ? { collectionIds: [], poolIds: [] } : {}),
              })
            }
          />
          <Label
            htmlFor="unpublished-switch"
            className="text-sm font-medium cursor-pointer select-none"
          >
            Inedite
          </Label>
        </div>

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label={t('questions.filters.resetAll')}
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            {t('questions.resetFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}
