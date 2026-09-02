import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import type { CommunityRole } from '@/lib/types/communityRoles';

interface RolesRowActionsProps {
  role: CommunityRole;
  onEdit: (role: CommunityRole) => void;
  onDelete: (role: CommunityRole) => void;
}

export function RolesRowActions({ role, onEdit, onDelete }: RolesRowActionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const canUpdate = useCan('community-roles', 'UPDATE');
  const canDelete = useCan('community-roles', 'DELETE');

  if (!canUpdate && !canDelete) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('common.actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate && (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onEdit(role);
            }}
          >
            <Pencil />
            {t('roles.actions.edit')}
          </DropdownMenuItem>
        )}
        {canDelete && (
          <>
            {canUpdate && <DropdownMenuSeparator />}
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setOpen(false);
                onDelete(role);
              }}
            >
              <Trash />
              {t('roles.actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
