import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCommunityRoles } from '@/lib/hooks/useCommunityRoles';
import type { CommunityUser } from '@/lib/types/staff';

interface StaffChangeRoleDialogProps {
  user: CommunityUser | null;
  onConfirm: (user: CommunityUser, roleIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export function StaffChangeRoleDialog({ user, onConfirm, onCancel }: StaffChangeRoleDialogProps) {
  const { t } = useTranslation();
  const { roles, isLoading: rolesLoading } = useCommunityRoles();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync selection with the user's current roles whenever the dialog opens
  useEffect(() => {
    if (user) {
      setSelectedRoleIds(user.roleIds ?? []);
      setIsSubmitting(false);
    }
  }, [user]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onCancel();
  };

  const toggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const handleConfirm = async () => {
    if (!user || selectedRoleIds.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(user, selectedRoleIds);
    } finally {
      setIsSubmitting(false);
    }
  };

  const label = user
    ? user.name || user.surname
      ? `${user.name} ${user.surname}`.trim()
      : user.cognitoId
    : '';

  const canConfirm = !isSubmitting && selectedRoleIds.length > 0;

  return (
    <Dialog open={!!user} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('staff.changeRole.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t('staff.changeRole.desc')} <span className="font-medium text-foreground">{label}</span>.
          </p>

          {rolesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const checked = selectedRoleIds.includes(role._id);
                return (
                  <label key={role._id} className="flex items-center gap-1.5 cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleRole(role._id)}
                      disabled={isSubmitting}
                    />
                    <Badge
                      variant={checked ? 'default' : 'outline'}
                      className="cursor-pointer select-none"
                    >
                      {role.displayName}
                    </Badge>
                  </label>
                );
              })}
            </div>
          )}

          {selectedRoleIds.length === 0 && !rolesLoading && (
            <p className="text-xs text-destructive">{t('staff.changeRole.validation')}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            {isSubmitting ? t('staff.changeRole.saving') : t('staff.changeRole.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
