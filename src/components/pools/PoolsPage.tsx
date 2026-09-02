import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ListChecks, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCan } from '@/lib/auth';
import { Route } from '@/routes/_authenticated/pools/index';
import { useApiClient } from '@/lib/api/useApiClient';
import { useBulkSelection } from '@/lib/hooks/useBulkSelection';
import { usePoolsList } from '@/lib/hooks/usePoolsList';
import { poolsService } from '@/lib/services/pools';
import type { Pool, PoolsFilters, PoolStatus } from '@/lib/types/pools';
import { PoolsTable } from './PoolsTable';
import { PoolsFilters as PoolsFiltersComponent } from './PoolsFilters';
import { PoolsPagination } from './PoolsPagination';
import { PoolsBulkBar } from './PoolsBulkBar';
import type { PoolBulkAction } from './PoolsBulkBar';
import { PoolsBulkDialog } from './PoolsBulkDialog';
import { PoolsStatusDialog } from './PoolsStatusDialog';
import { PoolsDeleteDialog } from './PoolsDeleteDialog';
import { PoolCreateSheet } from './PoolCreateSheet';

const PER_PAGE = 20;

const parseCSV = (v: string | undefined): string[] => (v ? v.split(',').filter(Boolean) : []);

export function PoolsPage() {
  const { t } = useTranslation();
  const canCreate = useCan('pools', 'CREATE');
  const search = Route.useSearch();
  const navigate = useNavigate();
  const client = useApiClient();

  const filters: PoolsFilters = {
    search: search.search ?? '',
    statuses: parseCSV(search.statuses) as PoolStatus[],
    minQuestions: search.minQuestions ?? 0,
    maxQuestions: search.maxQuestions ?? 0,
    subjectIds: parseCSV(search.subjectIds),
  };
  const page = search.page ?? 1;

  const { data, allPools, total, isLoading, error, refetch } = usePoolsList(filters, page);

  const bulk = useBulkSelection();
  const [isBulkMode, setIsBulkMode] = useState(false);

  const toggleBulkMode = () => {
    if (isBulkMode) bulk.clearSelection();
    setIsBulkMode((v) => !v);
  };

  const [statusTarget, setStatusTarget] = useState<{ pool: Pool; status: PoolStatus } | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<PoolBulkAction | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Pool | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const updateSearch = (patch: Partial<typeof search>) => {
    const next = { ...search, ...patch };
    navigate({
      to: '/pools',
      search: {
        page: next.page && next.page > 1 ? next.page : undefined,
        search: next.search || undefined,
        statuses: next.statuses || undefined,
        minQuestions: next.minQuestions ?? undefined,
        maxQuestions: next.maxQuestions ?? undefined,
        subjectIds: next.subjectIds || undefined,
      },
      replace: true,
    });
  };

  const handleFilterChange = (patch: Partial<PoolsFilters>) => {
    const next = { ...filters, ...patch };
    navigate({
      to: '/pools',
      search: {
        page: undefined,
        search: next.search || undefined,
        statuses: next.statuses.join(',') || undefined,
        minQuestions: next.minQuestions > 0 ? next.minQuestions : undefined,
        maxQuestions: next.maxQuestions > 0 ? next.maxQuestions : undefined,
        subjectIds: next.subjectIds.join(',') || undefined,
      },
      replace: true,
    });
  };

  const handleReset = () => {
    navigate({
      to: '/pools',
      search: {},
      replace: true,
    });
  };

  const handleRowClick = (pool: Pool) => {
    navigate({ to: '/pools/$poolId', params: { poolId: pool.id } });
  };

  const handleStatusConfirm = async (pool: Pool, status: PoolStatus) => {
    setStatusLoading(true);
    try {
      await poolsService.updateStatus(client, pool.id, status);
      toast.success(t('pools.statusDialog.success', { status: status === 'ACTIVE' ? t('pools.statusActive') : t('pools.statusInactive') }));
      setStatusTarget(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.statusDialog.error'));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteConfirm = async (pool: Pool) => {
    setDeleteLoading(true);
    try {
      await poolsService.delete(client, pool.id);
      toast.success(t('pools.deleteDialog.success', { name: pool.name }));
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.deleteDialog.error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkConfirm = async () => {
    if (!bulkAction) return;
    const ids = Array.from(bulk.selectedIds);
    setBulkLoading(true);
    try {
      await Promise.all(ids.map((id) => poolsService.updateStatus(client, id, bulkAction)));
      const count = ids.length;
      if (bulkAction === 'ACTIVE') {
        toast.success(t('pools.bulkDialog.success_active', { count }));
      } else {
        toast.success(t('pools.bulkDialog.success_inactive', { count }));
      }
      setBulkAction(null);
      bulk.clearSelection();
      setIsBulkMode(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.bulkDialog.error'));
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{t('pools.title')}</h1>
            {!isLoading && (
              <p className="mt-1 text-sm text-muted-foreground">
                {t('pools.count', { count: total })}
                {total !== allPools.length && ` ${t('pools.countSuffix', { total: allPools.length })}`}
              </p>
            )}
            {isLoading && (
              <p className="mt-1 text-sm text-muted-foreground">{t('pools.loading')}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isBulkMode ? (
              <Button variant="outline" size="sm" onClick={toggleBulkMode}>
                <ListChecks className="h-4 w-4 mr-1.5" />
                {t('pools.bulkSelect')}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" onClick={toggleBulkMode}>
                <X className="h-4 w-4 mr-1.5" />
                {t('pools.exitBulk')}
              </Button>
            )}
            {canCreate && (
              <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                {t('pools.create')}
              </Button>
            )}
          </div>
        </div>

        <PoolsFiltersComponent
          filters={filters}
          allPools={allPools}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
        />

        <PoolsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onRowClick={handleRowClick}
          isBulkMode={isBulkMode}
          isSelected={bulk.isSelected}
          onToggleItem={bulk.toggleItem}
          onStatusChange={(pool, status) => setStatusTarget({ pool, status })}
          onDelete={setDeleteTarget}
        />
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4 space-y-3">
        {isBulkMode && (
          <PoolsBulkBar
            selectedCount={bulk.selectedCount}
            onAction={setBulkAction}
            onClear={bulk.clearSelection}
          />
        )}
        <PoolsPagination
          page={page}
          total={total}
          perPage={PER_PAGE}
          onPageChange={(p) => updateSearch({ page: p })}
        />
      </div>

      <PoolsStatusDialog
        pool={statusTarget?.pool ?? null}
        targetStatus={statusTarget?.status ?? null}
        isLoading={statusLoading}
        onConfirm={handleStatusConfirm}
        onCancel={() => setStatusTarget(null)}
      />
      <PoolsBulkDialog
        action={bulkAction}
        selectedCount={bulk.selectedCount}
        isLoading={bulkLoading}
        onConfirm={handleBulkConfirm}
        onCancel={() => setBulkAction(null)}
      />
      <PoolsDeleteDialog
        pool={deleteTarget}
        isLoading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
      <PoolCreateSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onCreated={refetch}
      />
    </div>
  );
}
