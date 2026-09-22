import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Route } from '@/routes/_authenticated/questions';
import { useApiClient } from '@/lib/api/useApiClient';
import { useCan } from '@/lib/auth';
import { useQuestionsList } from '@/lib/hooks/useQuestionsList';
import { useBulkSelection } from '@/lib/hooks/useBulkSelection';
import { useQuestionAssociations } from '@/lib/hooks/useQuestionAssociations';
import { questionsService } from '@/lib/services/questions';
import { Button } from '@/components/ui/button';
import {
  toQuestionsFilterQuery,
  type QuestionListItem,
  type QuestionsListFilters as FiltersType,
} from '@/lib/types/questions';
import { QuestionsListFilters } from './QuestionsListFilters';
import { QuestionsListTable } from './QuestionsListTable';
import { QuestionsListPagination } from './QuestionsListPagination';
import { QuestionsViewDialog } from './QuestionsViewDialog';
import { QuestionsDeleteDialog } from './QuestionsDeleteDialog';
import { QuestionsBulkToolbar } from './QuestionsBulkToolbar';
import { QuestionsBulkDeleteDialog } from './QuestionsBulkDeleteDialog';
import { QuestionsExportDialog } from './QuestionsExportDialog';
import { QuestionsAddToCollectionDialog } from './QuestionsAddToCollectionDialog';
import { AddQuestionDialog } from './AddQuestionDialog';
import { parseIdsCsv, CsvMissingColumnError } from '@/lib/export/parseIdsCsv';

const PER_PAGE = 20;

