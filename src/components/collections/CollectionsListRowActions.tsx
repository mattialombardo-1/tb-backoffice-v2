import { useState } from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Collection } from '@/lib/types/collections';

export function CollectionsListRowActions({
  collection,
  archived,
  onEdit,
  onDuplicate,
  onArchiveToggle,
}: {
  collection: Collection;
  archived: boolean;
  onEdit: (collection: Collection) => void;
  onDuplicate: (collection: Collection) => void;
  onArchiveToggle: (collection: Collection) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
          <span className="sr-only">Azioni</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onEdit(collection);
          }}
        >
          Modifica
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onDuplicate(collection);
          }}
        >
          Duplica
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onArchiveToggle(collection);
          }}
          className={archived ? undefined : 'text-destructive focus:text-destructive'}
        >
          {archived ? 'Ripristina' : 'Archivia'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
