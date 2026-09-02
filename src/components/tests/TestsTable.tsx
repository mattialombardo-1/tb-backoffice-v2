import { Badge } from '@/components/ui/badge';
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
import { useCan } from '@/lib/auth';
import type { Test } from '@/lib/types/tests';
import { TestsRowActions } from './TestsRowActions';

interface TestsTableProps {
  data: Test[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters: boolean;
  onResetFilters: () => void;
  onEdit: (test: Test) => void;
  onDelete: (test: Test) => void;
}

function SkeletonRows({ cols }: { cols: number }) {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: cols }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function TestsTable({
  data,
  isLoading,
  error,
  onRetry,
  hasFilters,
  onResetFilters,
  onEdit,
  onDelete,
}: TestsTableProps) {
  const canUpdate = useCan('tests', 'UPDATE');
  const canDelete = useCan('tests', 'DELETE');
  const hasActions = canUpdate || canDelete;
  const cols = hasActions ? 5 : 4;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="w-[80px]">Anno</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead className="w-[90px]">Materie</TableHead>
            {hasActions && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows cols={cols} />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={cols} className="text-center py-8">
                <p className="text-sm text-destructive mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={onRetry}>
                  Riprova
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={cols} className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">
                  {hasFilters ? 'Nessun test trovato con i filtri selezionati.' : 'Nessun test presente.'}
                </p>
                {hasFilters && (
                  <Button variant="outline" size="sm" onClick={onResetFilters}>
                    Rimuovi filtri
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ) : (
            data.map((test) => (
              <TableRow key={test.id} className="group">
                <TableCell className="font-medium">{test.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground tabular-nums">
                  {test.year ?? '—'}
                </TableCell>
                <TableCell>
                  {test.brands.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {test.brands.map((b) => (
                        <Badge key={b.id} variant="outline" className="text-xs font-normal">
                          {b.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-sm tabular-nums">
                  {new Set(test.syllabus.map((s) => s.baseSubject)).size || '—'}
                </TableCell>
                {hasActions && (
                  <TableCell>
                    <TestsRowActions test={test} onEdit={onEdit} onDelete={onDelete} />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
