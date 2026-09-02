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

export type ToggleField = 'active' | 'isFree' | 'timed';

const TOGGLE_I18N_KEYS: Record<ToggleField, { title: string; on: string; off: string }> = {
  active: {
    title: 'packages.toggleDialog.activeTitle',
    on: 'packages.toggleDialog.activeOn',
    off: 'packages.toggleDialog.activeOff',
  },
  isFree: {
    title: 'packages.toggleDialog.freeTitle',
    on: 'packages.toggleDialog.freeOn',
    off: 'packages.toggleDialog.freeOff',
  },
  timed: {
    title: 'packages.toggleDialog.timedTitle',
    on: 'packages.toggleDialog.timedOn',
    off: 'packages.toggleDialog.timedOff',
  },
};

interface PackagesToggleDialogProps {
  pkg: Package | null;
  field: ToggleField | null;
  isLoading: boolean;
  onConfirm: (pkg: Package, field: ToggleField) => Promise<void>;
  onCancel: () => void;
}

export function PackagesToggleDialog({
  pkg,
  field,
  isLoading,
  onConfirm,
  onCancel,
}: PackagesToggleDialogProps) {
  const { t } = useTranslation();
  const open = !!pkg && !!field;
  const currentValue = pkg && field ? pkg[field] : false;
  const title = field ? t(TOGGLE_I18N_KEYS[field].title) : '';
  const nextLabel = field
    ? currentValue
      ? t(TOGGLE_I18N_KEYS[field].off)
      : t(TOGGLE_I18N_KEYS[field].on)
    : '';
  const packageName =
    pkg?.name ?? pkg?.skuCode ?? pkg?.id ?? t('packages.toggleDialog.fallbackName');

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription asChild>
            <span>
              <Trans
                i18nKey="packages.toggleDialog.desc"
                values={{ name: packageName, status: nextLabel }}
                components={{ strong: <strong /> }}
              />
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => pkg && field && onConfirm(pkg, field)} disabled={isLoading}>
            {isLoading ? t('packages.toggleDialog.saving') : t('packages.toggleDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
