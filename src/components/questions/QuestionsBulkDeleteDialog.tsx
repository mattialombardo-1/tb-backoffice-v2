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

interface QuestionsBulkDeleteDialogProps {
  open: boolean;
  count: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function QuestionsBulkDeleteDialog({
  open,
  count,
  onConfirm,
  onCancel,
}: QuestionsBulkDeleteDialogProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, [open]);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } catch {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isLoading) onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('questions.bulkDeleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('questions.bulkDeleteDialog.desc')} <span className="font-medium text-foreground">{count}</span>{' '}
            {t('questions.bulkDeleteDialog.question', { count })} {t('questions.bulkDeleteDialog.descSuffix')}
          </DialogDescription>
        </DialogHeader>

        {/* TODO: show impacted simulations/exercises when API provides this data */}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t('questions.bulkDeleteDialog.deleting') : t('questions.bulkDeleteDialog.confirm', { count })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
