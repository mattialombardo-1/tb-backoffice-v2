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

interface SkusBulkDialogProps {
  open: boolean;
  selectedCount: number;
  isLoading: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function SkusBulkDialog({
  open,
  selectedCount,
  isLoading,
  onConfirm,
  onCancel,
}: SkusBulkDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('packages.bulkSkuDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('packages.bulkSkuDialog.desc', { count: selectedCount })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t('packages.bulkSkuDialog.deleting') : t('packages.bulkSkuDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
