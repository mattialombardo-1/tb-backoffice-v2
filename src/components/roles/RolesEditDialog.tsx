import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Plus, Trash2 } from 'lucide-react';
import { useApiClient } from '@/lib/api/useApiClient';
import { communityRolesService } from '@/lib/services/communityRoles';
import type { CommunityRole, CommunityRoleCapability, UpdateCommunityRolePayload } from '@/lib/types/communityRoles';

const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
type ActionKey = (typeof ACTIONS)[number];

interface CapRow {
  resource: string;
  actions: ActionKey[];
}

function capabilitiesToRows(caps: CommunityRoleCapability[]): CapRow[] {
  return caps.map((c) => ({
    resource: c.resource,
    actions: c.actions.filter((a): a is ActionKey => (ACTIONS as readonly string[]).includes(a)),
  }));
}

function capRowsToPayload(rows: CapRow[]): CommunityRoleCapability[] {
  return rows
    .filter((r) => r.resource.trim() && r.actions.length > 0)
    .map((r) => ({ resource: r.resource.trim(), actions: r.actions }));
}

function CapabilitiesEditor({
  rows,
  onChange,
}: {
  rows: CapRow[];
  onChange: (rows: CapRow[]) => void;
}) {
  const { t } = useTranslation();
  const setRow = (i: number, patch: Partial<CapRow>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const toggleAction = (i: number, action: ActionKey) => {
    const row = rows[i];
    const next = row.actions.includes(action)
      ? row.actions.filter((a) => a !== action)
      : [...row.actions, action];
    setRow(i, { actions: next });
  };

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-start gap-2">
          <Input
            placeholder={t('roles.createDialog.capResourcePlaceholder')}
            value={row.resource}
            onChange={(e) => setRow(i, { resource: e.target.value })}
            className="w-44 shrink-0"
          />
          <div className="flex items-center gap-3 flex-wrap pt-2">
            {ACTIONS.map((action) => (
              <label key={action} className="flex items-center gap-1.5 cursor-pointer">
                <Checkbox
                  checked={row.actions.includes(action)}
                  onCheckedChange={() => toggleAction(i, action)}
                />
                <span className="text-sm">{action}</span>
              </label>
            ))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mt-1 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...rows, { resource: '', actions: [] }])}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('roles.createDialog.addCapability')}
      </Button>
    </div>
  );
}

interface RolesEditDialogProps {
  role: CommunityRole | null;
  onSuccess: (updated: CommunityRole) => void;
  onCancel: () => void;
}

export function RolesEditDialog({ role, onSuccess, onCancel }: RolesEditDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  const [displayName, setDisplayName] = useState('');
  const [rank, setRank] = useState('');
  const [description, setDescription] = useState('');
  const [capRows, setCapRows] = useState<CapRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!role) return;
    setDisplayName(role.displayName);
    setRank(String(role.rank));
    setDescription(role.description ?? '');
    setCapRows(capabilitiesToRows(role.capabilities));
    setIsSubmitting(false);
  }, [role]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onCancel();
  };

  const rankNum = parseInt(rank, 10);
  const canSubmit =
    !isSubmitting &&
    displayName.trim().length > 0 &&
    rank.trim().length > 0 &&
    !isNaN(rankNum);

  const handleSubmit = async () => {
    if (!role || !canSubmit) return;
    setIsSubmitting(true);

    const payload: UpdateCommunityRolePayload = {
      displayName: displayName.trim(),
      rank: rankNum,
      description: description.trim() || undefined,
      capabilities: capRowsToPayload(capRows),
    };

    try {
      const updated = await communityRolesService.update(client, role._id, payload);
      toast.success(t('roles.editDialog.success', { name: updated.displayName }));
      onSuccess(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('roles.editDialog.error'));
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={!!role} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col p-0">
        <SheetHeader className="border-b px-6 py-4 shrink-0">
          <SheetTitle>{t('roles.editDialog.title')}</SheetTitle>
          <SheetDescription>{role?.displayName ?? ''}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                {t('roles.editDialog.displayNameLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSubmitting}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {t('roles.editDialog.rankLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t('roles.editDialog.descLabel')}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('roles.createDialog.descPlaceholder')}
              disabled={isSubmitting}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t('roles.editDialog.capabilitiesLabel')}</Label>
            <CapabilitiesEditor rows={capRows} onChange={setCapRows} />
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? t('roles.editDialog.saving') : t('roles.editDialog.save')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
