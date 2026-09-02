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
import type { Pool, PoolStatus } from '@/lib/types/pools';
import { POOL_STATUS_LABELS } from '@/lib/types/pools';

interface PoolsStatusDialogProps {
  pool: Pool | null;
  targetStatus: PoolStatus | null;
  isLoading: boolean;
  onConfirm: (pool: Pool, status: PoolStatus) => Promise<void>;
  onCancel: () => void;
}

export function PoolsStatusDialog({
  pool,
  targetStatus,
  isLoading,
  onConfirm,
  onCancel,
}: PoolsStatusDialogProps) {
  const { t } = useTranslation();
  const open = !!pool && !!targetStatus;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pools.statusDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('pools.statusDialog.desc', {
              name: pool?.name ?? '',
              status: targetStatus ? POOL_STATUS_LABELS[targetStatus] : '',
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() => pool && targetStatus && onConfirm(pool, targetStatus)}
            disabled={isLoading}
          >
            {isLoading ? t('pools.statusDialog.saving') : t('pools.statusDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
