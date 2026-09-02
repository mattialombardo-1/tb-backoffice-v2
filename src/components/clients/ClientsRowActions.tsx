import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MoreHorizontal, Package, Trash, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCan } from '@/lib/auth/capabilities';
import type { Client } from '@/lib/types/clients';

interface ClientsRowActionsProps {
  client: Client;
  onViewOrders: (client: Client) => void;
  onImpersonate: (client: Client) => void;
  onPromoteToStaff: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export function ClientsRowActions({
  client,
  onViewOrders,
  onImpersonate,
  onDelete,
}: ClientsRowActionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const canDelete = useCan('users', 'DELETE');

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{t('clients.actions.actionsLabel')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onViewOrders(client);
          }}
        >
          <Package />
          {t('clients.actions.orders')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setOpen(false);
            onImpersonate(client);
          }}
        >
          <UserCheck />
          {t('clients.actions.impersonate')}
        </DropdownMenuItem>
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setOpen(false);
                onDelete(client);
              }}
            >
              <Trash />
              {t('clients.actions.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
