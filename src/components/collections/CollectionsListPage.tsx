import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { FileDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Route } from '@/routes/_authenticated/collections';
import { useCollectionsList } from '@/lib/hooks/useCollectionsList';
import { useTags } from '@/lib/hooks/useTags';
import { useApiClient } from '@/lib/api/useApiClient';
import { collectionsService } from '@/lib/services/collections';
import { tagsService, COLLECTIONS_TAG_RESOURCE } from '@/lib/services/tags';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListPagination } from '@/components/ui/list-pagination';
import type { CollectionFilters, Tag } from '@/lib/types/collections';
import type { Collection } from '@/lib/types/collections';
import { CollectionsListFilters } from './CollectionsListFilters';
import { CollectionsListTable } from './CollectionsListTable';
import { CollectionDuplicateDialog } from './CollectionDuplicateDialog';
import { CollectionArchiveDialog } from './CollectionArchiveDialog';
import { CollectionExportDialog } from './CollectionExportDialog';

const PER_PAGE = 20;
type TabValue = 'active' | 'archived';

export function CollectionsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const client = useApiClient();

  const activeTab: TabValue = search.tab === 'archived' ? 'archived' : 'active';
  const archived = activeTab === 'archived';

  const parseCSV = (v: string | undefined): string[] => (v ? v.split(',').filter(Boolean) : []);

  const filters: CollectionFilters = useMemo(
    () => ({
      collectionId: search.collectionId ?? '',
      search: search.search ?? '',
      statuses: parseCSV(search.statuses),
      type: search.type ?? '',
      tests: parseCSV(search.tests),
      tags: parseCSV(search.tags),
      tagsMode: search.tagsMode ?? 'OR',
      page: search.page ?? 1,
      archived,
    }),
    [
      search.collectionId,
      search.search,
      search.statuses,
      search.type,
      search.tests,
      search.tags,
      search.tagsMode,
      search.page,
      archived,
    ]
  );

  const { data, total, isLoading, error, refetch } = useCollectionsList(filters);
  const { tags: fetchedTags } = useTags();
  const [extraTags, setExtraTags] = useState<Tag[]>([]);
  const allTags = useMemo(
    () => [...fetchedTags, ...extraTags.filter((e) => !fetchedTags.some((f) => f.id === e.id))],
    [fetchedTags, extraTags]
  );

  const [duplicateTarget, setDuplicateTarget] = useState<Collection | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Collection | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleToggleRow = (collectionId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) next.delete(collectionId);
      else next.add(collectionId);
      return next;
    });
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) data.forEach((c) => next.add(c.id));
      else data.forEach((c) => next.delete(c.id));
      return next;
    });
  };

  const updateFilters = (patch: Partial<CollectionFilters>) => {
    const next = { ...filters, ...patch };
    if (!('page' in patch)) {
      next.page = 1;
    }
    navigate({
      to: '/collections',
      search: {
        tab: archived ? 'archived' : undefined,
        collectionId: next.collectionId || undefined,
        search: next.search || undefined,
        statuses: next.statuses.join(',') || undefined,
        type: next.type || undefined,
        tests: next.tests.join(',') || undefined,
        tags: next.tags.join(',') || undefined,
        tagsMode: next.tagsMode === 'AND' ? 'AND' : undefined,
        page: next.page === 1 ? undefined : next.page,
      },
      replace: true,
    });
  };

  const switchTab = (tab: TabValue) => {
    navigate({
      to: '/collections',
      search: { tab: tab === 'archived' ? 'archived' : undefined },
    });
  };

  const handleResetFilters = () => {
    updateFilters({ collectionId: '', search: '', statuses: [], type: '', tests: [], tags: [], tagsMode: 'OR' });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleEdit = (collection: Collection) => {
    navigate({ to: '/collections/create', search: { collectionId: collection.id } });
  };

  const handleDuplicate = (collection: Collection) => {
    setDuplicateTarget(collection);
  };

  const handleArchiveToggle = (collection: Collection) => {
    setArchiveTarget(collection);
  };

  const handleCreateTag = async (value: string): Promise<Tag> => {
    const newTag = await tagsService.create(client, COLLECTIONS_TAG_RESOURCE, value);
    setExtraTags((prev) => [...prev, newTag]);
    return newTag;
  };

  const handleUpdateTags = async (collectionId: string, tags: Tag[]): Promise<void> => {
    try {
      await collectionsService.updateTags(client, collectionId, tags);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Impossibile aggiornare i tag della collezione'
      );
      throw err;
    }
  };

  const handleArchiveConfirm = async (collection: Collection) => {
    setArchiving(true);
    try {
      await collectionsService.setArchived(client, collection.id, !archived);
      toast.success(
        archived
          ? `Collezione «${collection.name}» ripristinata`
          : `Collezione «${collection.name}» archiviata`
      );
      setArchiveTarget(null);
      refetch();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : archived
            ? 'Impossibile ripristinare la collezione'
            : 'Impossibile archiviare la collezione'
      );
    } finally {
      setArchiving(false);
    }
  };

  const hasFilters =
    !!filters.collectionId ||
    !!filters.search ||
    filters.statuses.length > 0 ||
    !!filters.type ||
    filters.tests.length > 0 ||
    filters.tags.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Collezioni</h1>
            <p className="text-sm text-muted-foreground">Gestisci le collezioni di domande</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                Deseleziona ({selectedIds.size})
              </Button>
            )}
            <Button variant="outline" onClick={() => setExportOpen(true)}>
              <FileDown className="h-4 w-4 mr-2" />
              {selectedIds.size > 0
                ? `Esporta ${selectedIds.size} selezionat${selectedIds.size === 1 ? 'a' : 'e'}`
                : `Esporta ${total} ${total === 1 ? 'collezione' : 'collezioni'}`}
            </Button>
            <Button onClick={() => navigate({ to: '/collections/create' })}>
              <Plus className="h-4 w-4 mr-2" />
              Nuova collezione
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => switchTab(v as TabValue)}>
          <TabsList>
            <TabsTrigger value="active">Attive</TabsTrigger>
            <TabsTrigger value="archived">Archiviate</TabsTrigger>
          </TabsList>
        </Tabs>

        <CollectionsListFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={handleResetFilters}
        />

        <CollectionsListTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          hasFilters={hasFilters}
          archived={archived}
          onResetFilters={handleResetFilters}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onArchiveToggle={handleArchiveToggle}
          allTags={allTags}
          onUpdateTags={handleUpdateTags}
          onCreateTag={handleCreateTag}
          selectedIds={selectedIds}
          onToggleRow={handleToggleRow}
          onToggleAll={handleToggleAll}
        />
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <ListPagination
          page={filters.page}
          total={total}
          perPage={PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

      <CollectionDuplicateDialog
        collection={duplicateTarget}
        open={duplicateTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null);
        }}
        onDuplicated={refetch}
      />

      <CollectionArchiveDialog
        collection={archiveTarget}
        archived={archived}
        isLoading={archiving}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveTarget(null)}
      />

      <CollectionExportDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        mode="bulk"
        filters={filters}
        collectionIds={selectedIds.size > 0 ? [...selectedIds] : undefined}
        count={selectedIds.size > 0 ? selectedIds.size : total}
      />
    </div>
  );
}
