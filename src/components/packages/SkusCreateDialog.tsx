import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
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

interface Brand {
  _id: string;
  name: string;
}

interface SkusCreateDialogProps {
  open: boolean;
  isLoading: boolean;
  onConfirm: (payload: {
    code: string;
    name: string;
    brands: { id: string; name: string }[];
    url?: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export function SkusCreateDialog({ open, isLoading, onConfirm, onCancel }: SkusCreateDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<Set<string>>(new Set());

  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: ({ signal }) => client.get<Brand[]>('/brands', { signal }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const brands = brandsQuery.data ?? [];

  const reset = () => {
    setName('');
    setCode('');
    setUrl('');
    setSelectedBrandIds(new Set());
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      onCancel();
    }
  };

  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBrands = brands
      .filter((b) => selectedBrandIds.has(b._id))
      .map((b) => ({ id: b._id, name: b.name }));
    await onConfirm({
      code: code.trim(),
      name: name.trim(),
      brands: selectedBrands,
      url: url.trim() || undefined,
    });
    reset();
  };

  const canSubmit = name.trim() && code.trim() && selectedBrandIds.size > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t('packages.createSkuDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="sku-name">
              {t('packages.createSkuDialog.nameLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sku-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('packages.createSkuDialog.namePlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku-code">
              {t('packages.createSkuDialog.codeLabel')} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sku-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder={t('packages.createSkuDialog.codePlaceholder')}
              disabled={isLoading}
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('packages.createSkuDialog.brandLabel')} <span className="text-destructive">*</span>
            </Label>
            {brandsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">
                {t('packages.createSkuDialog.brandLoading')}
              </p>
            ) : brands.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {t('packages.createSkuDialog.brandEmpty')}
              </p>
            ) : (
              <div className="space-y-2 rounded-md border px-3 py-2 max-h-40 overflow-y-auto">
                {brands.map((b) => (
                  <div key={b._id} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${b._id}`}
                      checked={selectedBrandIds.has(b._id)}
                      onCheckedChange={() => toggleBrand(b._id)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`brand-${b._id}`}
                      className="text-sm cursor-pointer select-none"
                    >
                      {b.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku-url">{t('packages.createSkuDialog.urlLabel')}</Label>
            <Input
              id="sku-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('packages.createSkuDialog.urlPlaceholder')}
              disabled={isLoading}
              type="url"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onCancel();
              }}
              disabled={isLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !canSubmit}>
              {isLoading
                ? t('packages.createSkuDialog.creating')
                : t('packages.createSkuDialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