export function QuestionsListPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const canCreate = useCan('questions', 'CREATE');
  // Adding questions to a collection writes to the collection, not to the questions.
  const canUpdateCollections = useCan('collections', 'UPDATE');

  const parseCSV = (v: string | undefined): string[] => (v ? v.split(',').filter(Boolean) : []);

  const filters: FiltersType = useMemo(
    () => ({
      materias: parseCSV(search.materias),
      argomenti: parseCSV(search.argomenti),
      difficulties: parseCSV(search.difficulties) as FiltersType['difficulties'],
      languages: parseCSV(search.languages) as FiltersType['languages'],
      statuses: parseCSV(search.statuses) as FiltersType['statuses'],
      types: parseCSV(search.types) as FiltersType['types'],
      authors: parseCSV(search.authors),
      tags: parseCSV(search.tags),
      collectionIds: parseCSV(search.collectionIds),
      collectionIdsMode: search.collectionIdsMode ?? 'include',
      poolIds: parseCSV(search.poolIds),
      poolIdsMode: search.poolIdsMode ?? 'include',
      dateFrom: search.dateFrom ?? '',
      dateTo: search.dateTo ?? '',
      unpublished: search.unpublished ?? false,
      search: search.search ?? '',
      page: search.page ?? 1,
    }),
    [
      search.materias,
      search.argomenti,
      search.difficulties,
      search.languages,
      search.statuses,
      search.types,
      search.authors,
      search.tags,
      search.collectionIds,
      search.collectionIdsMode,
      search.poolIds,
      search.poolIdsMode,
      search.dateFrom,
      search.dateTo,
      search.unpublished,
      search.search,
      search.page,
    ]
  );

  const { data, total, isLoading, error, refetch, deleteQuestion } = useQuestionsList(filters);
  const pageIds = data.map((q) => q.id);
  const associations = useQuestionAssociations(pageIds);

  const bulk = useBulkSelection();

  const [viewTarget, setViewTarget] = useState<QuestionListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionListItem | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false);
  const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);

  const updateFilters = (patch: Partial<FiltersType>) => {
    const next = { ...filters, ...patch };
    if (!('page' in patch)) {
      next.page = 1;
    }
    if (bulk.isBulkMode) bulk.clearSelection();
    navigate({
      to: '/questions',
      search: {
        materias: next.materias.join(',') || undefined,
        argomenti: next.argomenti.join(',') || undefined,
        difficulties: next.difficulties.join(',') || undefined,
        languages: next.languages.join(',') || undefined,
        statuses: next.statuses.join(',') || undefined,
        types: next.types.join(',') || undefined,
        authors: next.authors.join(',') || undefined,
        tags: next.tags.join(',') || undefined,
        collectionIds: next.collectionIds.join(',') || undefined,
        collectionIdsMode: next.collectionIdsMode === 'exclude' ? 'exclude' : undefined,
        poolIds: next.poolIds.join(',') || undefined,
        poolIdsMode: next.poolIdsMode === 'exclude' ? 'exclude' : undefined,
        dateFrom: next.dateFrom || undefined,
        dateTo: next.dateTo || undefined,
        unpublished: next.unpublished || undefined,
        search: next.search || undefined,
        page: next.page === 1 ? undefined : next.page,
      },
      replace: true,
    });
  };

  const handleResetFilters = () => {
    updateFilters({
      materias: [],
      argomenti: [],
      difficulties: [],
      languages: [],
      statuses: [],
      types: [],
      authors: [],
      tags: [],
      collectionIds: [],
      collectionIdsMode: 'include',
      poolIds: [],
      poolIdsMode: 'include',
      dateFrom: '',
      dateTo: '',
      unpublished: false,
      search: '',
    });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleView = (question: QuestionListItem) => {
    setViewTarget(question);
  };

  const handleCopyId = async (question: QuestionListItem) => {
    try {
      await navigator.clipboard.writeText(question.id);
      toast.success(t('questions.toasts.idCopied'));
    } catch {
      toast.error(t('questions.toasts.copyError'));
    }
  };

  const handleEdit = (question: QuestionListItem) => {
    navigate({
      to: '/questions/$questionId',
      params: { questionId: question.id },
      search: { review: undefined },
    });
  };

  const handleDeleteConfirm = async (question: QuestionListItem) => {
    try {
      await deleteQuestion(question.id);
      setDeleteTarget(null);
      toast.success(t('questions.toasts.removeSuccess'));
    } catch {
      setDeleteTarget(null);
      toast.error(t('questions.toasts.removeInProgress'), {
        action: {
          label: t('common.retry'),
          onClick: () => setDeleteTarget(question),
        },
      });
    }
  };

  const handleTogglePage = () => {
    if (bulk.isPageFullySelected(pageIds)) {
      bulk.deselectPage(pageIds);
    } else {
      bulk.selectPage(pageIds);
    }
  };

  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const { selectPage, selectAll } = bulk;
  const handleSelectAll = useCallback(async () => {
    setIsSelectingAll(true);
    try {
      const {
        ids,
        total: allTotal,
        truncated,
      } = await questionsService.getAllFilteredIds(apiClient, toQuestionsFilterQuery(filters));
      selectPage(ids);
      selectAll(ids.length);
      if (truncated) {
        toast.warning(
          t('questions.toasts.selectAllTruncated', { count: ids.length, total: allTotal })
        );
      }
    } catch {
      toast.error(t('common.error'));
    } finally {
      setIsSelectingAll(false);
    }
  }, [apiClient, filters, selectPage, selectAll, t]);

  const handleBulkDeleteConfirm = async () => {
    const ids = [...bulk.selectedIds];
    try {
      const result = await questionsService.bulkDelete(apiClient, ids);
      setShowBulkDeleteDialog(false);
      bulk.clearSelection();
      refetch();
      if (result.failed.length > 0) {
        toast.error(t('questions.toasts.bulkRemoveFailed', { count: result.failed.length }), {
          action: { label: t('common.retry'), onClick: () => setShowBulkDeleteDialog(true) },
        });
      } else {
        toast.success(t('questions.toasts.bulkRemove', { count: result.deleted }));
      }
    } catch {
      setShowBulkDeleteDialog(false);
      toast.error(t('questions.toasts.bulkRemoveError'), {
        action: { label: t('common.retry'), onClick: () => setShowBulkDeleteDialog(true) },
      });
    }
  };

  const handleImportCsv = async (file: File) => {
    try {
      const text = await file.text();
      const ids = parseIdsCsv(text);
      if (ids.length === 0) {
        toast.error(t('questions.toasts.importEmpty'));
        return;
      }
      if (!bulk.isBulkMode) bulk.toggleBulkMode();
      bulk.setSelection(ids);
      toast.success(t('questions.toasts.importSuccess', { count: ids.length }));
    } catch (e) {
      if (e instanceof CsvMissingColumnError) {
        toast.error(t('questions.toasts.importMissingColumn'));
        return;
      }
      toast.error(t('questions.toasts.importError'));
    }
  };

  const hasFilters =
    filters.materias.length > 0 ||
    filters.argomenti.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.languages.length > 0 ||
    filters.statuses.length > 0 ||
    filters.types.length > 0 ||
    filters.authors.length > 0 ||
    filters.tags.length > 0 ||
    filters.collectionIds.length > 0 ||
    filters.poolIds.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    filters.unpublished ||
    !!filters.search;

  const showSelectAllBanner =
    bulk.isBulkMode && bulk.isPageFullySelected(pageIds) && data.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 pb-6 pt-0 space-y-6">
        {/* z-30: sopra il thead sticky (z-10), sotto i portali di Radix (z-50) — altrimenti
            il backdrop-blur si mangia dropdown, dialog e popover. */}
        <div className="flex items-center p-6 backdrop-blur-lg z-30 justify-between sticky top-0">
          <div>
            <h1 className="text-2xl font-semibold">Domande</h1>
            <p className="text-sm text-muted-foreground">Gestisci le domande del catalogo</p>
          </div>
          <div className="flex items-center gap-2">
            <QuestionsBulkToolbar
              isBulkMode={bulk.isBulkMode}
              selectedCount={bulk.selectedCount}
              onToggleBulkMode={bulk.toggleBulkMode}
              onExport={() => setShowExportDialog(true)}
              onImportCsv={handleImportCsv}
              onBulkDelete={() => setShowBulkDeleteDialog(true)}
              onAddToCollection={() => setShowAddToCollectionDialog(true)}
              canAddToCollection={canUpdateCollections}
              isExporting={false}
            />
            {canCreate && (
              <Button variant="outline" onClick={() => navigate({ to: '/questions/import' })}>
                <Upload className="h-4 w-4 mr-2" />
                Importa CSV
              </Button>
            )}
            {canCreate && (
              <Button onClick={() => setShowAddQuestionDialog(true)}>
                <Plus className="h-4 w-4" />
                {t('questions.createBtn')}
              </Button>
            )}
          </div>
        </div>
        <div className="px-6 flex flex-col gap-6">
          <QuestionsListFilters
            filters={filters}
            onFilterChange={updateFilters}
            onReset={handleResetFilters}
          />

          <QuestionsListTable
            data={data}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            hasFilters={hasFilters}
            onResetFilters={handleResetFilters}
            onView={handleView}
            onCopyId={handleCopyId}
            onEdit={handleEdit}
            onDelete={setDeleteTarget}
            isBulkMode={bulk.isBulkMode}
            isSelected={bulk.isSelected}
            isPageFullySelected={bulk.isPageFullySelected(pageIds)}
            onToggleItem={bulk.toggleItem}
            onTogglePage={handleTogglePage}
            total={total}
            showSelectAllBanner={showSelectAllBanner}
            onSelectAll={handleSelectAll}
            isSelectingAll={isSelectingAll}
            isAllSelected={bulk.isAllSelected}
            associations={associations}
          />
        </div>

        <div className="sticky bottom-0 border-t bg-background px-6 py-4">
          <QuestionsListPagination
            page={filters.page}
            total={total}
            perPage={PER_PAGE}
            onPageChange={handlePageChange}
          />
        </div>

        <QuestionsViewDialog question={viewTarget} onClose={() => setViewTarget(null)} />

        <QuestionsDeleteDialog
          question={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />

        <QuestionsBulkDeleteDialog
          open={showBulkDeleteDialog}
          count={bulk.selectedCount}
          onConfirm={handleBulkDeleteConfirm}
          onCancel={() => setShowBulkDeleteDialog(false)}
        />

        <QuestionsExportDialog
          open={showExportDialog}
          onOpenChange={setShowExportDialog}
          questionIds={[...bulk.selectedIds]}
          count={bulk.selectedCount}
        />

        <QuestionsAddToCollectionDialog
          open={showAddToCollectionDialog}
          onOpenChange={setShowAddToCollectionDialog}
          questionIds={[...bulk.selectedIds]}
          onSuccess={bulk.clearSelection}
        />

        <AddQuestionDialog open={showAddQuestionDialog} onOpenChange={setShowAddQuestionDialog} />
      </div>
    </div>
  );
}
