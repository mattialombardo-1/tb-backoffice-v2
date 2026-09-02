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
import type { CommunityUser } from '@/lib/types/staff';

interface StaffDeleteDialogProps {
  user: CommunityUser | null;
  onConfirm: (user: CommunityUser) => Promise<void>;
  onCancel: () => void;
}

export function StaffDeleteDialog({ user, onConfirm, onCancel }: StaffDeleteDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onCancel();
  };

  const handleConfirm = async () => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(user);
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = user
    ? user.name || user.surname
      ? `${user.name} ${user.surname}`.trim()
      : user.cognitoId
    : '';

  return (
    <Dialog open={!!user} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('staff.delete.title')}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t('staff.delete.confirm')}{' '}
          <span className="font-medium text-foreground">{label}</span>{' '}
          {t('staff.delete.confirmSuffix')}
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? t('staff.delete.deleting') : t('staff.delete.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
