import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useCan } from '@/lib/auth';
import { useCommunityRoles } from '@/lib/hooks/useCommunityRoles';
import { communityRolesService } from '@/lib/services/communityRoles';
import { useApiClient } from '@/lib/api/useApiClient';
import { Button } from '@/components/ui/button';
import type { CommunityRole } from '@/lib/types/communityRoles';
import { RolesTable } from './RolesTable';
import { RolesCreateDialog } from './RolesCreateDialog';
import { RolesEditDialog } from './RolesEditDialog';
import { RolesDeleteDialog } from './RolesDeleteDialog';

export function RolesPage() {
  const { t } = useTranslation();
  const client = useApiClient();
  const { roles, isLoading, error, refetch } = useCommunityRoles();
  const canCreate = useCan('community-roles', 'CREATE');

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CommunityRole | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CommunityRole | null>(null);

  const handleDelete = async (role: CommunityRole) => {
    try {
      await communityRolesService.delete(client, role._id);
      setDeleteTarget(null);
      toast.success(t('roles.deleteDialog.success', { name: role.displayName }));
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('roles.deleteDialog.error'));
    }
  };

  const handleEditSuccess = (_updated: CommunityRole) => {
    setEditTarget(null);
    refetch();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('roles.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('roles.subtitle')}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('roles.create')}
            </Button>
          )}
        </div>

        <RolesTable
          data={roles}
          isLoading={isLoading}
          error={error}
          onRetry={refetch}
          onEdit={setEditTarget}
          onDelete={setDeleteTarget}
        />
      </div>

      {canCreate && (
        <RolesCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => { setCreateOpen(false); refetch(); }}
        />
      )}

      <RolesEditDialog
        role={editTarget}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditTarget(null)}
      />

      <RolesDeleteDialog
        role={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
