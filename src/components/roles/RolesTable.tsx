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
import { useCan } from '@/lib/auth';
import type { CommunityRole } from '@/lib/types/communityRoles';
import { RolesRowActions } from './RolesRowActions';
import { RolesCapabilitiesDialog } from './RolesCapabilitiesDialog';

type SortKey = 'displayName' | 'rank';
type SortDir = 'asc' | 'desc';

const COLS = 4;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLS }).map((_, j) => (
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

function sortRoles(data: CommunityRole[], key: SortKey | null, dir: SortDir): CommunityRole[] {
  if (!key) return data;
  return [...data].sort((a, b) => {
    if (key === 'rank') {
      return dir === 'asc' ? a.rank - b.rank : b.rank - a.rank;
    }
    const av = a.displayName.toLowerCase();
    const bv = b.displayName.toLowerCase();
    if (av < bv) return dir === 'asc' ? -1 : 1;
    if (av > bv) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

interface RolesTableProps {
  data: CommunityRole[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (role: CommunityRole) => void;
  onDelete: (role: CommunityRole) => void;
}

export function RolesTable({ data, isLoading, error, onRetry, onEdit, onDelete }: RolesTableProps) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey | null>('rank');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [capRole, setCapRole] = useState<CommunityRole | null>(null);

  const canUpdate = useCan('community-roles', 'UPDATE');
  const canDelete = useCan('community-roles', 'DELETE');
  const hasActions = canUpdate || canDelete;
  const cols = COLS + (hasActions ? 1 : 0);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortRoles(data, sortKey, sortDir);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead
                label={t('roles.table.rank')}
                sortKey="rank"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <SortableHead
                label={t('roles.table.name')}
                sortKey="displayName"
                current={sortKey}
                dir={sortDir}
                onSort={handleSort}
              />
              <TableHead>{t('roles.table.description')}</TableHead>
              <TableHead>{t('roles.table.capabilities')}</TableHead>
              {hasActions && <TableHead className="w-[50px]" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SkeletonRows />
            ) : error ? (
              <TableRow>
                <TableCell colSpan={cols} className="h-24 text-center">
                  <p className="text-sm text-muted-foreground">{error}</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                    {t('common.retry')}
                  </Button>
                </TableCell>
              </TableRow>
            ) : sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={cols}
                  className="h-24 text-center text-sm text-muted-foreground"
                >
                  {t('roles.noResults')}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((role) => (
                <TableRow key={role._id}>
                  <TableCell className="font-mono text-sm w-16">{role.rank}</TableCell>
                  <TableCell className="font-medium">{role.displayName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {role.description ?? <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {role.capabilities.length === 0 ? (
                      <span className="text-muted-foreground text-sm">—</span>
                    ) : (
                      <button
                        onClick={() => setCapRole(role)}
                        className="text-sm font-medium text-primary hover:underline tabular-nums"
                      >
                        {t('roles.table.capabilitiesCount', { count: role.capabilities.length })}
                      </button>
                    )}
                  </TableCell>
                  {hasActions && (
                    <TableCell>
                      <RolesRowActions role={role} onEdit={onEdit} onDelete={onDelete} />
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RolesCapabilitiesDialog role={capRole} onClose={() => setCapRole(null)} />
    </>
  );
}
