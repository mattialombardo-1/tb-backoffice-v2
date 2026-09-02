import { useTranslation } from 'react-i18next';
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
import { cn } from '@/lib/utils';
import type { Sku } from '@/lib/types/skus';
import { SkusRowActions } from './SkusRowActions';

interface SkusTableProps {
  data: Sku[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (sku: Sku) => void;
  onDelete: (sku: Sku) => void;
  // bulk
  isSelected: (id: string) => boolean;
  isPageFullySelected: boolean;
  onToggleItem: (id: string) => void;
  onTogglePage: () => void;
}

const COLS = 5;

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

export function SkusTable({
  data,
  isLoading,
  error,
  onRetry,
  onEdit,
  onDelete,
  isSelected,
  isPageFullySelected,
  onToggleItem,
  onTogglePage,
}: SkusTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox
                checked={isPageFullySelected && data.length > 0}
                onCheckedChange={onTogglePage}
                aria-label={t('packages.skuTable.selectAll')}
              />
            </TableHead>
            <TableHead>{t('packages.skuTable.name')}</TableHead>
            <TableHead>{t('packages.skuTable.code')}</TableHead>
            <TableHead>{t('packages.skuTable.brand')}</TableHead>
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
              <TableCell
                colSpan={COLS}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {t('packages.noSkus')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((sku) => (
              <TableRow key={sku.id} className={cn(isSelected(sku.id) && 'bg-muted/50')}>
                <TableCell>
                  <Checkbox
                    checked={isSelected(sku.id)}
                    onCheckedChange={() => onToggleItem(sku.id)}
                    aria-label={t('packages.skuTable.select', { name: sku.name })}
                  />
                </TableCell>
                <TableCell className="font-medium">{sku.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {sku.code}
                </TableCell>
                <TableCell>
                  {sku.brands.length === 0 ? (
                    <span className="text-xs text-muted-foreground italic">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {sku.brands.map((b) => (
                        <Badge key={b.id} variant="secondary">
                          {b.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <SkusRowActions sku={sku} onEdit={onEdit} onDelete={onDelete} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
