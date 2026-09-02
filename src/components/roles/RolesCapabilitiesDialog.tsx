import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CommunityRole } from '@/lib/types/communityRoles';

interface RolesCapabilitiesDialogProps {
  role: CommunityRole | null;
  onClose: () => void;
}

export function RolesCapabilitiesDialog({ role, onClose }: RolesCapabilitiesDialogProps) {
  const { t } = useTranslation();
  return (
    <Dialog open={!!role} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[700px] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{t('roles.capabilitiesDialog.title', { name: role?.displayName })}</DialogTitle>
        </DialogHeader>

        {role?.capabilities.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{t('roles.capabilitiesDialog.noCapabilities')}</p>
        ) : (
          <div className="space-y-3">
            {role?.capabilities.map((cap) => (
              <div key={cap.resource} className="space-y-1.5">
                <p className="text-sm font-medium">{cap.resource}</p>
                <div className="flex flex-wrap gap-1">
                  {cap.actions.map((action) => (
                    <Badge key={action} variant="secondary" className="text-xs font-normal">
                      {action}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
