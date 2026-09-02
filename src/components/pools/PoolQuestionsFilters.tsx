import { useTranslation } from 'react-i18next';
import { Search, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useHierarchyMulti } from '@/lib/hooks/useHierarchyMulti';
import type { PoolQuestionsFilters as FiltersType } from '@/lib/types/pools';
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  QUESTION_TYPE_LABELS,
} from '@/lib/types/questions';
import type { DifficultyLevel, QuestionLanguage, QuestionType } from '@/lib/types/questions';

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'facile', label: DIFFICULTY_LABELS.facile },
  { value: 'medio_facile', label: DIFFICULTY_LABELS.medio_facile },
  { value: 'medio', label: DIFFICULTY_LABELS.medio },
  { value: 'medio_difficile', label: DIFFICULTY_LABELS.medio_difficile },
  { value: 'difficile', label: DIFFICULTY_LABELS.difficile },
  { value: 'non_ancora_valutata', label: DIFFICULTY_LABELS.non_ancora_valutata },
];

const LANGUAGE_OPTIONS: { value: QuestionLanguage; label: string }[] = [
  { value: 'IT-it', label: LANGUAGE_LABELS['IT-it'] },
  { value: 'EN-en', label: LANGUAGE_LABELS['EN-en'] },
];

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'COMPLETION', label: QUESTION_TYPE_LABELS.COMPLETION },
  { value: 'MULTIPLE_CHOICE', label: QUESTION_TYPE_LABELS.MULTIPLE_CHOICE },
];

const UNSET = '__unset__';

interface PoolQuestionsFiltersProps {
  filters: FiltersType;
  onFilterChange: (patch: Partial<FiltersType>) => void;
  onReset: () => void;
}

export function PoolQuestionsFilters({ filters, onFilterChange, onReset }: PoolQuestionsFiltersProps) {
  const { t } = useTranslation();
  const hierarchy = useHierarchyMulti({
    materiaIds: filters.subjectId ? [filters.subjectId] : [],
  });

  const handleSubjectChange = (value: string) => {
    onFilterChange({ subjectId: value === UNSET ? '' : value, topicId: '' });
  };

  const handleTopicChange = (value: string) => {
    onFilterChange({ topicId: value === UNSET ? '' : value });
  };

  const hasAnyFilter =
    !!filters.search ||
    !!filters.subjectId ||
    !!filters.topicId ||
    !!filters.difficulty ||
    !!filters.type ||
    !!filters.language;

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t('pools.questions.filters.search')}
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-8 h-9 w-[240px] text-sm"
        />
      </div>

      <Select
        value={filters.type || UNSET}
        onValueChange={(v) => onFilterChange({ type: v === UNSET ? '' : v })}
      >
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue placeholder={t('pools.questions.filters.type')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>
            <span className="text-muted-foreground">{t('pools.questions.filters.type')}</span>
          </SelectItem>
          {TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.subjectId || UNSET}
        onValueChange={handleSubjectChange}
        disabled={hierarchy.materie.isLoading}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue
            placeholder={hierarchy.materie.isLoading ? t('pools.loading') : t('pools.questions.filters.subject')}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>
            <span className="text-muted-foreground">{t('pools.questions.filters.subject')}</span>
          </SelectItem>
          {hierarchy.materie.items.map((m) => (
            <SelectItem key={m.id} value={m.id}>
              {m.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.topicId || UNSET}
        onValueChange={handleTopicChange}
        disabled={!filters.subjectId || hierarchy.argomenti.isLoading}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue
            placeholder={t('pools.questions.filters.topic')}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>
            <span className="text-muted-foreground">{t('pools.questions.filters.topic')}</span>
          </SelectItem>
          {hierarchy.argomenti.items.map((a) => (
            <SelectItem key={a.id} value={a.id}>
              {a.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.difficulty || UNSET}
        onValueChange={(v) => onFilterChange({ difficulty: v === UNSET ? '' : v })}
      >
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder={t('pools.questions.filters.difficulty')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>
            <span className="text-muted-foreground">{t('pools.questions.filters.difficulty')}</span>
          </SelectItem>
          {DIFFICULTY_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.language || UNSET}
        onValueChange={(v) => onFilterChange({ language: v === UNSET ? '' : v })}
      >
        <SelectTrigger className="w-[140px] h-9 text-sm">
          <SelectValue placeholder={t('pools.questions.filters.language')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={UNSET}>
            <span className="text-muted-foreground">{t('pools.questions.filters.language')}</span>
          </SelectItem>
          {LANGUAGE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasAnyFilter && (
        <Button variant="ghost" size="sm" onClick={onReset} aria-label={t('pools.questions.filters.reset')}>
          <RotateCcw className="h-4 w-4 mr-1" />
          {t('pools.questions.filters.reset')}
        </Button>
      )}
    </div>
  );
}
