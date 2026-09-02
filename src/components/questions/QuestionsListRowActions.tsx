import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Copy, Eye, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCan } from '@/lib/auth';
import type { QuestionListItem } from '@/lib/types/questions';

// FIXME(elliot-audit-2026-05): the pre-migration gate (`canEditQuestion(role, tab)`)
// also allowed *narrow* edit on workflow tabs: `produttore + rejected` and
// `revisore + to_approve`. That tab-aware logic is dropped here — capabilities
// answer "can ever update", not "is this question in a state I can act on".
// Restoring the workflow-aware path will need BE-driven signals on the question
// itself (e.g. `assignedReviewerId === me.id`), not role-name heuristics.
export function QuestionsListRowActions({
  question,
  onView,
  onCopyId,
  onEdit,
  onDelete,
}: {
  question: QuestionListItem;
  onView: (question: QuestionListItem) => void;
  onCopyId: (question: QuestionListItem) => void;
  onEdit: (question: QuestionListItem) => void;
  onDelete: (question: QuestionListItem) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const canUpdate = useCan('questions', 'UPDATE');
  const canDelete = useCan('questions', 'DELETE');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('questions.rowActions.actions')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onView(question);
          }}
        >
          <Eye />
          {t('questions.rowActions.view')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onCopyId(question);
          }}
        >
          <Copy />
          {t('questions.rowActions.copyId')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {canUpdate ? (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onEdit(question);
            }}
          >
            <Pencil />
            {t('questions.rowActions.edit')}
          </DropdownMenuItem>
        ) : (
          <DisabledMenuItem label={t('questions.rowActions.edit')} />
        )}
        {canDelete ? (
          <DropdownMenuItem
            onClick={() => {
              setOpen(false);
              onDelete(question);
            }}
            className="text-destructive focus:text-destructive"
          >
            <Trash />
            {t('questions.rowActions.remove')}
          </DropdownMenuItem>
        ) : (
          <DisabledMenuItem label={t('questions.rowActions.remove')} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DisabledMenuItem({ label }: { label: string }) {
  const { t } = useTranslation();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <DropdownMenuItem disabled>{label}</DropdownMenuItem>
          </div>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>{t('questions.rowActions.noPermission')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
