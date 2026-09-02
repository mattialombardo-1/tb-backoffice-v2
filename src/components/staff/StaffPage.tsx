import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { Route } from '@/routes/_authenticated/staff';
import { useAuth, useCan, useCapabilities } from '@/lib/auth';
import { useStaffList } from '@/lib/hooks/useStaffList';
import { useCommunityRoles } from '@/lib/hooks/useCommunityRoles';
import { Button } from '@/components/ui/button';
import type { CommunityUser, StaffFilters as StaffFiltersType } from '@/lib/types/staff';
import { StaffFilters } from './StaffFilters';
import { StaffTable } from './StaffTable';
import { StaffPagination } from './StaffPagination';
import { StaffChangeRoleDialog } from './StaffChangeRoleDialog';
import { StaffAddMemberDialog } from './StaffAddMemberDialog';
import { StaffDeleteDialog } from './StaffDeleteDialog';

const PER_PAGE = 20;

export function StaffPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const auth = useAuth();

  const filters: StaffFiltersType = {
    search: search.search ?? '',
    roleId: search.roleId ?? '',
    page: search.page ?? 1,
  };

  const { data, total, isLoading, error, refetch, updateStaffRole, deleteStaff } = useStaffList(filters);
  const { rolesById } = useCommunityRoles();
  const { me } = useCapabilities();

  const callerMinRank = Math.min(
    ...(me?.user.roleIds ?? []).map((id) => rolesById.get(id)?.rank ?? Infinity)
  );

  const currentUserCognitoId = (auth.user?.profile.sub as string) ?? '';

  const isSupervisor = useCan('community-users', 'UPDATE');
  const canCreate = useCan('community-users', 'CREATE');
  const canDeletePerm = useCan('community-users', 'DELETE');

  const [changeRoleTarget, setChangeRoleTarget] = useState<CommunityUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunityUser | null>(null);
  const [addMemberOpen, setAddMemberOpen] = useState(false);

  const updateFilters = (patch: Partial<StaffFiltersType>) => {
    const next = { ...filters, ...patch };
    if ('search' in patch || 'roleId' in patch) {
      next.page = 1;
    }
    navigate({
      to: '/staff',
      search: {
        search: next.search || undefined,
        roleId: next.roleId || undefined,
        page: next.page > 1 ? next.page : undefined,
      },
    });
  };

  const handleDelete = async (user: CommunityUser) => {
    try {
      await deleteStaff(user._id);
      setDeleteTarget(null);
      const label =
        user.name || user.surname ? `${user.name} ${user.surname}`.trim() : user.cognitoId;
      toast.success(t('staff.delete.successToast', { label }));
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t('common.error');
      toast.error(message);
    }
  };

  const handleChangeRole = async (user: CommunityUser, roleIds: string[]) => {
    try {
      await updateStaffRole(user._id, roleIds);
      setChangeRoleTarget(null);
      const label =
        user.name || user.surname ? `${user.name} ${user.surname}`.trim() : user.cognitoId;
      toast.success(t('staff.changeRole.successToast', { label }));
    } catch (err) {
      const message =
        err instanceof Error && err.message ? err.message : t('staff.changeRole.errorToast');
      toast.error(message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('staff.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('staff.subtitle')}</p>
          </div>
          {canCreate && (
            <Button onClick={() => setAddMemberOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('staff.add')}
            </Button>
          )}
        </div>

        <StaffFilters filters={filters} onFilterChange={updateFilters} />

        <StaffTable
          data={data}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          isSupervisor={isSupervisor}
          canDeletePerm={canDeletePerm}
          onChangeRole={setChangeRoleTarget}
          onDelete={setDeleteTarget}
          currentUserCognitoId={currentUserCognitoId}
          rolesById={rolesById}
          callerMinRank={callerMinRank}
        />
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <StaffPagination
          page={filters.page}
          total={total}
          perPage={PER_PAGE}
          onPageChange={(p) => updateFilters({ page: p })}
        />
      </div>

      <StaffChangeRoleDialog
        user={changeRoleTarget}
        onConfirm={handleChangeRole}
        onCancel={() => setChangeRoleTarget(null)}
      />

      <StaffAddMemberDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onSuccess={refetch}
      />

      <StaffDeleteDialog
        user={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
