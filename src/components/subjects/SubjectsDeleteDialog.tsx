import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Subject } from '@/lib/types/subjects';

interface SubjectsDeleteDialogProps {
  subject: Subject | null;
  onConfirm: (subject: Subject) => Promise<void>;
  onCancel: () => void;
}

export function SubjectsDeleteDialog({ subject, onConfirm, onCancel }: SubjectsDeleteDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onCancel();
  };

  const handleConfirm = async () => {
    if (!subject || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(subject);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!subject} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('subjects.deleteDialog.title')}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t('subjects.deleteDialog.confirm')}{' '}
          <span className="font-medium text-foreground">{subject?.name}</span>?{' '}
          {t('subjects.deleteDialog.confirmSuffix')}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? t('subjects.deleteDialog.deleting') : t('subjects.deleteDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
