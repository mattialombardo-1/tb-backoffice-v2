import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { CommunityUser } from '@/lib/types/staff';
import type { CommunityRole } from '@/lib/types/communityRoles';
import { StaffRowActions } from './StaffRowActions';
import { StaffRolesDialog } from './StaffRolesDialog';

interface StaffTableProps {
  data: CommunityUser[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  isSupervisor: boolean;
  canDeletePerm: boolean;
  onChangeRole: (user: CommunityUser) => void;
  onDelete: (user: CommunityUser) => void;
  currentUserCognitoId: string;
  rolesById: Map<string, CommunityRole>;
  callerMinRank: number;
}

const COLUMNS = 6;
const INLINE_ROLE_LIMIT = 3;

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: COLUMNS }).map((_, j) => (
        <TableCell key={j}>
          <Skeleton className="h-4 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function CopyableId({ id }: { id: string }) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const Icon = state === 'copied' ? Check : state === 'error' ? X : Copy;

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span
        className="font-mono text-xs text-muted-foreground truncate max-w-[120px]"
        title={id}
      >
        {id}
      </span>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-all" onClick={handleCopy}>
        <Icon
          className={cn(
            'h-3 w-3',
            state === 'copied' && 'text-emerald-600',
            state === 'error' && 'text-destructive'
          )}
        />
        <span className="sr-only">{t('staff.table.copyCognitoId')}</span>
      </Button>
    </div>
  );
}

interface RoleCellProps {
  roleIds?: string[];
  rolesById: Map<string, CommunityRole>;
}

function RoleCell({ roleIds, rolesById }: RoleCellProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!roleIds?.length) {
    return <span className="text-muted-foreground text-sm">—</span>;
  }

  const resolved = roleIds.map((id) => rolesById.get(id)).filter(Boolean) as CommunityRole[];
  const unresolved = roleIds.length - resolved.length;

  if (roleIds.length <= INLINE_ROLE_LIMIT) {
    return (
      <div className="flex flex-wrap gap-1">
        {resolved.map((role) => (
          <Badge
            key={role._id}
            variant="outline"
            className="border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300"
          >
            {role.displayName}
          </Badge>
        ))}
        {unresolved > 0 && (
          <Badge variant="outline" className="text-muted-foreground">
            +{unresolved}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="inline-flex items-center"
      >
        <Badge
          variant="outline"
          className="cursor-pointer border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300 dark:hover:bg-violet-900"
        >
          {t('staff.table.rolesCount', { count: roleIds.length })}
        </Badge>
      </button>
      <StaffRolesDialog
        roles={resolved}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}

function targetMinRank(user: CommunityUser, rolesById: Map<string, CommunityRole>): number {
  return Math.min(...(user.roleIds ?? []).map((id) => rolesById.get(id)?.rank ?? Infinity));
}

export function StaffTable({
  data,
  isLoading,
  error,
  onRetry,
  isSupervisor,
  canDeletePerm,
  onChangeRole,
  onDelete,
  currentUserCognitoId,
  rolesById,
  callerMinRank,
}: StaffTableProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('staff.table.cognitoId')}</TableHead>
            <TableHead>{t('staff.table.name')}</TableHead>
            <TableHead>{t('staff.table.surname')}</TableHead>
            <TableHead>{t('staff.table.email')}</TableHead>
            <TableHead>{t('staff.table.roles')}</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <TableRow>
              <TableCell colSpan={COLUMNS} className="h-24 text-center">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onRetry}>
                  {t('common.retry')}
                </Button>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={COLUMNS}
                className="h-24 text-center text-sm text-muted-foreground"
              >
                {t('staff.noResults')}
              </TableCell>
            </TableRow>
          ) : (
            data.map((user) => (
              <TableRow key={user._id} className='group'>
                <TableCell>
                  <CopyableId id={user.cognitoId} />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.name ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.surname ?? '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {user.email ?? '—'}
                </TableCell>
                <TableCell>
                  <RoleCell roleIds={user.roleIds} rolesById={rolesById} />
                </TableCell>
                <TableCell>
                  {(() => {
                    const tRank = targetMinRank(user, rolesById);
                    const canEdit = isSupervisor && callerMinRank <= tRank;
                    const canDelete = canDeletePerm && callerMinRank < tRank;
                    return canEdit || canDelete ? (
                      <StaffRowActions
                        user={user}
                        onChangeRole={onChangeRole}
                        onDelete={onDelete}
                        canDelete={canDelete}
                        currentUserCognitoId={currentUserCognitoId}
                      />
                    ) : (
                      <div className="h-8 w-8" aria-hidden="true" />
                    );
                  })()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
