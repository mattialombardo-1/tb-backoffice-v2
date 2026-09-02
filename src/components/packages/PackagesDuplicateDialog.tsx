import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { skusService } from '@/lib/services/skus';
import type { Package } from '@/lib/types/packages';

interface PackagesDuplicateDialogProps {
  pkg: Package | null;
  isLoading: boolean;
  onConfirm: (
    pkg: Package,
    payload: {
      skuId: string;
      active: boolean;
      isFree: boolean;
      timed: boolean;
      name: string;
      expiresAt: string | null;
      collectionIds: string[];
      poolIds: string[];
    }
  ) => Promise<void>;
  onCancel: () => void;
}

export function PackagesDuplicateDialog({
  pkg,
  isLoading,
  onConfirm,
  onCancel,
}: PackagesDuplicateDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  const open = pkg !== null;
  const [name, setName] = useState('');
  const [selectedSku, setSelectedSku] = useState<{
    id: string;
    name: string;
    code: string;
  } | null>(null);
  const [skuOpen, setSkuOpen] = useState(false);
  const [skuSearch, setSkuSearch] = useState('');
  const [skuSearchDebounced, setSkuSearchDebounced] = useState('');

  // Pre-fill name with a "(copia)" suffix and pre-select the original SKU
  // whenever a new package is targeted (adjust state during render).
  const [prevPkgId, setPrevPkgId] = useState<string | null>(null);
  if (pkg && pkg.id !== prevPkgId) {
    setPrevPkgId(pkg.id);
    setName(`${pkg.name ?? pkg.skuCode ?? ''} (copia)`);
    setSelectedSku({ id: pkg.skuId, name: pkg.skuName ?? '', code: pkg.skuCode ?? '' });
  }

  useEffect(() => {
    const timer = setTimeout(() => setSkuSearchDebounced(skuSearch), 300);
    return () => clearTimeout(timer);
  }, [skuSearch]);

  // Server-side autocomplete: only fetch matching SKUs once the user types,
  // instead of loading the entire catalogue up front.
  const skusQuery = useQuery({
    queryKey: ['skus', 'combobox', skuSearchDebounced],
    queryFn: ({ signal }) =>
      skusService.list(
        client,
        { page: 1, limit: 30, search: skuSearchDebounced || undefined },
        signal
      ),
    enabled: open && skuSearchDebounced.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const skus = skusQuery.data?.skus ?? [];
  const skuId = selectedSku?.id ?? '';

  const isValid = !!skuId && !!name.trim();

  const handleOpenChange = (next: boolean) => {
    if (!next && !isLoading) {
      setSkuOpen(false);
      setSkuSearch('');
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg || !isValid) return;
    await onConfirm(pkg, {
      skuId,
      active: pkg.active,
      isFree: pkg.isFree,
      timed: pkg.timed,
      name: name.trim(),
      expiresAt: pkg.expiresAt,
      collectionIds: pkg.collectionIds,
      poolIds: pkg.poolIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('packages.duplicatePackageDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('packages.duplicatePackageDialog.desc', {
              name: pkg?.name ?? pkg?.skuCode ?? '',
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="duplicate-pkg-name">
              {t('packages.duplicatePackageDialog.nameLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="duplicate-pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('packages.duplicatePackageDialog.namePlaceholder')}
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('packages.duplicatePackageDialog.skuLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Popover
              open={skuOpen}
              onOpenChange={(v) => {
                setSkuOpen(v);
                if (!v) setSkuSearch('');
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={skuOpen}
                  disabled={isLoading}
                  className="w-full justify-between font-normal"
                >
                  {selectedSku && selectedSku.id ? (
                    <span>
                      {selectedSku.name}
                      {selectedSku.code && (
                        <span className="ml-1 font-mono text-muted-foreground text-xs">
                          ({selectedSku.code})
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t('packages.duplicatePackageDialog.skuSelect')}
                    </span>
                  )}
                  <ChevronsUpDown className="opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t('packages.duplicatePackageDialog.skuSearch')}
                    className="h-9"
                    value={skuSearch}
                    onValueChange={setSkuSearch}
                  />
                  <CommandList onWheel={(e) => e.stopPropagation()}>
                    {skuSearchDebounced.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {t('packages.duplicatePackageDialog.skuTypeToSearch')}
                      </div>
                    ) : skusQuery.isFetching ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {t('packages.duplicatePackageDialog.skuLoading')}
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          {t('packages.duplicatePackageDialog.skuNotFound')}
                        </CommandEmpty>
                        <CommandGroup>
                          {skus.map((s) => (
                            <CommandItem
                              key={s.id}
                              value={s.id}
                              onSelect={() => {
                                setSelectedSku({ id: s.id, name: s.name, code: s.code });
                                setSkuOpen(false);
                                setSkuSearch('');
                              }}
                            >
                              {s.name}
                              <span className="ml-1 font-mono text-xs text-muted-foreground">
                                ({s.code})
                              </span>
                              <Check
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  skuId === s.id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading
                ? t('packages.duplicatePackageDialog.duplicating')
                : t('packages.duplicatePackageDialog.duplicate')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
