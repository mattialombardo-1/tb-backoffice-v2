import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { Label } from '@/components/ui/label';
import { useApiClient } from '@/lib/api/useApiClient';
import { communityRolesService } from '@/lib/services/communityRoles';
import type { CommunityRoleCapability, CreateCommunityRolePayload } from '@/lib/types/communityRoles';

const ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'] as const;
type ActionKey = (typeof ACTIONS)[number];

interface CapRow {
  resource: string;
  actions: ActionKey[];
}

function emptyRow(): CapRow {
  return { resource: '', actions: [] };
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
        onClick={() => onChange([...rows, emptyRow()])}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        {t('roles.createDialog.addCapability')}
      </Button>
    </div>
  );
}

export function capRowsToPayload(rows: CapRow[]): CommunityRoleCapability[] {
  return rows
    .filter((r) => r.resource.trim() && r.actions.length > 0)
    .map((r) => ({ resource: r.resource.trim(), actions: r.actions }));
}

export function capabilitiesToRows(caps: CommunityRoleCapability[]): CapRow[] {
  return caps.map((c) => ({
    resource: c.resource,
    actions: c.actions.filter((a): a is ActionKey => (ACTIONS as readonly string[]).includes(a)),
  }));
}

interface RolesCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RolesCreateDialog({ open, onClose, onSuccess }: RolesCreateDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rank, setRank] = useState('');
  const [description, setDescription] = useState('');
  const [capRows, setCapRows] = useState<CapRow[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName('');
    setDisplayName('');
    setRank('');
    setDescription('');
    setCapRows([]);
    setIsSubmitting(false);
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !isSubmitting) {
      reset();
      onClose();
    }
  };

  const rankNum = parseInt(rank, 10);
  const canSubmit =
    !isSubmitting &&
    name.trim().length > 0 &&
    displayName.trim().length > 0 &&
    rank.trim().length > 0 &&
    !isNaN(rankNum);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const payload: CreateCommunityRolePayload = {
      name: name.trim(),
      displayName: displayName.trim(),
      rank: rankNum,
      ...(description.trim() ? { description: description.trim() } : {}),
      capabilities: capRowsToPayload(capRows),
    };

    try {
      await communityRolesService.create(client, payload);
      toast.success(t('roles.createDialog.success', { name: payload.displayName }));
      onSuccess();
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('roles.createDialog.error'));
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {t('roles.createDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>
                {t('roles.createDialog.nameLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('roles.createDialog.namePlaceholder')}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                {t('roles.createDialog.rankLabel')} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder={t('roles.createDialog.rankPlaceholder')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>
              {t('roles.createDialog.displayNameLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('roles.createDialog.displayNamePlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <Label>{t('roles.createDialog.descLabel')}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('roles.createDialog.descPlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('roles.createDialog.capabilitiesLabel')}</Label>
            <CapabilitiesEditor rows={capRows} onChange={setCapRows} />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? t('roles.createDialog.creating') : t('roles.createDialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
