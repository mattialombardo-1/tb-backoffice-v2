import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useClientOrders } from '@/lib/hooks/useClientOrders';
import type { Client } from '@/lib/types/clients';
import { ExternalLink } from 'lucide-react';

interface ClientsOrdersDialogProps {
  client: Client | null;
  onClose: () => void;
}

const COLUMNS = 2;

function SkeletonRows() {
  return Array.from({ length: 3 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function ClientsOrdersDialog({ client, onClose }: ClientsOrdersDialogProps) {
  const { t } = useTranslation();
  const { modules, isLoading, error, refetch } = useClientOrders(client?.id ?? null);

  const clientLabel = client ? client.email : '';

  return (
    <Dialog open={!!client} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('clients.ordersDialog.title', { client: clientLabel })}</DialogTitle>
        </DialogHeader>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('clients.ordersDialog.package')}</TableHead>
                <TableHead>{t('clients.ordersDialog.sku')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonRows />
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground">{error}</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={refetch}>
                      {t('common.retry')}
                    </Button>
                  </TableCell>
                </TableRow>
              ) : modules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={COLUMNS}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    {t('clients.ordersDialog.noOrders')}
                  </TableCell>
                </TableRow>
              ) : (
                modules.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell className="font-medium flex items-center gap-1">
                      {mod.name}
                      <a href={`/packages?tab=skus&searchField=code&search=${mod.skuCode}`}>
                        <ExternalLink size={14} />
                      </a>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{mod.skuCode || '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
