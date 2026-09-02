import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import type { CommunityRole } from '@/lib/types/communityRoles';

interface StaffRolesDialogProps {
  roles: CommunityRole[];
  open: boolean;
  onClose: () => void;
}

const ACTION_LABELS: Record<string, string> = {
  create: 'Crea',
  read: 'Leggi',
  update: 'Modifica',
  delete: 'Elimina',
};

export function StaffRolesDialog({ roles, open, onClose }: StaffRolesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ruoli assegnati</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {roles.map((role, idx) => (
            <div key={role._id}>
              {idx > 0 && <Separator className="mb-4" />}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{role.displayName}</span>
                  <span className="font-mono text-xs text-muted-foreground">{role.name}</span>
                </div>
                {role.description && (
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                )}
                {role.capabilities.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Permessi
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.capabilities.map((cap) =>
                        cap.actions.map((action) => (
                          <Badge
                            key={`${cap.resource}-${action}`}
                            variant="outline"
                            className="text-xs"
                          >
                            {ACTION_LABELS[action] ?? action}: {cap.resource}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessun ruolo assegnato
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
