import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Sku } from '@/lib/types/skus';

interface SkusEditDialogProps {
  sku: Sku | null;
  isLoading: boolean;
  onConfirm: (sku: Sku, payload: { name: string; code: string }) => Promise<void>;
  onCancel: () => void;
}

export function SkusEditDialog({ sku, isLoading, onConfirm, onCancel }: SkusEditDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    if (sku) {
      setName(sku.name);
      setCode(sku.code);
    }
  }, [sku]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sku) onConfirm(sku, { name, code });
  };

  return (
    <Dialog
      open={!!sku}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('packages.editSkuDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku-name">{t('packages.editSkuDialog.nameLabel')}</Label>
            <Input
              id="sku-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('packages.editSkuDialog.namePlaceholder')}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku-code">{t('packages.editSkuDialog.codeLabel')}</Label>
            <Input
              id="sku-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('packages.editSkuDialog.codePlaceholder')}
              disabled={isLoading}
              className="font-mono"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim() || !code.trim()}>
              {isLoading ? t('packages.editSkuDialog.saving') : t('packages.editSkuDialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
