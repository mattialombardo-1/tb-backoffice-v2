import { useTranslation } from 'react-i18next';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Subject } from '@/lib/types/subjects';

interface SubjectsRowActionsProps {
  subject: Subject;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (subject: Subject) => void;
  onDelete: (subject: Subject) => void;
}

export function SubjectsRowActions({
  subject,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: SubjectsRowActionsProps) {
  const { t } = useTranslation();

  if (!canUpdate && !canDelete) return <div className="h-8 w-8" aria-hidden="true" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('subjects.actions.actionsLabel')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canUpdate && (
          <DropdownMenuItem onSelect={() => onEdit(subject)}>
            {t('subjects.actions.edit')}
          </DropdownMenuItem>
        )}
        {canDelete && (
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onDelete(subject)}
          >
            {t('subjects.actions.delete')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
