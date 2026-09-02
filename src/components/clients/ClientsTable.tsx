import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Client } from '@/lib/types/clients';
import { ClientsRowActions } from './ClientsRowActions';
import { CopyableId } from '../questions';

interface ClientsTableProps {
  data: Client[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onViewOrders: (client: Client) => void;
  onImpersonate: (client: Client) => void;
  onPromoteToStaff: (client: Client) => void;
  onDelete: (client: Client) => void;
}

type SortKey = 'name' | 'surname' | 'email' | 'id';
type SortDir = 'asc' | 'desc';

const COLUMNS = 5;

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

interface SortableHeadProps {
  label: string;
  sortKey: SortKey;
  current: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortableHead({ label, sortKey, current, dir, onSort }: SortableHeadProps) {
  const active = current === sortKey;
  const Icon = active ? (dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;

  return (
    <TableHead>
      <button
        className={cn(
          'flex items-center gap-1 text-sm font-medium hover:text-foreground transition-colors',
          active ? 'text-foreground' : 'text-muted-foreground'
        )}
        onClick={() => onSort(sortKey)}
      >
        {label}
        <Icon className="h-3.5 w-3.5 shrink-0" />
      </button>
    </TableHead>
  );
}

function sortData(data: Client[], key: SortKey | null, dir: SortDir): Client[] {
  if (!key) return data;
  return [...data].sort((a, b) => {
    const av = (a[key] ?? '').toLowerCase();
    const bv = (b[key] ?? '').toLowerCase();
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

export function ClientsTable({
  data,
  isLoading,
  error,
  onRetry,
  onViewOrders,
  onImpersonate,
  onPromoteToStaff,
  onDelete,
}: ClientsTableProps) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortData(data, sortKey, sortDir);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead label={t('clients.table.id')} sortKey="id" current={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHead label={t('clients.table.email')} sortKey="email" current={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHead label={t('clients.table.name')} sortKey="name" current={sortKey} dir={sortDir} onSort={handleSort} />
            <SortableHead label={t('clients.table.surname')} sortKey="surname" current={sortKey} dir={sortDir} onSort={handleSort} />
            <TableHead className="w-12.5" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-24 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : sorted.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {t('clients.noResults')}
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((client) => (
              <TableRow key={client.id} className="group">
                <TableCell><CopyableId id={client.cognitoId} /></TableCell>
                <TableCell>{client.email || '—'}</TableCell>
                <TableCell>{client.name || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>{client.surname || <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <ClientsRowActions
                    client={client}
                    onViewOrders={onViewOrders}
                    onImpersonate={onImpersonate}
                    onPromoteToStaff={onPromoteToStaff}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
