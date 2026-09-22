import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useCampaignsList } from '@/lib/hooks/useCampaignsList';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { queryKeys } from '@/lib/query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { CreateCampaignDialog } from './CreateCampaignDialog';
import { EditCampaignDialog } from './EditCampaignDialog';
import type { Campaign } from '@/lib/types/campaigns';

const PAGE_SIZE = 20;

function ProgressBar({ total, remaining }: { total: number; remaining: number }) {
  const done = total - remaining;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isFull = total > 0 && done === total;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            isFull ? 'bg-emerald-500' : 'bg-primary'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          'text-xs tabular-nums',
          isFull ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground'
        )}
      >
        {done}/{total}
      </span>
    </div>
  );
}

interface CampaignRowProps {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (campaign: Campaign) => void;
}

function CampaignRow({ campaign, onEdit, onDelete }: CampaignRowProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <tr
      className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors group"
      onClick={() =>
        navigate({ to: '/campaigns/$campaignId', params: { campaignId: campaign.id } })
      }
    >
      <td className="px-4 py-3">
        <div className="font-medium text-sm">{campaign.name}</div>
        <div className="text-xs text-muted-foreground font-mono">{campaign.id}</div>
      </td>
      <td className="px-4 py-3 w-48">
        <ProgressBar total={campaign.totalQuestions} remaining={campaign.remainingQuestions} />
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {new Date(campaign.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3 w-12 text-right" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">{t('common.actions')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(campaign)}>
              <Pencil className="h-4 w-4 mr-2" />
              {t('common.edit')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(campaign)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}

function CampaignRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-48 mb-1" />
        <Skeleton className="h-3 w-32" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-2 w-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3" />
    </tr>
  );
}

export function CampaignsPage() {
  const { t } = useTranslation();
  const client = useApiClient();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState<Campaign | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, total, isLoading, error, refetch } = useCampaignsList(page, search || undefined);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await campaignsService.delete(client, deleteTarget.id);
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t('campaigns.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('campaigns.subtitle')}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('campaigns.create')}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('campaigns.searchPlaceholder')}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            {t('common.search')}
          </Button>
        </form>
        <Button variant="ghost" size="icon" onClick={() => refetch()} title={t('common.retry')}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {error ? (
            <div className="p-8 text-center text-sm text-destructive">{error}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.table.name')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-48">
                    {t('campaigns.table.totalQuestions')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('campaigns.table.createdAt')}
                  </th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => <CampaignRowSkeleton key={i} />)
                ) : data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      {search ? t('campaigns.noResultsFiltered') : t('campaigns.noResults')}
                    </td>
                  </tr>
                ) : (
                  data.map((c) => (
                    <CampaignRow
                      key={c.id}
                      campaign={c}
                      onEdit={setEditTarget}
                      onDelete={setDeleteTarget}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('common.pagination', { page, totalPages, total })}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditCampaignDialog
        campaign={editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget != null}
        onOpenChange={(v) => {
          if (!v && !deleting) {
            setDeleteTarget(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('campaigns.deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('campaigns.deleteDialog.description', { name: deleteTarget?.name ?? '' })}
            </DialogDescription>
          </DialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteTarget(null);
                setDeleteError(null);
              }}
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
