import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Pool, PoolStatus } from '@/lib/types/pools';
import { POOL_STATUS_LABELS } from '@/lib/types/pools';

const STATUS_DOT: Record<PoolStatus, string> = {
  ACTIVE: 'bg-blue-500',
  INACTIVE: 'bg-zinc-400',
  DRAFT: 'bg-amber-400',
};

const STATUS_TEXT: Record<PoolStatus, string> = {
  ACTIVE: 'text-blue-600 dark:text-blue-400',
  INACTIVE: 'text-zinc-500 dark:text-zinc-400',
  DRAFT: 'text-amber-600 dark:text-amber-400',
};

interface PoolsGridProps {
  data: Pool[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onCardClick: (pool: Pool) => void;
  isBulkMode: boolean;
  isSelected: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onStatusChange: (pool: Pool, status: PoolStatus) => void;
  onDelete: (pool: Pool) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-20 mt-1" />
    </div>
  );
}

export function PoolsGrid({
  data,
  isLoading,
  error,
  onRetry,
  onCardClick,
  isBulkMode,
  isSelected,
  onToggleItem,
  onStatusChange,
  onDelete,
}: PoolsGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">{t('pools.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((pool) => {
        const selected = isSelected(pool.id);
        const otherStatus: PoolStatus = pool.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        return (
          <div
            key={pool.id}
            role="button"
            tabIndex={0}
            aria-pressed={isBulkMode ? selected : undefined}
            onClick={() => isBulkMode ? onToggleItem(pool.id) : onCardClick(pool)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                isBulkMode ? onToggleItem(pool.id) : onCardClick(pool);
              }
            }}
            className={cn(
              'group relative rounded-xl border bg-card p-5',
              'flex flex-col gap-2 cursor-pointer',
              'transition-all duration-150 outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              !isBulkMode && 'hover:shadow-md hover:border-foreground/20 hover:-translate-y-px',
              isBulkMode && selected && 'ring-2 ring-primary border-primary',
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              {isBulkMode ? (
                <div className="flex items-start gap-2.5 min-w-0">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleItem(pool.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={t('pools.grid.select', { name: pool.name })}
                    className="mt-0.5 shrink-0"
                  />
                  <span className="font-semibold text-sm leading-snug">{pool.name}</span>
                </div>
              ) : (
                <span className="font-semibold text-sm leading-snug">{pool.name}</span>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <span className={cn('flex items-center gap-1.5 text-xs font-medium', STATUS_TEXT[pool.status])}>
                  <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT[pool.status])} />
                  {POOL_STATUS_LABELS[pool.status]}
                </span>

                {!isBulkMode && (
                  <div
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                          <span className="sr-only">{t('pools.grid.actions')}</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onStatusChange(pool, otherStatus)}>
                          {t('pools.grid.setStatus', { status: POOL_STATUS_LABELS[otherStatus].toLowerCase() })}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(pool)}
                        >
                          {t('common.delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>

            {pool.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {pool.description}
              </p>
            )}

            <p className="text-sm font-medium mt-auto pt-1">
              {t('pools.grid.question', { count: pool.totalQuestions })}
            </p>
          </div>
        );
      })}
    </div>
  );
}
