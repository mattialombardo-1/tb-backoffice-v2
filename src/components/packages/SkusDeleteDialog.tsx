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
import type { Sku } from '@/lib/types/skus';

interface SkusDeleteDialogProps {
  sku: Sku | null;
  isLoading: boolean;
  onConfirm: (sku: Sku) => Promise<void>;
  onCancel: () => void;
}

export function SkusDeleteDialog({ sku, isLoading, onConfirm, onCancel }: SkusDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={!!sku} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('packages.deleteSkuDialog.title')}</DialogTitle>
          <DialogDescription asChild>
            <span>
              <Trans
                i18nKey="packages.deleteSkuDialog.desc"
                values={{ name: sku?.name, code: sku?.code }}
                components={{ strong: <strong />, code: <code /> }}
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
            onClick={() => sku && onConfirm(sku)}
            disabled={isLoading}
          >
            {isLoading ? t('packages.deleteSkuDialog.deleting') : t('packages.deleteSkuDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
