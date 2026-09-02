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
import type { Client } from '@/lib/types/clients';

interface ClientsPromoteDialogProps {
  client: Client | null;
  onConfirm: (client: Client, role: string) => Promise<void>;
  onCancel: () => void;
}

export function ClientsPromoteDialog({ client, onConfirm, onCancel }: ClientsPromoteDialogProps) {
  const { t } = useTranslation();
  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  const clientLabel = client
    ? [client.name, client.surname].filter(Boolean).join(' ') || client.email
    : '';

  return (
    <Dialog open={!!client} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('clients.promoteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('clients.promoteDialog.desc')} <strong>{clientLabel}</strong> ({client?.email}) {t('clients.promoteDialog.descMiddle')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button onClick={() => client && onConfirm(client, 'staff')}>
            {t('clients.promoteDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
