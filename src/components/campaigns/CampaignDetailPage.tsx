import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Route } from '@/routes/_authenticated/campaigns/$campaignId';
import { useCampaignDetail } from '@/lib/hooks/useCampaignDetail';
import { useReviewerList } from '@/lib/hooks/useReviewerList';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { queryKeys } from '@/lib/query';
import { DIFFICULTY_LABELS } from '@/lib/types/questions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { AddSlotSheet } from './AddSlotSheet';
import { CampaignDetailFilters, applyFilters, EMPTY_CAMPAIGN_FILTERS } from './CampaignDetailFilters';
import type { CampaignDetailFiltersState } from './CampaignDetailFilters';
import type { CampaignQuestionSlot, CampaignQuestionStatus, NewCampaignQuestionSlot } from '@/lib/types/campaigns';
import type { DifficultyLevel } from '@/lib/types/questions';

const STATUS_CLASS: Record<CampaignQuestionStatus, string> = {
  draft: 'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
  in_review: 'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  approved: 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  rejected: 'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

const DIFFICULTY_FROM_NUM: Record<number, DifficultyLevel> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

function difficultyLabel(value: number | undefined): string {
  if (value == null) return '—';
  const key = DIFFICULTY_FROM_NUM[value];
  return key ? DIFFICULTY_LABELS[key] : String(value);
}

interface SlotRowProps {
  slot: CampaignQuestionSlot;
  index: number;
  userEmailMap: Record<string, string>;
  onEdit: (slot: CampaignQuestionSlot, index: number) => void;
  onDelete: (slot: CampaignQuestionSlot, index: number) => void;
}

function SlotRow({ slot, index, userEmailMap, onEdit, onDelete }: SlotRowProps) {
  const { t } = useTranslation();
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors group">
      <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{index + 1}</td>
      <td className="px-4 py-3 text-sm">
        <Badge variant="outline" className={STATUS_CLASS[slot.status]}>
          {t(`campaigns.status.${slot.status}`)}
        </Badge>
      </td>
      <td className="px-4 py-3 text-sm">{slot.subjectName}</td>
      <td className="px-4 py-3 text-sm">{slot.topicName}</td>
      <td className="px-4 py-3 text-sm text-center">
        {difficultyLabel(slot.difficulty)}
      </td>
      <td className="px-4 py-3 text-sm">
        <span className="text-xs">{userEmailMap[slot.assigneeId] ?? slot.assigneeId}</span>
      </td>
      <td className="px-4 py-3 text-sm">
        <span className="text-xs">{userEmailMap[slot.revisorId] ?? slot.revisorId}</span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {slot.dueDate ? new Date(slot.dueDate).toLocaleDateString() : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onEdit(slot, index)}
            title={t('common.edit')}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(slot, index)}
            title={t('common.delete')}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

function SlotRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      {Array.from({ length: 9 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

export function CampaignDetailPage() {
  const { t } = useTranslation();
  const { campaignId } = Route.useParams();
  const client = useApiClient();
  const queryClient = useQueryClient();
  const { data: campaign, isLoading, error } = useCampaignDetail(campaignId);
  const { reviewers } = useReviewerList();

  // Filter state
  const [filters, setFilters] = useState<CampaignDetailFiltersState>(EMPTY_CAMPAIGN_FILTERS);

  // Sheet state — null = closed, undefined slot = add mode, defined slot = edit mode
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ slot: CampaignQuestionSlot; index: number } | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<{ slot: CampaignQuestionSlot; index: number } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const userEmailMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const u of reviewers) {
      if (u.email) map[u._id] = u.email;
    }
    return map;
  }, [reviewers]);

  const allSlots = campaign?.questions ?? [];
  const filteredSlots = useMemo(() => applyFilters(allSlots, filters), [allSlots, filters]);

  const total = campaign?.totalQuestions ?? 0;
  const remaining = campaign?.remainingQuestions ?? 0;
  const doneCount = total - remaining;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const isFull = total > 0 && doneCount === total;

  function currentSlots(): NewCampaignQuestionSlot[] {
    return (campaign?.questions ?? []).map(({ id: _id, ...rest }) => rest);
  }

  async function handleAddSlot(newSlot: NewCampaignQuestionSlot) {
    await campaignsService.update(client, campaignId, {
      questions: [...currentSlots(), newSlot],
    });
    await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(campaignId) });
  }

  async function handleEditSlot(updatedSlot: NewCampaignQuestionSlot, index: number) {
    const slots = currentSlots();
    slots[index] = updatedSlot;
    await campaignsService.update(client, campaignId, { questions: slots });
    await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(campaignId) });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const slots = currentSlots();
      slots.splice(deleteTarget.index, 1);
      await campaignsService.update(client, campaignId, { questions: slots });
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(campaignId) });
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setDeleting(false);
    }
  }

  function openAdd() {
    setEditTarget(null);
    setSheetOpen(true);
  }

  function openEdit(slot: CampaignQuestionSlot, index: number) {
    setEditTarget({ slot, index });
    setSheetOpen(true);
  }

  function closeSheet(v: boolean) {
    if (!v) {
      setSheetOpen(false);
      setEditTarget(null);
    }
  }

  // The key changes whenever the edit target changes (or switches to add mode),
  // forcing AddSlotSheet to remount with fresh initial state.
  const sheetKey = sheetOpen ? (editTarget?.slot.id ?? 'new') : 'closed';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/campaigns"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('campaigns.detail.back')}
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div>
          {isLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <h1 className="text-2xl font-semibold">{campaign?.name}</h1>
          )}
        </div>
        {!isLoading && campaign && (
          <div className="text-right">
            <div className="text-sm font-medium">{pct}% {t('campaigns.table.totalQuestions').toLowerCase()}</div>
            <div className={cn('text-xs tabular-nums', isFull ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground')}>
              {doneCount} / {total}
            </div>
          </div>
        )}
      </div>

      {!isLoading && campaign && (
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', isFull ? 'bg-emerald-500' : 'bg-primary')}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base">{t('campaigns.detail.slots')}</CardTitle>
          <Button
            size="sm"
            onClick={openAdd}
            disabled={isLoading || !!error}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            {t('campaigns.detail.addSlot')}
          </Button>
        </CardHeader>

        {/* Filters */}
        {!isLoading && allSlots.length > 0 && (
          <div className="px-4 pb-3 border-b">
            <CampaignDetailFilters
              slots={allSlots}
              reviewers={reviewers}
              filters={filters}
              onChange={setFilters}
            />
          </div>
        )}

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-10">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.detail.status')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.detail.subject')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.detail.topic')}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground w-28">
                    {t('campaigns.detail.difficulty')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.detail.assignee')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.detail.revisor')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.detail.dueDate')}
                  </th>
                  <th className="w-20" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <SlotRowSkeleton key={i} />)
                ) : allSlots.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      {t('campaigns.detail.noSlots')}
                    </td>
                  </tr>
                ) : filteredSlots.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      Nessuno slot corrisponde ai filtri selezionati.
                    </td>
                  </tr>
                ) : (
                  filteredSlots.map((slot, i) => (
                    <SlotRow
                      key={slot.id}
                      slot={slot}
                      index={i}
                      userEmailMap={userEmailMap}
                      onEdit={openEdit}
                      onDelete={(s, idx) => setDeleteTarget({ slot: s, index: idx })}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit sheet */}
      <AddSlotSheet
        key={sheetKey}
        open={sheetOpen}
        onOpenChange={closeSheet}
        onAdd={handleAddSlot}
        editSlot={editTarget?.slot}
        editIndex={editTarget?.index}
        onEdit={handleEditSlot}
      />

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteTarget != null}
        onOpenChange={(v) => { if (!v && !deleting) { setDeleteTarget(null); setDeleteError(null); } }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('campaigns.detail.deleteSlot.title')}</DialogTitle>
            <DialogDescription>
              {t('campaigns.detail.deleteSlot.description', {
                subject: deleteTarget?.slot.subjectName ?? '',
                topic: deleteTarget?.slot.topicName ?? '',
              })}
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
              disabled={deleting}
            >
              {t('common.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? t('common.deleting') : t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
