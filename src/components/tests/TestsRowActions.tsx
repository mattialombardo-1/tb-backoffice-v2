import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCan } from '@/lib/auth';
import type { Test } from '@/lib/types/tests';

interface TestsRowActionsProps {
  test: Test;
  onEdit: (test: Test) => void;
  onDelete: (test: Test) => void;
}

export function TestsRowActions({ test, onEdit, onDelete }: TestsRowActionsProps) {
  const [open, setOpen] = useState(false);
  const canUpdate = useCan('tests', 'UPDATE');
  const canDelete = useCan('tests', 'DELETE');

  if (!canUpdate && !canDelete) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Azioni</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onEdit(test);
            }}
          >
            <Pencil />
            Modifica
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            {canUpdate && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setOpen(false);
                onDelete(test);
              }}
            >
              <Trash />
              Elimina
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
