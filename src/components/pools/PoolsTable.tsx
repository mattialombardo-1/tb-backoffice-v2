import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Pool, PoolStatus } from '@/lib/types/pools';
import { POOL_STATUS_LABELS } from '@/lib/types/pools';

const STATUS_CONFIG: Record<PoolStatus, string> = {
  ACTIVE: 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  INACTIVE: 'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
  DRAFT: 'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

const COLUMNS = 5;

function SkeletonRows() {
  return Array.from({ length: 6 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

interface PoolsTableProps {
  data: Pool[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onRowClick: (pool: Pool) => void;
  isBulkMode: boolean;
  isSelected: (id: string) => boolean;
  onToggleItem: (id: string) => void;
  onStatusChange: (pool: Pool, status: PoolStatus) => void;
  onDelete: (pool: Pool) => void;
}

export function PoolsTable({
  data,
  isLoading,
  error,
  onRetry,
  onRowClick,
  isBulkMode,
  isSelected,
  onToggleItem,
  onStatusChange,
  onDelete,
}: PoolsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {isBulkMode && <TableHead className="w-10" />}
            <TableHead>{t('pools.table.name')}</TableHead>
            <TableHead className="hidden sm:table-cell">{t('pools.table.description')}</TableHead>
            <TableHead>{t('pools.table.status')}</TableHead>
            <TableHead className="text-right">{t('pools.table.totalQuestions')}</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-24 text-center">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-24 text-center text-sm text-muted-foreground">
                {t('pools.noResults')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((pool) => {
              const selected = isSelected(pool.id);
              const otherStatus: PoolStatus = pool.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
              return (
                <TableRow
                  key={pool.id}
                  className="group cursor-pointer hover:bg-muted/50"
                  onClick={() => isBulkMode ? onToggleItem(pool.id) : onRowClick(pool)}
                  data-selected={selected || undefined}
                >
                  {isBulkMode && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => onToggleItem(pool.id)}
                        aria-label={t('pools.grid.select', { name: pool.name })}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium py-4">{pool.name}</TableCell>
                  <TableCell className="hidden sm:table-cell py-4 text-sm text-muted-foreground max-w-xs truncate">
                    {pool.description ?? '—'}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className={STATUS_CONFIG[pool.status]}>
                      {POOL_STATUS_LABELS[pool.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right py-4 text-sm text-muted-foreground">
                    {pool.totalQuestions.toLocaleString('it-IT')}
                  </TableCell>
                  <TableCell className="py-4" onClick={(e) => e.stopPropagation()}>
                    {!isBulkMode && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
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
                    )}
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
