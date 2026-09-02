import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, formatDate } from '@/lib/utils';
import type { QuestionAssociations, QuestionListItem } from '@/lib/types/questions';
import { DIFFICULTY_LABELS, STATUS_LABELS } from '@/lib/types/questions';
import type { QuestionStatus } from '@/lib/types/questions';
import { QuestionsListRowActions } from './QuestionsListRowActions';
import { CopyableId } from './CopyableId';
import { RichQuestionText } from './RichQuestionText';
import { ExternalLink, Loader } from 'lucide-react';

interface QuestionsListTableProps {
  data: QuestionListItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  onResetFilters: () => void;
  onView: (question: QuestionListItem) => void;
  onCopyId: (question: QuestionListItem) => void;
  onEdit: (question: QuestionListItem) => void;
  onDelete: (question: QuestionListItem) => void;
  isBulkMode: boolean;
  isSelected: (id: string) => boolean;
  isPageFullySelected: boolean;
  onToggleItem: (id: string) => void;
  onTogglePage: () => void;
  total: number;
  showSelectAllBanner: boolean;
  onSelectAll: () => void;
  isSelectingAll?: boolean;
  isAllSelected: boolean;
  associations?: Map<string, QuestionAssociations>;
}

const BASE_COLUMNS = 8;

const DIFFICULTY_CONFIG: Record<string, { className: string }> = {
  facile: {
    className:
      'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  medio_facile: {
    className:
      'border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  medio: {
    className:
      'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  medio_difficile: {
    className:
      'border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
  },
  difficile: {
    className:
      'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
  },
  non_ancora_valutata: { className: '' },
};

const STATUS_CONFIG: Record<QuestionStatus, { className: string }> = {
  DRAFT: {
    className:
      'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
  },
  ACTIVE: {
    className:
      'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  TO_REVIEW: {
    className:
      'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  INACTIVE: {
    className:
      'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
  },
};

const CELL_TRUNCATE_LEN = 13;

function TruncatedCell({ text }: { text: string }) {
  if (text.length <= CELL_TRUNCATE_LEN) {
    return <span className="text-sm">{text}</span>;
  }
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm cursor-default">{text.slice(0, CELL_TRUNCATE_LEN)}…</span>
        </TooltipTrigger>
        <TooltipContent side="bottom">{text}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AssociationsCell({ associations }: { associations: QuestionAssociations | undefined }) {
  const [open, setOpen] = useState(false);

  const collectionsCount = associations?.collections.length ?? 0;
  const poolsCount = associations?.pools.length ?? 0;
  const total = collectionsCount + poolsCount;

  if (!associations) {
    return <Loader className="h-4 w-4 animate-spin text-muted-foreground" />;
  }

  if (total === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  const label = [
    collectionsCount > 0 ? `${collectionsCount} col.` : null,
    poolsCount > 0 ? `${poolsCount} pool` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <button
        className="text-sm text-primary underline-offset-2 hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        {label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Associazioni</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {collectionsCount > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Collections ({collectionsCount})
                </p>
                <ul className="space-y-1">
                  {associations.collections.map((c) => (
                    <li key={c.id} className="text-sm flex items-center gap-1">
                      {c.name}
                      <a
                        href={`/collections/create?collectionId=${c.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {poolsCount > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Pool ({poolsCount})
                </p>
                <ul className="space-y-1">
                  {associations.pools.map((p) => (
                    <li key={p.id} className="text-sm flex items-center gap-1">
                      {p.name}
                      <a href={`/pools/${p.id}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={14} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SkeletonRows({ columns }: { columns: number }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: columns }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function QuestionsListTable({
  data,
  isLoading,
  error,
  onRetry,
  hasFilters,
  onResetFilters,
  onView,
  onCopyId,
  onEdit,
  onDelete,
  isBulkMode,
  isSelected,
  isPageFullySelected,
  onToggleItem,
  onTogglePage,
  total,
  showSelectAllBanner,
  onSelectAll,
  isSelectingAll,
  isAllSelected,
  associations,
}: QuestionsListTableProps) {
  const { t } = useTranslation();
  const columns = BASE_COLUMNS + 1;

  return (
    <div className="rounded-md border">
      {isBulkMode && showSelectAllBanner && !isAllSelected && data.length > 0 && (
        <div className="bg-muted/50 px-4 py-2 text-sm border-b flex items-center gap-2">
          <span>{t('questions.bannerPageSelected', { count: data.length })}</span>
          {total > data.length && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={onSelectAll}
              disabled={isSelectingAll}
            >
              {isSelectingAll ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader className="h-3.5 w-3.5 animate-spin" />
                  {t('questions.bannerSelectAllLoading')}
                </span>
              ) : (
                t('questions.bannerSelectAll', { total })
              )}
            </Button>
          )}
        </div>
      )}
      {isBulkMode && isAllSelected && (
        <div className="bg-muted/50 px-4 py-2 text-sm border-b">
          {t('questions.bannerAllSelected', { total })}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {isBulkMode && (
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={isPageFullySelected && data.length > 0}
                  onCheckedChange={() => onTogglePage()}
                  aria-label={t('questions.table.selectAll')}
                />
              </TableHead>
            )}
            <TableHead className="w-[120px]">ID</TableHead>
            <TableHead className="w-full max-w-0">Testo</TableHead>
            <TableHead className="w-[130px]">Materia</TableHead>
            <TableHead className="w-[130px]">Argomento</TableHead>
            <TableHead>Difficoltà</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Associazioni</TableHead>
            <TableHead>Aggiornata il</TableHead>
            {!isBulkMode && <TableHead className="w-[50px]">Azioni</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows columns={columns} />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={columns} className="text-center py-8">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns} className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {hasFilters ? t('questions.noResultsFiltered') : t('questions.noResults')}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={onResetFilters}>
                    {t('questions.resetFilters')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((question) => {
              const diffConfig = DIFFICULTY_CONFIG[question.difficulty] ?? { className: '' };
              const statusConfig = STATUS_CONFIG[question.status] ?? { className: '' };
              const selected = isBulkMode && isSelected(question.id);
              return (
                <TableRow key={question.id} className={cn('group', selected && 'bg-muted/50')}>
                  {isBulkMode && (
                    <TableCell>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onToggleItem(question.id)}
                        aria-label={t('questions.table.selectRow', { id: question.id })}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <CopyableId id={question.id} />
                  </TableCell>
                  <TableCell className="max-w-0">
                    <RichQuestionText
                      html={question.questionText}
                      className="text-sm line-clamp-3"
                    />
                  </TableCell>
                  <TableCell>
                    <TruncatedCell text={question.materiaName} />
                  </TableCell>
                  <TableCell>
                    <TruncatedCell text={question.argomentoName} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={diffConfig.className}>
                      {DIFFICULTY_LABELS[question.difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusConfig.className}>
                      {STATUS_LABELS[question.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AssociationsCell associations={associations?.get(question.id)} />
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(question.updatedAt)}</TableCell>
                  {!isBulkMode && (
                    <TableCell>
                      <QuestionsListRowActions
                        question={question}
                        onView={onView}
                        onCopyId={onCopyId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
