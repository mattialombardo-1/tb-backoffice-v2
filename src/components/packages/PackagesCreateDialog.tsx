import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Check, ChevronsUpDown, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { skusService } from '@/lib/services/skus';
import { collectionsService, type Collection } from '@/lib/services/collections';
import { poolsService } from '@/lib/services/pools';

interface PackagesCreateDialogProps {
  open: boolean;
  isLoading: boolean;
  onConfirm: (payload: {
    skuId: string;
    active: boolean;
    isFree: boolean;
    timed: boolean;
    name: string;
    expiresAt: string | null;
    collectionIds: string[];
    poolIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export function PackagesCreateDialog({
  open,
  isLoading,
  onConfirm,
  onCancel,
}: PackagesCreateDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  const [skuId, setSkuId] = useState('');
  const skuCacheRef = useRef<Map<string, { name: string; code: string }>>(new Map());
  const [skuOpen, setSkuOpen] = useState(false);
  const [skuSearch, setSkuSearch] = useState('');
  const [skuSearchDebounced, setSkuSearchDebounced] = useState('');
  const [name, setName] = useState('');
  const [active, setActive] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [timed, setTimed] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collectionsSearch, setCollectionsSearch] = useState('');
  const [collectionsSearchDebounced, setCollectionsSearchDebounced] = useState('');
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [poolsOpen, setPoolsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSkuSearchDebounced(skuSearch), 300);
    return () => clearTimeout(timer);
  }, [skuSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setCollectionsSearchDebounced(collectionsSearch), 300);
    return () => clearTimeout(timer);
  }, [collectionsSearch]);

  const skusQuery = useQuery({
    queryKey: ['skus', 'combobox', skuSearchDebounced],
    queryFn: ({ signal }) =>
      skusService.list(
        client,
        { page: 1, limit: 50, search: skuSearchDebounced || undefined },
        signal
      ),
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  const isObjectId = /^[0-9a-fA-F]{24}$/.test(collectionsSearchDebounced);

  const collectionsQuery = useQuery({
    queryKey: ['collections', 'combobox', collectionsSearchDebounced],
    queryFn: ({ signal }) =>
      isObjectId
        ? collectionsService.getById(client, collectionsSearchDebounced, signal)
        : collectionsService.list(
            client,
            { page: 1, limit: 30, search: collectionsSearchDebounced || undefined },
            signal
          ),
    enabled: open,
    staleTime: 2 * 60 * 1000,
  });

  const poolsQuery = useQuery({
    queryKey: ['pools', 'all'],
    queryFn: ({ signal }) => poolsService.list(client, { page: 1, limit: 200 }, signal),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const rawSkus = skusQuery.data?.skus ?? [];
  // Every SKU that appears in any search result is stored in the cache ref.
  // The ref never resets between renders, so the trigger can always display the
  // selected SKU even after the search query changes and it leaves rawSkus.
  rawSkus.forEach((s) => {
    skuCacheRef.current.set(s.id, { name: s.name, code: s.code });
  });
  const skuFromCache = skuId ? skuCacheRef.current.get(skuId) : undefined;
  const selectedSkuData = skuFromCache ? { id: skuId, ...skuFromCache } : null;
  // Also inject the selected SKU into the dropdown list so its checkmark stays
  // visible when the current search results no longer include it.
  const skus =
    selectedSkuData && !rawSkus.some((s) => s.id === skuId)
      ? [selectedSkuData as (typeof rawSkus)[number], ...rawSkus]
      : rawSkus;

  const collections = collectionsQuery.data?.collections ?? [];
  const pools = poolsQuery.data?.pools ?? [];

  const selectedPools = pools.filter((p) => poolIds.includes(p.id));

  const toggleCollection = (collection: Collection) =>
    setSelectedCollections((prev) =>
      prev.some((c) => c.id === collection.id)
        ? prev.filter((c) => c.id !== collection.id)
        : [...prev, collection]
    );

  const togglePool = (id: string) =>
    setPoolIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const reset = () => {
    setSkuId('');
    skuCacheRef.current.clear();
    setSkuOpen(false);
    setSkuSearch('');
    setSkuSearchDebounced('');
    setName('');
    setActive(false);
    setIsFree(false);
    setTimed(false);
    setExpiresAt('');
    setSelectedCollections([]);
    setCollectionsOpen(false);
    setCollectionsSearch('');
    setCollectionsSearchDebounced('');
    setPoolIds([]);
    setPoolsOpen(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      reset();
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const expiresAtIso = expiresAt ? new Date(expiresAt).toISOString() : null;
    await onConfirm({
      skuId,
      active,
      isFree,
      timed,
      name: name.trim(),
      expiresAt: expiresAtIso,
      collectionIds: selectedCollections.map((c) => c.id),
      poolIds,
    });
    reset();
  };

  const isValid =
    !!skuId && !!name.trim() && (selectedCollections.length > 0 || poolIds.length > 0);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('packages.createPackageDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>
              {t('packages.createPackageDialog.skuLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Popover open={skuOpen} onOpenChange={setSkuOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={skuOpen}
                  disabled={isLoading}
                  className="w-full justify-between font-normal"
                >
                  {selectedSkuData ? (
                    <span>
                      {selectedSkuData.name}{' '}
                      <span className="font-mono text-muted-foreground text-xs">
                        ({selectedSkuData.code})
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      {t('packages.createPackageDialog.skuSelect')}
                    </span>
                  )}
                  <ChevronsUpDown className="opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t('packages.createPackageDialog.skuSearch')}
                    className="h-9"
                    value={skuSearch}
                    onValueChange={setSkuSearch}
                  />
                  <CommandList onWheel={(e) => e.stopPropagation()}>
                    {skus.length === 0 && !skusQuery.isFetching ? (
                      <CommandEmpty>{t('packages.createPackageDialog.skuNotFound')}</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {skusQuery.isFetching && (
                          <div className="px-2 py-1.5 text-xs text-muted-foreground">
                            {t('packages.createPackageDialog.skuLoading')}
                          </div>
                        )}
                        {skus.map((s) => (
                          <CommandItem
                            key={s.id}
                            value={s.id}
                            onSelect={() => {
                              setSkuId(s.id);
                              setSkuOpen(false);
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
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {skus.length === 0 && !skusQuery.isLoading && (
              <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <span>{t('packages.createPackageDialog.skuEmpty')}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-name">
              {t('packages.createPackageDialog.nameLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('packages.createPackageDialog.namePlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('packages.createPackageDialog.collectionsLabel')}</Label>
            <Popover
              open={collectionsOpen}
              onOpenChange={(v) => {
                setCollectionsOpen(v);
                if (!v) setCollectionsSearch('');
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  disabled={isLoading}
                  className="w-full justify-between min-h-10 h-auto font-normal"
                >
                  <div className="flex gap-1 flex-wrap">
                    {selectedCollections.length === 0 ? (
                      <span className="text-muted-foreground">
                        {t('packages.createPackageDialog.collectionsSelect')}
                      </span>
                    ) : (
                      selectedCollections.map((c) => (
                        <Badge
                          variant="secondary"
                          key={c.id}
                          className="mr-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCollection(c);
                          }}
                        >
                          {c.name}
                          <button
                            className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={() => toggleCollection(c)}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <ChevronsUpDown className="opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder={t('packages.createPackageDialog.collectionsSearch')}
                    className="h-9"
                    value={collectionsSearch}
                    onValueChange={setCollectionsSearch}
                  />
                  <CommandList onWheel={(e) => e.stopPropagation()}>
                    {collectionsQuery.isFetching ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {t('packages.createPackageDialog.skuLoading')}
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          {t('packages.createPackageDialog.collectionsNotFound')}
                        </CommandEmpty>
                        <CommandGroup>
                          {collections.map((c) => (
                            <CommandItem
                              key={c.id}
                              value={c.id}
                              onSelect={() => toggleCollection(c)}
                            >
                              {c.name}
                              {c.type && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  ({c.type})
                                </span>
                              )}
                              <Check
                                className={cn(
                                  'ml-auto h-4 w-4',
                                  selectedCollections.some((s) => s.id === c.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
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

          <div className="space-y-2">
            <Label>{t('packages.createPackageDialog.poolsLabel')}</Label>
            <Popover open={poolsOpen} onOpenChange={setPoolsOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  disabled={isLoading || poolsQuery.isLoading}
                  className="w-full justify-between min-h-10 h-auto font-normal"
                >
                  <div className="flex gap-1 flex-wrap">
                    {poolIds.length === 0 ? (
                      <span className="text-muted-foreground">
                        {poolsQuery.isLoading
                          ? t('packages.createPackageDialog.poolsLoading')
                          : t('packages.createPackageDialog.poolsSelect')}
                      </span>
                    ) : (
                      selectedPools.map((p) => (
                        <Badge
                          variant="secondary"
                          key={p.id}
                          className="mr-1"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            togglePool(p.id);
                          }}
                        >
                          {p.name}
                          <button
                            className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={() => togglePool(p.id)}
                          >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                  <ChevronsUpDown className="opacity-50 shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                <Command>
                  <CommandInput
                    placeholder={t('packages.createPackageDialog.poolsSearch')}
                    className="h-9"
                  />
                  <CommandList onWheel={(e) => e.stopPropagation()}>
                    <CommandEmpty>{t('packages.createPackageDialog.poolsNotFound')}</CommandEmpty>
                    <CommandGroup>
                      {pools.map((p) => (
                        <CommandItem key={p.id} value={p.name} onSelect={() => togglePool(p.id)}>
                          {p.name}
                          <Check
                            className={cn(
                              'ml-auto h-4 w-4',
                              poolIds.includes(p.id) ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pkg-active">{t('packages.createPackageDialog.activeLabel')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('packages.createPackageDialog.activeDesc')}
              </p>
            </div>
            <Switch
              id="pkg-active"
              checked={active}
              onCheckedChange={setActive}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pkg-isfree">{t('packages.createPackageDialog.freeLabel')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('packages.createPackageDialog.freeDesc')}
              </p>
            </div>
            <Switch
              id="pkg-isfree"
              checked={isFree}
              onCheckedChange={setIsFree}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="pkg-timed">{t('packages.createPackageDialog.timedLabel')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('packages.createPackageDialog.timedDesc')}
              </p>
            </div>
            <Switch
              id="pkg-timed"
              checked={timed}
              onCheckedChange={setTimed}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pkg-expires">{t('packages.createPackageDialog.expiryLabel')}</Label>
            <Input
              id="pkg-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {t('packages.createPackageDialog.expiryDesc')}
            </p>
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
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading
                ? t('packages.createPackageDialog.creating')
                : t('packages.createPackageDialog.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
