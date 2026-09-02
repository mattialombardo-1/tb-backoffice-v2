import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { queryKeys } from '@/lib/query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Campaign } from '@/lib/types/campaigns';

interface Props {
  campaign: Campaign | null;
  onOpenChange: (open: boolean) => void;
}

export function EditCampaignDialog({ campaign, onOpenChange }: Props) {
  const { t } = useTranslation();
  const client = useApiClient();
  const queryClient = useQueryClient();

  const [name, setName] = useState(campaign?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync name field when the target campaign changes
  useEffect(() => {
    if (campaign) {
      setName(campaign.name);
      setError(null);
    }
  }, [campaign?.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !campaign) return;

    setSaving(true);
    setError(null);
    try {
      await campaignsService.update(client, campaign.id, { name: name.trim() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.all });
      // Also invalidate detail if it's cached
      await queryClient.invalidateQueries({ queryKey: queryKeys.campaigns.detail(campaign.id) });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('campaigns.editDialog.error'));
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(v: boolean) {
    if (!saving) onOpenChange(v);
  }

  return (
    <Dialog open={campaign != null} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('campaigns.editDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-campaign-name">{t('campaigns.editDialog.nameLabel')}</Label>
            <Input
              id="edit-campaign-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('campaigns.createDialog.namePlaceholder')}
              disabled={saving}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={saving || !name.trim()}>
              {saving ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
