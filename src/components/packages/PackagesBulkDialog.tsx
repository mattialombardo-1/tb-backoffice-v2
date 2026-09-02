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
import type { BulkAction } from './PackagesBulkBar';

interface PackagesBulkDialogProps {
  action: BulkAction | null;
  selectedCount: number;
  isLoading: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const ACTION_KEYS: Record<BulkAction, { titleKey: string; descKey: string; destructive?: boolean }> = {
  setActive: { titleKey: 'packages.bulkPackageDialog.activateTitle', descKey: 'packages.bulkPackageDialog.activateDesc' },
  setInactive: { titleKey: 'packages.bulkPackageDialog.deactivateTitle', descKey: 'packages.bulkPackageDialog.deactivateDesc' },
  setFree: { titleKey: 'packages.bulkPackageDialog.freeTitle', descKey: 'packages.bulkPackageDialog.freeDesc' },
  setPaid: { titleKey: 'packages.bulkPackageDialog.paidTitle', descKey: 'packages.bulkPackageDialog.paidDesc' },
  delete: { titleKey: 'packages.bulkPackageDialog.deleteTitle', descKey: 'packages.bulkPackageDialog.deleteDesc', destructive: true },
};

export function PackagesBulkDialog({
  action,
  selectedCount,
  isLoading,
  onConfirm,
  onCancel,
}: PackagesBulkDialogProps) {
  const { t } = useTranslation();
  const meta = action ? ACTION_KEYS[action] : null;

  return (
    <Dialog open={!!action} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta ? t(meta.titleKey as any) : ''}</DialogTitle>
          <DialogDescription>
            {meta ? t(meta.descKey as any, { count: selectedCount }) : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant={meta?.destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? t('packages.bulkPackageDialog.saving') : t('common.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
