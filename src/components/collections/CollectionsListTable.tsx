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
import { InlineTagsCombobox } from '@/components/ui/inline-tags-combobox';
import { cn, formatDate } from '@/lib/utils';
import type { Collection, Tag } from '@/lib/types/collections';
import { COLLECTION_STATUS_LABELS, COLLECTION_TYPE_LABELS } from '@/lib/types/collections';
import { CollectionsListRowActions } from './CollectionsListRowActions';
import { CopyableId } from '../questions';

const STATUS_CONFIG: Record<string, { badgeClass: string; dotClass: string }> = {
  ACTIVE: {
    badgeClass:
      'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    dotClass: 'bg-emerald-500 dark:bg-emerald-400',
  },
  DRAFT: {
    badgeClass:
      'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
    dotClass: 'bg-zinc-400',
  },
  INACTIVE: {
    badgeClass:
      'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
    dotClass: 'bg-zinc-400',
  },
};

const TYPE_CONFIG: Record<string, { badgeClass: string }> = {
  SIMULAZIONE: {
    badgeClass:
      'border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  RACCOLTA: {
    badgeClass:
      'border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
  },
  PERSONALIZZATA: {
    badgeClass:
      'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
};

const COLUMNS = 9;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

interface CollectionsListTableProps {
  data: Collection[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  archived: boolean;
  onResetFilters: () => void;
  onEdit: (collection: Collection) => void;
  onDuplicate: (collection: Collection) => void;
  onArchiveToggle: (collection: Collection) => void;
  allTags: Tag[];
  onUpdateTags: (collectionId: string, tags: Tag[]) => Promise<void>;
  onCreateTag: (value: string) => Promise<Tag>;
  selectedIds: Set<string>;
  onToggleRow: (collectionId: string) => void;
  onToggleAll: (checked: boolean) => void;
}

export function CollectionsListTable({
  data,
  isLoading,
  error,
  onRetry,
  hasFilters,
  archived,
  onResetFilters,
  onEdit,
  onDuplicate,
  onArchiveToggle,
  allTags,
  onUpdateTags,
  onCreateTag,
  selectedIds,
  onToggleRow,
  onToggleAll,
}: CollectionsListTableProps) {
  const allSelected = data.length > 0 && data.every((c) => selectedIds.has(c.id));
  const someSelected = data.some((c) => selectedIds.has(c.id));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={(checked) => onToggleAll(checked === true)}
                aria-label="Seleziona tutte le collezioni in questa pagina"
                disabled={data.length === 0}
              />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-[140px]">Tipo</TableHead>
            <TableHead className="w-[180px]">Test</TableHead>
            <TableHead className="w-[140px]">Stato</TableHead>
            <TableHead className="w-[100px]">Domande</TableHead>
            <TableHead className="w-[220px]">Tag</TableHead>
            <TableHead className="w-[120px]">Aggiornata il</TableHead>
            <TableHead className="w-[50px]">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="text-center py-8">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Riprova
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {hasFilters
                    ? 'Nessuna collezione trovata con i filtri selezionati.'
                    : archived
                      ? 'Nessuna collezione archiviata.'
                      : 'Nessuna collezione presente.'}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={onResetFilters}>
                    Rimuovi filtri
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((collection) => {
              const statusConfig = STATUS_CONFIG[collection.status] ?? STATUS_CONFIG['DRAFT'];
              const typeConfig = TYPE_CONFIG[collection.type] ?? {};
              const statusLabel = COLLECTION_STATUS_LABELS[collection.status] ?? collection.status;
              const typeLabel = COLLECTION_TYPE_LABELS[collection.type] ?? collection.type;

              return (
                <TableRow key={collection.id} className="group">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(collection.id)}
                      onCheckedChange={() => onToggleRow(collection.id)}
                      aria-label={`Seleziona ${collection.name}`}
                    />
                  </TableCell>
                  <TableCell><CopyableId id={collection.id}/></TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{collection.name}</span>
                  </TableCell>
                  <TableCell>
                    {collection.type ? (
                      <Badge
                        variant="outline"
                        className={cn(typeConfig.badgeClass)}
                      >
                        {typeLabel}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {(collection.tests || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {collection.tests.map((t) => (
                          <Badge key={t.id} variant="outline" className="text-xs font-normal">
                            {t.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {collection.status ? (
                      <Badge
                        variant="outline"
                        className={cn('inline-flex items-center gap-1.5', statusConfig.badgeClass)}
                      >
                        <span
                          className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusConfig.dotClass)}
                        />
                        {statusLabel}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm tabular-nums">{collection.questionCount}</span>
                  </TableCell>
                  <TableCell>
                    <InlineTagsCombobox
                      selectedTags={collection.tags}
                      allTags={allTags}
                      onChange={(newTags) => onUpdateTags(collection.id, newTags)}
                      onCreateTag={onCreateTag}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {collection.updatedAt ? formatDate(collection.updatedAt) : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CollectionsListRowActions
                      collection={collection}
                      archived={archived}
                      onEdit={onEdit}
                      onDuplicate={onDuplicate}
                      onArchiveToggle={onArchiveToggle}
                    />
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
