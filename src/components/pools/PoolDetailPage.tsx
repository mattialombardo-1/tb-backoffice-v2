import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Route } from '@/routes/_authenticated/pools/$poolId';
import { useApiClient } from '@/lib/api/useApiClient';
import { usePoolQuestions } from '@/lib/hooks/usePoolQuestions';
import { poolsService } from '@/lib/services/pools';
import { queryKeys } from '@/lib/query/queryKeys';
import type { PoolQuestion, PoolQuestionsFilters, PoolScores } from '@/lib/types/pools';
import { DEFAULT_POOL_SCORES } from '@/lib/types/pools';
import { PoolQuestionsFilters as PoolQuestionsFiltersComponent } from './PoolQuestionsFilters';
import { PoolQuestionsTable } from './PoolQuestionsTable';
import { PoolsPagination } from './PoolsPagination';
import { PoolAddQuestionsSheet } from './PoolAddQuestionsSheet';

const PER_PAGE = 20;

export function PoolDetailPage() {
  const { t } = useTranslation();
  const { poolId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const client = useApiClient();
  const queryClient = useQueryClient();

  const { data: pool } = useQuery({
    queryKey: queryKeys.pools.detail(poolId),
    queryFn: ({ signal }) => poolsService.get(client, poolId, signal),
    staleTime: 60_000,
  });

  const filters: PoolQuestionsFilters = {
    search: search.search ?? '',
    subjectId: search.subjectId ?? '',
    topicId: search.topicId ?? '',
    difficulty: search.difficulty ?? '',
    type: search.type ?? '',
    language: search.language ?? '',
    page: search.page ?? 1,
  };

  const { data, total, isLoading, error, refetch } = usePoolQuestions(poolId, filters);

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false);
  const [bulkRemoving, setBulkRemoving] = useState(false);

  const [scoresEditing, setScoresEditing] = useState(false);
  const [scoresForm, setScoresForm] = useState<PoolScores>(DEFAULT_POOL_SCORES);
  const [scoresSaving, setScoresSaving] = useState(false);

  const handleEditScores = () => {
    setScoresForm(pool?.scores ?? DEFAULT_POOL_SCORES);
    setScoresEditing(true);
  };

  const handleSaveScores = async () => {
    setScoresSaving(true);
    try {
      await poolsService.update(client, poolId, { scores: scoresForm });
      await queryClient.invalidateQueries({ queryKey: queryKeys.pools.detail(poolId) });
      setScoresEditing(false);
      toast.success(t('pools.scores.saveSuccess'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.scores.saveError'));
    } finally {
      setScoresSaving(false);
    }
  };

  const updateFilters = (patch: Partial<PoolQuestionsFilters>) => {
    const next = { ...filters, ...patch };
    if (!('page' in patch)) next.page = 1;
    if (!('page' in patch) || patch.page !== filters.page) {
      setSelectedIds(new Set());
    }
    navigate({
      to: '/pools/$poolId',
      params: { poolId },
      search: {
        search: next.search || undefined,
        subjectId: next.subjectId || undefined,
        topicId: next.topicId || undefined,
        difficulty: next.difficulty || undefined,
        type: next.type || undefined,
        language: next.language || undefined,
        page: next.page > 1 ? next.page : undefined,
      },
      replace: true,
    });
  };

  const handleReset = () => {
    updateFilters({ search: '', subjectId: '', topicId: '', difficulty: '', type: '', language: '', page: 1 });
  };

  const hasFilters =
    !!filters.search ||
    !!filters.subjectId ||
    !!filters.topicId ||
    !!filters.difficulty ||
    !!filters.type ||
    !!filters.language;

  const handleRemove = async (question: PoolQuestion) => {
    const qid = question.questionId;
    setRemovingIds((s) => new Set(s).add(qid));
    try {
      await poolsService.removeQuestion(client, poolId, qid);
      setSelectedIds((s) => { const next = new Set(s); next.delete(qid); return next; });
      toast.success(t('pools.questions.removeSuccess'));
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.questions.removeError'));
    } finally {
      setRemovingIds((s) => {
        const next = new Set(s);
        next.delete(qid);
        return next;
      });
    }
  };

  const handleBulkRemove = async () => {
    setBulkRemoving(true);
    setBulkRemoveOpen(false);
    try {
      const { removed } = await poolsService.bulkRemoveQuestions(client, poolId, [...selectedIds]);
      setSelectedIds(new Set());
      toast.success(t('pools.questions.bulkRemove.success', { removed }));
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.questions.bulkRemove.error'));
    } finally {
      setBulkRemoving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/pools' })}
              aria-label={t('pools.detail.back')}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              {pool ? (
                <h1 className="text-2xl font-semibold">{pool.name}</h1>
              ) : (
                <Skeleton className="h-8 w-56" />
              )}
              <p className="mt-1 text-sm text-muted-foreground">
                {!isLoading
                  ? t('pools.detail.totalQuestions', { total: total.toLocaleString('it-IT') })
                  : t('pools.detail.loading')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setBulkRemoveOpen(true)}
                disabled={bulkRemoving}
              >
                <Trash2 className="h-4 w-4 mr-1.5" />
                {t('pools.questions.bulkRemove.button', { count: selectedIds.size })}
              </Button>
            )}
            <Button size="sm" onClick={() => setIsAddSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              {t('pools.detail.addQuestions')}
            </Button>
          </div>
        </div>

        {/* Scores section */}
        <div className="rounded-md border px-4 py-3 flex items-center gap-6">
          <span className="text-sm font-medium shrink-0">{t('pools.scores.title')}</span>
          {scoresEditing ? (
            <div className="flex items-center gap-3 flex-1">
              {(['correct', 'wrong', 'empty'] as const).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{t(`pools.scores.${key}`)}</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={scoresForm[key]}
                    onChange={(e) => setScoresForm((s) => ({ ...s, [key]: parseFloat(e.target.value) || 0 }))}
                    className="w-20 h-7 text-center text-sm"
                    disabled={scoresSaving}
                  />
                </div>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <Button size="sm" variant="ghost" onClick={() => setScoresEditing(false)} disabled={scoresSaving}>
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button size="sm" onClick={handleSaveScores} disabled={scoresSaving}>
                  {scoresSaving ? t('common.saving') : t('common.save')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6 flex-1">
              {(['correct', 'wrong', 'empty'] as const).map((key) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{t(`pools.scores.${key}`)}</span>
                  <span className="text-sm font-medium tabular-nums">
                    {pool ? (pool.scores ?? DEFAULT_POOL_SCORES)[key] : '—'}
                  </span>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="ml-auto h-7 px-2" onClick={handleEditScores} disabled={!pool}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                {t('common.edit')}
              </Button>
            </div>
          )}
        </div>

        <PoolQuestionsFiltersComponent
          filters={filters}
          onFilterChange={updateFilters}
          onReset={handleReset}
        />

        <PoolQuestionsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          hasFilters={hasFilters}
          onResetFilters={handleReset}
          onRemove={handleRemove}
          removingIds={removingIds}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <PoolsPagination
          page={filters.page}
          total={total}
          perPage={PER_PAGE}
          onPageChange={(p) => updateFilters({ page: p })}
        />
      </div>

      <PoolAddQuestionsSheet
        open={isAddSheetOpen}
        onOpenChange={setIsAddSheetOpen}
        poolId={poolId}
        onAdded={refetch}
      />

      <Dialog open={bulkRemoveOpen} onOpenChange={setBulkRemoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pools.questions.bulkRemove.confirmTitle')}</DialogTitle>
            <DialogDescription asChild>
              <span>
                <Trans
                  i18nKey="pools.questions.bulkRemove.confirmDesc"
                  values={{ count: selectedIds.size }}
                  components={{ strong: <strong /> }}
                />
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkRemoveOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleBulkRemove}>
              {t('pools.questions.bulkRemove.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
