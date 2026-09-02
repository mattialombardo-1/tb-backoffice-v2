import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
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
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiClient } from '@/lib/api/useApiClient';
import { clientsService } from '@/lib/services/clients';
import { staffService } from '@/lib/services/staff';
import { useCommunityRoles } from '@/lib/hooks/useCommunityRoles';
import type { Client } from '@/lib/types/clients';
import type { CommunityRole } from '@/lib/types/communityRoles';

interface StaffAddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DEBOUNCE_MS = 300;

// ─── hooks ───────────────────────────────────────────────────────────────────

function useUserSearch(search: string) {
  const client = useApiClient();
  return useQuery({
    queryKey: ['userSearch', search],
    queryFn: ({ signal }) => clientsService.list(client, { search, page: '0' }, signal),
    staleTime: 30_000,
  });
}

function useExistingStaffCognitoIds() {
  const client = useApiClient();
  return useQuery({
    queryKey: ['staffCognitoIds'],
    queryFn: ({ signal }) =>
      staffService
        .list(client, { per_page: '1000', page: '0' }, signal)
        .then((res) => res.communityUsers.map((u) => u.cognitoId)),
    staleTime: 60_000,
  });
}

// ─── sub-components ───────────────────────────────────────────────────────────

function UserRow({
  user,
  checked,
  onToggle,
}: {
  user: Client;
  checked: boolean;
  onToggle: () => void;
}) {
  const label =
    user.name || user.surname ? `${user.name} ${user.surname}`.trim() : user.cognitoId;
  return (
    <label className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 cursor-pointer transition-colors">
      <Checkbox checked={checked} onCheckedChange={onToggle} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{label}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
    </label>
  );
}

