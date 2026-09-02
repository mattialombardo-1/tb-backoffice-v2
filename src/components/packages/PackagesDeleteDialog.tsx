import { useTranslation, Trans } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Package } from '@/lib/types/packages';

interface PackagesDeleteDialogProps {
  pkg: Package | null;
  isLoading: boolean;
  onConfirm: (pkg: Package) => Promise<void>;
  onCancel: () => void;
}

export function PackagesDeleteDialog({ pkg, isLoading, onConfirm, onCancel }: PackagesDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!pkg} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('packages.deletePackageDialog.title')}</DialogTitle>
          <DialogDescription asChild>
            <span>
              <Trans
                i18nKey="packages.deletePackageDialog.desc"
                values={{ name: pkg?.name ?? pkg?.skuCode ?? pkg?.id }}
                components={{ strong: <strong /> }}
              />
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={() => pkg && onConfirm(pkg)}
            disabled={isLoading}
          >
            {isLoading ? t('packages.deletePackageDialog.deleting') : t('packages.deletePackageDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
