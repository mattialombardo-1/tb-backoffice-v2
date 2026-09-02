import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { useResourceNames } from '@/lib/hooks/useResourceNames';
import type { Package } from '@/lib/types/packages';
import type { ToggleField } from './PackagesToggleDialog';
import { PackagesRowActions } from './PackagesRowActions';

interface PackagesTableProps {
  data: Package[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onToggle: (pkg: Package, field: ToggleField) => void;
  onEdit: (pkg: Package) => void;
  onDuplicate: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
  // bulk selection
  isSelected: (id: string) => boolean;
  isPageFullySelected: boolean;
  onToggleItem: (id: string) => void;
  onTogglePage: () => void;
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 9 }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function NameList({
  ids,
  names,
  isLoading,
  emptyLabel,
  isPool = false,
}: {
  ids: string[];
  names: Record<string, string>;
  isLoading: boolean;
  emptyLabel: string;
  isPool?: boolean;
}) {
  const { t } = useTranslation();

  if (ids.length === 0) {
    return <span className="text-muted-foreground italic text-xs">{emptyLabel}</span>;
  }
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t('common.loading')}
      </div>
    );
  }

  const link = isPool ? '/pools/' : '/collections?collectionId=';

  return (
    <ul className="space-y-1">
      {ids.map((id) => (
        <li key={id} className="text-sm text-foreground flex items-center gap-1">
          {names[id] ?? <span className="font-mono text-xs text-muted-foreground">{id}</span>}
          <a href={`${link}${id}`} className="ml-1 text-muted-foreground hover:text-foreground">
            <ExternalLink size={14} />
          </a>
        </li>
      ))}
    </ul>
  );
}

function PackageRow({
  pkg,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  isSelected,
  onToggleItem,
}: {
  pkg: Package;
  onToggle: (pkg: Package, field: ToggleField) => void;
  onEdit: (pkg: Package) => void;
  onDuplicate: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
  isSelected: boolean;
  onToggleItem: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { names: collectionNames, isLoading: loadingCollections } = useResourceNames(
    pkg.collectionIds,
    (id) => `/collections/${id}`,
    'collections',
    open
  );
  const { names: poolNames, isLoading: loadingPools } = useResourceNames(
    pkg.poolIds,
    (id) => `/pools/${id}`,
    'pools',
    open
  );

  return (
    <Collapsible asChild open={open} onOpenChange={setOpen}>
      <>
        <CollapsibleTrigger asChild>
          <TableRow className={cn('group cursor-pointer', isSelected && 'bg-muted/50')}>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleItem(pkg.id)}
                aria-label={t('packages.packageTable.select', { name: pkg.name ?? pkg.id })}
              />
            </TableCell>
            <TableCell className="font-medium">{pkg.name ?? '—'}</TableCell>
            <TableCell className="text-muted-foreground text-sm font-mono">
              {pkg.skuCode ?? '-'}
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={pkg.active}
                onCheckedChange={() => onToggle(pkg, 'active')}
                aria-label={t('packages.packageTable.active')}
              />
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={pkg.isFree}
                onCheckedChange={() => onToggle(pkg, 'isFree')}
                aria-label={t('packages.packageTable.free')}
              />
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={pkg.timed}
                onCheckedChange={() => onToggle(pkg, 'timed')}
                aria-label={t('packages.packageTable.timed')}
              />
            </TableCell>
            <TableCell className="text-sm tabular-nums">
              <span className="text-foreground">{pkg.collectionIds.length}</span>
              <span className="text-muted-foreground"> col</span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-foreground">{pkg.poolIds.length}</span>
              <span className="text-muted-foreground"> pool</span>
            </TableCell>
            <TableCell className="text-muted-foreground">
              <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
            </TableCell>
            <TableCell onClick={(e) => e.stopPropagation()}>
              <PackagesRowActions
                pkg={pkg}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
              />
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>

        <CollapsibleContent asChild>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableCell colSpan={9} className="py-4 px-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {t('packages.packageTable.collections', { count: pkg.collectionIds.length })}
                  </p>
                  <NameList
                    ids={pkg.collectionIds}
                    names={collectionNames}
                    isLoading={loadingCollections}
                    emptyLabel={t('packages.packageTable.noCollections')}
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {t('packages.packageTable.pools', { count: pkg.poolIds.length })}
                  </p>
                  <NameList
                    isPool={true}
                    ids={pkg.poolIds}
                    names={poolNames}
                    isLoading={loadingPools}
                    emptyLabel={t('packages.packageTable.noPools')}
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  );
}

export function PackagesTable({
  data,
  isLoading,
  error,
  onRetry,
  onToggle,
  onEdit,
  onDuplicate,
  onDelete,
  isSelected,
  isPageFullySelected,
  onToggleItem,
  onTogglePage,
}: PackagesTableProps) {
  const { t } = useTranslation();
  const COLS = 9;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={isPageFullySelected && data.length > 0}
                onCheckedChange={onTogglePage}
                aria-label={t('packages.packageTable.selectAll')}
              />
            </TableHead>
            <TableHead>{t('packages.packageTable.name')}</TableHead>
            <TableHead>{t('packages.packageTable.skuCode')}</TableHead>
            <TableHead>{t('packages.packageTable.active')}</TableHead>
            <TableHead>{t('packages.packageTable.free')}</TableHead>
            <TableHead>{t('packages.packageTable.timed')}</TableHead>
            <TableHead>{t('packages.packageTable.associations')}</TableHead>
            <TableHead className="w-[30px]" />
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLS} className="h-24 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLS} className="h-24 text-center text-sm text-muted-foreground">
                {t('packages.noPackages')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((pkg) => (
              <PackageRow
                key={pkg.id}
                pkg={pkg}
                onToggle={onToggle}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                isSelected={isSelected(pkg.id)}
                onToggleItem={onToggleItem}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
