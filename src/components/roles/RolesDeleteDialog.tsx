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
import type { CommunityRole } from '@/lib/types/communityRoles';

interface RolesDeleteDialogProps {
  role: CommunityRole | null;
  onConfirm: (role: CommunityRole) => Promise<void>;
  onCancel: () => void;
}

export function RolesDeleteDialog({ role, onConfirm, onCancel }: RolesDeleteDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={!!role} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('roles.deleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('roles.deleteDialog.desc')} <strong>{role?.displayName}</strong>. {t('roles.deleteDialog.descSuffix')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={() => role && onConfirm(role)}>
            {t('roles.deleteDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
