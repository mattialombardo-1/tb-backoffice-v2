import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { Route } from '@/routes/_authenticated/clients';
import { useAuth } from '@/lib/auth';
import { useApiClient } from '@/lib/api/useApiClient';
import { useClientsList } from '@/lib/hooks/useClientsList';
import { clientsService } from '@/lib/services/clients';
import { staffService } from '@/lib/services/staff';
import type { Client, ClientFilters as ClientFiltersType } from '@/lib/types/clients';
import { ClientsFilters } from './ClientsFilters';
import { ClientsTable } from './ClientsTable';
import { ClientsPagination } from './ClientsPagination';
import { ClientsDeleteDialog } from './ClientsDeleteDialog';
import { ClientsOrdersDialog } from './ClientsOrdersDialog';
import { ClientsPromoteDialog } from './ClientsPromoteDialog';
import { ClientsImpersonateDialog } from './ClientsImpersonateDialog';

const PER_PAGE = 20;

export function ClientsPage() {
  const { t } = useTranslation();
  const routeSearch = Route.useSearch();
  const navigate = useNavigate();
  const auth = useAuth();
  const apiClient = useApiClient();

  const filters: ClientFiltersType = {
    page: routeSearch.page ?? 1,
    search: routeSearch.search ?? '',
  };

  const { data, total, isLoading, error, refetch } = useClientsList(filters);

  const [ordersTarget, setOrdersTarget] = useState<Client | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [impersonateTarget, setImpersonateTarget] = useState<Client | null>(null);

  const updateFilters = (patch: Partial<ClientFiltersType>) => {
    const next = { ...filters, ...patch };
    navigate({
      to: '/clients',
      search: {
        page: next.page > 1 ? next.page : undefined,
        search: next.search || undefined,
      },
    });
  };

  const handleSearchChange = (value: string) => {
    updateFilters({ search: value, page: 1 });
  };

  const handleImpersonate = useCallback(
    (targetClient: Client) => setImpersonateTarget(targetClient),
    []
  );

  const handleDelete = async (client: Client) => {
    try {
      await clientsService.delete(apiClient, client.id);
      setDeleteTarget(null);
      const label = [client.name, client.surname].filter(Boolean).join(' ') || client.email;
      toast.success(t('clients.deleteDialog.success', { name: label }));
      refetch();
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t('common.error');
      toast.error(message);
    }
  };

  const handlePromoteToStaff = async (client: Client) => {
    try {
      await staffService.create(apiClient, { cognitoId: client.cognitoId, roleIds: [] });
      setPromoteTarget(null);
      const label = [client.name, client.surname].filter(Boolean).join(' ') || client.email;
      toast.success(t('clients.promoteSuccess', { name: label }));
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t('common.error');
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{t('clients.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('clients.subtitle')}
          </p>
        </div>

        <ClientsFilters search={filters.search} onSearchChange={handleSearchChange} />

        <ClientsTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onViewOrders={setOrdersTarget}
          onImpersonate={handleImpersonate}
          onPromoteToStaff={setPromoteTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <ClientsPagination
          page={filters.page}
          total={total}
          perPage={PER_PAGE}
          onPageChange={(p) => updateFilters({ page: p })}
        />
      </div>

      <ClientsDeleteDialog
        client={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <ClientsOrdersDialog client={ordersTarget} onClose={() => setOrdersTarget(null)} />
      <ClientsPromoteDialog
        client={promoteTarget}
        onConfirm={handlePromoteToStaff}
        onCancel={() => setPromoteTarget(null)}
      />
      <ClientsImpersonateDialog
        client={impersonateTarget}
        idToken={auth.user?.id_token ?? ''}
        onClose={() => setImpersonateTarget(null)}
      />
    </div>
  );
}
