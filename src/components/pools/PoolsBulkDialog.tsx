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
import type { PoolBulkAction } from './PoolsBulkBar';

interface PoolsBulkDialogProps {
  action: PoolBulkAction | null;
  selectedCount: number;
  isLoading: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function PoolsBulkDialog({
  action,
  selectedCount,
  isLoading,
  onConfirm,
  onCancel,
}: PoolsBulkDialogProps) {
  const { t } = useTranslation();

  const title = action === 'ACTIVE'
    ? t('pools.bulkDialog.activateTitle')
    : action === 'INACTIVE'
      ? t('pools.bulkDialog.deactivateTitle')
      : '';

  const description = action === 'ACTIVE'
    ? t('pools.bulkDialog.activateDesc', { count: selectedCount })
    : action === 'INACTIVE'
      ? t('pools.bulkDialog.deactivateDesc', { count: selectedCount })
      : '';

  return (
    <Dialog open={!!action} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? t('pools.bulkDialog.saving') : t('pools.bulkDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
