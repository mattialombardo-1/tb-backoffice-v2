import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { QuestionListItem } from '@/lib/types/questions';

interface QuestionsDeleteDialogProps {
  question: QuestionListItem | null;
  onConfirm: (question: QuestionListItem) => Promise<void>;
  onCancel: () => void;
}

export function QuestionsDeleteDialog({
  question,
  onConfirm,
  onCancel,
}: QuestionsDeleteDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Reset loading state whenever the target question changes
  useEffect(() => {
    setIsLoading(false);
  }, [question]);

  const handleConfirm = async () => {
    if (!question) return;
    setIsLoading(true);
    try {
      await onConfirm(question);
    } catch {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      onCancel();
    }
  };

  return (
    <Dialog open={!!question} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('questions.deleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('questions.deleteDialog.desc')}{' '}
            <span className="font-medium text-foreground font-mono">{question?.id}</span>. {t('questions.deleteDialog.descSuffix')}
          </DialogDescription>
        </DialogHeader>

        {/* TODO: show impacted simulations/exercises when API provides this data */}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t('questions.deleteDialog.deleting') : t('questions.deleteDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
