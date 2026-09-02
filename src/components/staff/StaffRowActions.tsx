import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CommunityUser } from '@/lib/types/staff';

interface StaffRowActionsProps {
  user: CommunityUser;
  onChangeRole: (user: CommunityUser) => void;
  onDelete: (user: CommunityUser) => void;
  canDelete: boolean;
  currentUserCognitoId: string;
}

export function StaffRowActions({
  user,
  onChangeRole,
  onDelete,
  canDelete,
  currentUserCognitoId,
}: StaffRowActionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const isSelf = !!currentUserCognitoId && user.cognitoId === currentUserCognitoId;
  if (isSelf) return <div className="h-8 w-8" aria-hidden="true" />;

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
          onSelect={() => {
            setOpen(false);
            onChangeRole(user);
          }}
        >
          <Pencil />
          {t('staff.actions.editRoles')}
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => {
              setOpen(false);
              onDelete(user);
            }}
          >
            <Trash />
            {t('staff.actions.delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
