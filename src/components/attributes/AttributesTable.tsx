import { useTranslation } from 'react-i18next';
import { Pencil, Trash2 } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import type { AttributeItem } from '@/lib/types/attributes';

interface AttributesTableProps {
  data: AttributeItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  canUpdate: boolean;
  onEdit: (item: AttributeItem, index: number) => void;
  onDelete: (index: number) => void;
}

const COLUMNS = 3;

function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function AttributesTable({
  data,
  isLoading,
  error,
  onRetry,
  canUpdate,
  onEdit,
  onDelete,
}: AttributesTableProps) {
  const { t } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="rounded-md border p-7">
        <p className="text-sm text-muted-foreground">{t('attributes.noResults')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('attributes.table.name')}</TableHead>
            <TableHead>{t('attributes.table.type')}</TableHead>
            <TableHead />
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
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {t('attributes.noResults')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, idx) => (
              <TableRow key={`${item.name}-${idx}`} className="group">
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.type ? (
                    <Badge variant="secondary">{t(`attributes.types.${item.type}`)}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {canUpdate && (
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => onEdit(item, idx)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {t('attributes.actions.edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 px-2 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(idx)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('attributes.actions.delete')}
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