function RoleCheckboxGroup({
  roles,
  selectedIds,
  onToggle,
}: {
  roles: CommunityRole[];
  selectedIds: string[];
  onToggle: (roleId: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {roles.map((role) => {
        const checked = selectedIds.includes(role._id);
        return (
          <label key={role._id} className="flex items-center gap-1.5 cursor-pointer">
            <Checkbox checked={checked} onCheckedChange={() => onToggle(role._id)} />
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
  );
}

// ─── main dialog ──────────────────────────────────────────────────────────────

type RolesByUser = Record<string, string[]>;

export function StaffAddMemberDialog({ open, onClose, onSuccess }: StaffAddMemberDialogProps) {
  const { t } = useTranslation();
  const apiClient = useApiClient();
  const { roles, isLoading: rolesLoading } = useCommunityRoles();

  const { data: existingStaffIds, isLoading: staffLoading } = useExistingStaffCognitoIds();
  const staffIdSet: string[] = Array.isArray(existingStaffIds) ? existingStaffIds : [];

  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [selectedUsers, setSelectedUsers] = useState<Client[]>([]);
  const [rolesByUser, setRolesByUser] = useState<RolesByUser>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: usersData, isLoading: usersLoading } = useUserSearch(debouncedSearch);
  const allUsers = usersData?.clients ?? [];
  const users = allUsers.filter((u) => !staffIdSet.includes(u.cognitoId));

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const resetState = () => {
    setStep(1);
    setSearch('');
    setDebouncedSearch('');
    setSelectedUsers([]);
    setRolesByUser({});
    setIsSubmitting(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !isSubmitting) {
      resetState();
      onClose();
    }
  };

  const selectedCognitoIds = selectedUsers.map((u) => u.cognitoId);

  const toggleUser = (user: Client) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((u) => u.cognitoId === user.cognitoId);
      return exists ? prev.filter((u) => u.cognitoId !== user.cognitoId) : [...prev, user];
    });
  };

  const goToStep2 = () => {
    setRolesByUser((prev) => {
      const next: RolesByUser = {};
      for (const user of selectedUsers) {
        next[user.cognitoId] = prev[user.cognitoId] ?? [];
      }
      return next;
    });
    setStep(2);
  };

  const toggleRoleForUser = (cognitoId: string, roleId: string) => {
    setRolesByUser((prev) => {
      const current = prev[cognitoId] ?? [];
      const next = current.includes(roleId)
        ? current.filter((id) => id !== roleId)
        : [...current, roleId];
      return { ...prev, [cognitoId]: next };
    });
  };

  const allUsersHaveRoles = selectedUsers.every(
    (u) => (rolesByUser[u.cognitoId]?.length ?? 0) > 0
  );
  const canSubmit = !isSubmitting && selectedUsers.length > 0 && allUsersHaveRoles;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const results = await Promise.allSettled(
      selectedUsers.map((user) =>
        staffService.create(apiClient, {
          cognitoId: user.cognitoId,
          roleIds: rolesByUser[user.cognitoId] ?? [],
        })
      )
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected');

    if (succeeded > 0) {
      toast.success(t('staff.addDialog.success', { count: succeeded }));
      onSuccess();
    }

    if (failed.length > 0) {
      const reason =
        failed[0].status === 'rejected' && failed[0].reason instanceof Error
          ? failed[0].reason.message
          : t('staff.addDialog.errorCreate');
      toast.error(
        failed.length === 1 ? reason : `${t('staff.addDialog.errorPartial', { count: failed.length })}: ${reason}`
      );
    }

    if (succeeded > 0) {
      resetState();
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                className="mr-1 rounded p-0.5 hover:bg-muted transition-colors"
                aria-label={t('staff.addDialog.stepSelectUsers')}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <UserPlus className="h-5 w-5" />
            {step === 1 ? t('staff.addDialog.stepSelectUsers') : t('staff.addDialog.stepAssignRoles')}
          </DialogTitle>
        </DialogHeader>

        {/* ── Step 1: user selection ── */}
        {step === 1 && (
          <div className="flex flex-col gap-4 overflow-hidden flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('staff.addDialog.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            <div className="border rounded-md flex-1 min-h-[200px] overflow-y-auto">
              {usersLoading || staffLoading ? (
                <div className="space-y-1 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-md" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  {debouncedSearch ? t('staff.addDialog.noUsers') : t('staff.addDialog.searchHint')}
                </p>
              ) : (
                <div className="p-1">
                  {users.map((user) => (
                    <UserRow
                      key={user.cognitoId}
                      user={user}
                      checked={selectedCognitoIds.includes(user.cognitoId)}
                      onToggle={() => toggleUser(user)}
                    />
                  ))}
                </div>
              )}
            </div>

            {selectedUsers.length > 0 && (
              <p className="text-xs text-muted-foreground -mt-1">
                {t('staff.addDialog.selected', { count: selectedUsers.length })}
              </p>
            )}
          </div>
        )}

        {/* ── Step 2: per-user role assignment ── */}
        {step === 2 && (
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-1">
            {rolesLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              selectedUsers.map((user) => {
                const label =
                  user.name || user.surname
                    ? `${user.name} ${user.surname}`.trim()
                    : user.cognitoId;
                const userRoleIds = rolesByUser[user.cognitoId] ?? [];
                const hasRole = userRoleIds.length > 0;

                return (
                  <div key={user.cognitoId} className="rounded-md border p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{label}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      {!hasRole && (
                        <span className="text-xs text-destructive shrink-0">
                          {t('staff.addDialog.noRole')}
                        </span>
                      )}
                    </div>
                    <RoleCheckboxGroup
                      roles={roles}
                      selectedIds={userRoleIds}
                      onToggle={(roleId) => toggleRoleForUser(user.cognitoId, roleId)}
                    />
                  </div>
                );
              })
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>

          {step === 1 ? (
            <Button onClick={goToStep2} disabled={selectedUsers.length === 0}>
              {selectedUsers.length > 0
                ? t('staff.addDialog.nextCount', { count: selectedUsers.length })
                : t('common.next')}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canSubmit}>
              {isSubmitting ? t('staff.addDialog.adding') : t('staff.addDialog.addBtn')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
