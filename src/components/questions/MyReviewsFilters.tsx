import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { CalendarIcon, RotateCcw, Search, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ArgomentoOption } from '@/lib/hooks/useReviewBatches';
import type {
  BatchOutcome,
  HierarchyItem,
  MyReviewsFilters as FiltersType,
  MyReviewStatus,
} from '@/lib/types/questions';
import { BATCH_OUTCOME_LABELS, MY_REVIEW_STATUS_LABELS } from '@/lib/types/questions';
import { cn } from '@/lib/utils';

// Non le stesse 4 opzioni di QuestionsListFilters: myReviews() restituisce solo domande
// TO_REVIEW, quindi DRAFT/ACTIVE/INACTIVE non avrebbero mai risultati qui. Al loro posto,
// REVIEWED — uno stato derivato lato client (vedi MyReviewStatus) che isola le domande già
// approvate/rigettate in questa sessione, normalmente nascoste una volta svuotato il batch.
const STATUS_OPTIONS = (['TO_REVIEW', 'REVIEWED'] as MyReviewStatus[]).map((v) => ({
  value: v,
  label: MY_REVIEW_STATUS_LABELS[v],
}));

// Esito della generazione — mockato per intero (vedi mockOutcomeForBatch in
// useReviewBatches): non esiste ancora un job di generazione da interrogare, questo filtro
// serve solo a mostrarne il funzionamento nella demo.
const OUTCOME_OPTIONS = (['IN_PROGRESS', 'COMPLETED', 'PARTIAL', 'ERROR'] as BatchOutcome[]).map(
  (v) => ({ value: v, label: BATCH_OUTCOME_LABELS[v] })
);

// Parse "yyyy-MM-dd" string to a local Date without timezone shift
function parseLocalDate(s: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

interface MyReviewsFiltersProps {
  filters: FiltersType;
  onFilterChange: (patch: Partial<FiltersType>) => void;
  onReset: () => void;
  /** Derivate dalle domande stesse, non dal catalogo — vedi il commento in useReviewBatches:
   *  le domande generate hanno un topicId "fixedOptions" che il catalogo non conosce. */
  materiaOptions: HierarchyItem[];
  argomentoOptions: ArgomentoOption[];
}

/**
 * Filtri di "Domande da revisionare" — stessi campi/nomi/layout di QuestionsListFilters
 * (la sezione "Domande") più Esito, specifico di questa schermata — ridotti a Stato, Esito,
 * Materia, Argomento, Periodo più la ricerca testo/ID: gli unici che hanno senso qui, dato
 * che i batch sono già raggruppati per materia + argomento + data (vedi useReviewBatches).
 * Stato usa opzioni diverse da QuestionsListFilters — vedi il commento su STATUS_OPTIONS
 * sotto. Esito è interamente mockato — vedi il commento su OUTCOME_OPTIONS sotto e su
 * mockOutcomeForBatch in useReviewBatches.ts. Il filtraggio effettivo è client-side,
 * applicato dentro useReviewBatches.
 */
export function MyReviewsFilters({
  filters,
  onFilterChange,
  onReset,
  materiaOptions,
  argomentoOptions,
}: MyReviewsFiltersProps) {
  const { t } = useTranslation();

  const [searchInput, setSearchInput] = useState(filters.search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onFilterChange({ search: value });
    }, 400);
  };

  const handleMateriasChange = (values: string[]) => {
    onFilterChange({ materias: values, argomenti: [] });
  };

  const handleArgomentiChange = (values: string[]) => {
    onFilterChange({ argomenti: values });
  };

  const visibleArgomentoOptions =
    filters.materias.length === 0
      ? argomentoOptions
      : argomentoOptions.filter((a) => filters.materias.includes(a.subjectId));

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
    filters.statuses.length > 0 ||
    filters.outcomes.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    !!filters.search;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={t('myReviews.filters.search')}
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
          onChange={(v) => onFilterChange({ statuses: v as MyReviewStatus[] })}
          placeholder={t('questions.filters.status')}
          className="w-[160px]"
        />

        {/* Esito */}
        <MultiSelect
          options={OUTCOME_OPTIONS}
          value={filters.outcomes}
          onChange={(v) => onFilterChange({ outcomes: v as BatchOutcome[] })}
          placeholder={t('myReviews.filters.outcome')}
          className="w-[160px]"
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
        <MultiSelect
          options={materiaOptions.map((m) => ({ value: m.id, label: m.name }))}
          value={filters.materias}
          onChange={handleMateriasChange}
          placeholder={t('questions.filters.subject')}
          className="w-[180px]"
        />

        {/* Argomento — disabilitato finché non si sceglie una Materia, come in
            QuestionsListFilters (lì per via del fetch scoped; qui per coerenza di UX, dato
            che le opzioni derivano comunque dagli stessi dati già in memoria). */}
        <MultiSelect
          options={visibleArgomentoOptions.map((a) => ({ value: a.id, label: a.name }))}
          value={filters.argomenti}
          onChange={handleArgomentiChange}
          placeholder={t('questions.filters.topic')}
          disabled={filters.materias.length === 0}
          className="w-[180px]"
        />

        {hasAnyFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            aria-label={t('questions.filters.resetAll')}
          >
            <RotateCcw className="h-4 w-4" />
            {t('myReviews.resetFilters')}
          </Button>
        )}
      </div>
    </div>
  );
}
