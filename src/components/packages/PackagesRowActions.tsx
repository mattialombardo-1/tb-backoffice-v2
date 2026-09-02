import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Package } from '@/lib/types/packages';

interface PackagesRowActionsProps {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDuplicate: (pkg: Package) => void;
  onDelete: (pkg: Package) => void;
}

export function PackagesRowActions({
  pkg,
  onEdit,
  onDuplicate,
  onDelete,
}: PackagesRowActionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('common.actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onEdit(pkg);
          }}
        >
          <Pencil />
          {t('common.edit')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onDuplicate(pkg);
          }}
        >
          <Copy />
          {t('common.duplicate')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            setOpen(false);
            onDelete(pkg);
          }}
        >
          <Trash />
          {t('common.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
