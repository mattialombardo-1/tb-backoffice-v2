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
import type { Pool } from '@/lib/types/pools';

interface PoolsDeleteDialogProps {
  pool: Pool | null;
  isLoading: boolean;
  onConfirm: (pool: Pool) => Promise<void>;
  onCancel: () => void;
}

export function PoolsDeleteDialog({ pool, isLoading, onConfirm, onCancel }: PoolsDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!pool} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('pools.deleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('pools.deleteDialog.desc', { name: pool?.name ?? '' })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => pool && onConfirm(pool)}
            disabled={isLoading}
          >
            {isLoading ? t('pools.deleteDialog.deleting') : t('pools.deleteDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
