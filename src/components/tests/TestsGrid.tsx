import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useCan } from '@/lib/auth';
import { cn } from '@/lib/utils';
import type { Test } from '@/lib/types/tests';

interface TestsGridProps {
  data: Test[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onEdit: (test: Test) => void;
  onDelete: (test: Test) => void;
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16 mt-1" />
    </div>
  );
}

export function TestsGrid({ data, isLoading, error, onRetry, onEdit, onDelete }: TestsGridProps) {
  const canUpdate = useCan('tests', 'UPDATE');
  const canDelete = useCan('tests', 'DELETE');
  const hasActions = canUpdate || canDelete;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Nessun test trovato</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {data.map((test) => (
        <div
          key={test.id}
          className={cn(
            'group relative rounded-xl border bg-card p-5',
            'flex flex-col gap-2',
            'transition-all duration-150',
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <span className="font-semibold text-sm leading-snug">{test.name}</span>

            {hasActions && (
              <div
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1 -mt-0.5">
                      <MoreHorizontal className="h-3.5 w-3.5" />
                      <span className="sr-only">Azioni</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canUpdate && (
                      <DropdownMenuItem onClick={() => onEdit(test)}>
                        <Pencil className="h-3.5 w-3.5" />
                        Modifica
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        {canUpdate && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(test)}
                        >
                          <Trash className="h-3.5 w-3.5" />
                          Elimina
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>

          {/* Brands */}
          {test.brands.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {test.brands.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {b.name}
                </span>
              ))}
            </div>
          )}

          {/* Anno */}
          <p className="text-sm font-medium mt-auto pt-1">
            {test.year != null ? (
              <>
                {test.year}
                <span className="font-normal text-muted-foreground ml-1">anno</span>
              </>
            ) : (
              <span className="font-normal text-muted-foreground">Anno non specificato</span>
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
