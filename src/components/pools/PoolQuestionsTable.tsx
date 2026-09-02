import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate } from '@/lib/utils';
import type { PoolQuestion } from '@/lib/types/pools';
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  QUESTION_TYPE_LABELS,
} from '@/lib/types/questions';
import type { DifficultyLevel } from '@/lib/types/questions';
import { CopyableId } from '@/components/questions/CopyableId';

const DIFFICULTY_CONFIG: Record<string, { className: string }> = {
  facile: { className: 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  medio_facile: { className: 'border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  medio: { className: 'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  medio_difficile: { className: 'border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300' },
  difficile: { className: 'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  non_ancora_valutata: { className: '' },
};

interface PoolQuestionsTableProps {
  data: PoolQuestion[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  onResetFilters: () => void;
  onRemove: (question: PoolQuestion) => void;
  removingIds?: Set<string>;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const COLS = 10;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function PoolQuestionsTable({
  data,
  isLoading,
  error,
  onRetry,
  hasFilters,
  onResetFilters,
  onRemove,
  removingIds = new Set(),
  selectedIds,
  onSelectionChange,
}: PoolQuestionsTableProps) {
  const { t } = useTranslation();

  const allSelected = data.length > 0 && data.every((q) => selectedIds.has(q.questionId));
  const someSelected = data.some((q) => selectedIds.has(q.questionId));

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      data.forEach((q) => next.delete(q.questionId));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      data.forEach((q) => next.add(q.questionId));
      onSelectionChange(next);
    }
  };

  const toggleOne = (questionId: string) => {
    const next = new Set(selectedIds);
    if (next.has(questionId)) {
      next.delete(questionId);
    } else {
      next.add(questionId);
    }
    onSelectionChange(next);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={toggleAll}
                disabled={isLoading || data.length === 0}
                aria-label={t('common.selectAll')}
              />
            </TableHead>
            <TableHead className="w-[120px]">{t('pools.questions.table.questionId')}</TableHead>
            <TableHead>{t('pools.questions.table.subject')}</TableHead>
            <TableHead>{t('pools.questions.table.topic')}</TableHead>
            <TableHead>{t('pools.questions.table.subtopic')}</TableHead>
            <TableHead>{t('pools.questions.table.difficulty')}</TableHead>
            <TableHead>{t('pools.questions.table.type')}</TableHead>
            <TableHead>{t('pools.questions.table.language')}</TableHead>
            <TableHead>{t('pools.questions.table.addedAt')}</TableHead>
            <TableHead className="w-[48px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLS} className="text-center py-8">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLS} className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {hasFilters
                    ? t('pools.questions.table.noResults')
                    : t('pools.questions.table.empty')}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={onResetFilters}>
                    {t('pools.questions.filters.reset')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((q) => {
              const diffConfig = DIFFICULTY_CONFIG[q.difficulty] ?? { className: '' };
              const isRemoving = removingIds.has(q.questionId);
              const isSelected = selectedIds.has(q.questionId);
              return (
                <TableRow key={q.id} className="group" data-state={isSelected ? 'selected' : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleOne(q.questionId)}
                      aria-label={t('common.selectRow')}
                    />
                  </TableCell>
                  <TableCell>
                    <CopyableId id={q.questionId} />
                  </TableCell>
                  <TableCell className="text-sm">{q.subjectName || '—'}</TableCell>
                  <TableCell className="text-sm">{q.topicName || '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {q.subtopicName || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={diffConfig.className}>
                      {DIFFICULTY_LABELS[q.difficulty as DifficultyLevel]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {QUESTION_TYPE_LABELS[q.type]}
                  </TableCell>
                  <TableCell className="text-sm">
                    {LANGUAGE_LABELS[q.language]}
                  </TableCell>
                  <TableCell className="text-sm">
                    {q.addedAt ? formatDate(q.addedAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      onClick={() => onRemove(q)}
                      disabled={isRemoving}
                      aria-label={t('pools.questions.remove')}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
