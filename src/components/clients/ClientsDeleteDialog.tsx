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

interface ClientsDeleteDialogProps {
  client: Client | null;
  onConfirm: (client: Client) => Promise<void>;
  onCancel: () => void;
}

export function ClientsDeleteDialog({ client, onConfirm, onCancel }: ClientsDeleteDialogProps) {
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
          <DialogTitle>{t('clients.deleteDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('clients.deleteDialog.desc')} <strong>{clientLabel}</strong> ({client?.email}). {t('clients.deleteDialog.descSuffix')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="destructive" onClick={() => client && onConfirm(client)}>
            {t('clients.deleteDialog.delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
