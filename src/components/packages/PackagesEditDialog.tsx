import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronsUpDown, X } from 'lucide-react';
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
import { collectionsService, type Collection } from '@/lib/services/collections';
import { poolsService } from '@/lib/services/pools';
import type { Package } from '@/lib/types/packages';

interface PackagesEditDialogProps {
  pkg: Package | null;
  isLoading: boolean;
  onConfirm: (
    pkg: Package,
    payload: {
      name: string;
      timed: boolean;
      expiresAt: string | null;
      collectionIds: string[];
      poolIds: string[];
    }
  ) => Promise<void>;
  onCancel: () => void;
}

export function PackagesEditDialog({
  pkg,
  isLoading,
  onConfirm,
  onCancel,
}: PackagesEditDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const open = !!pkg;

  const [name, setName] = useState('');
  const [timed, setTimed] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedCollections, setSelectedCollections] = useState<Collection[]>([]);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [collectionsSearch, setCollectionsSearch] = useState('');
  const [collectionsSearchDebounced, setCollectionsSearchDebounced] = useState('');
  const [poolIds, setPoolIds] = useState<string[]>([]);
  const [poolsOpen, setPoolsOpen] = useState(false);

  // Debounce collections search
  useEffect(() => {
    const timer = setTimeout(() => setCollectionsSearchDebounced(collectionsSearch), 300);
    return () => clearTimeout(timer);
  }, [collectionsSearch]);

  // Pre-populate form when pkg changes
  useEffect(() => {
    if (pkg) {
      setName(pkg.name ?? '');
      setTimed(pkg.timed);
      setExpiresAt(pkg.expiresAt ? pkg.expiresAt.slice(0, 16) : '');
      setPoolIds(pkg.poolIds);
      setSelectedCollections([]);
    }
  }, [pkg?.id]);

  // Pre-load existing selected collections by ID
  const preloadQuery = useQuery({
    queryKey: ['collections', 'preload', pkg?.id, pkg?.collectionIds],
    queryFn: async ({ signal }) => {
      if (!pkg || pkg.collectionIds.length === 0) return [];
      const results = await Promise.all(
        pkg.collectionIds.map((id) => collectionsService.getById(client, id, signal))
      );
      return results.flatMap((r) => r.collections);
    },
    enabled: open && !!pkg && pkg.collectionIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (preloadQuery.data && preloadQuery.data.length > 0) {
      setSelectedCollections(preloadQuery.data);
    }
  }, [preloadQuery.data]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg) return;
    const expiresAtIso = expiresAt ? new Date(expiresAt).toISOString() : null;
    await onConfirm(pkg, {
      name: name.trim(),
      timed,
      expiresAt: expiresAtIso,
      collectionIds: selectedCollections.map((c) => c.id),
      poolIds,
    });
  };

  const isValid = !!name.trim();

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('packages.editPackageDialog.title')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>{t('packages.editPackageDialog.skuLabel')}</Label>
            <Input value={pkg?.skuCode ?? '—'} readOnly className="text-muted-foreground" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-pkg-name">
              {t('packages.editPackageDialog.nameLabel')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-pkg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('packages.editPackageDialog.namePlaceholder')}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('packages.editPackageDialog.collectionsLabel')}</Label>
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
                        {preloadQuery.isLoading
                          ? t('packages.editPackageDialog.collectionsLoading')
                          : t('packages.editPackageDialog.collectionsSelect')}
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
                    placeholder={t('packages.editPackageDialog.collectionsSearch')}
                    className="h-9"
                    value={collectionsSearch}
                    onValueChange={setCollectionsSearch}
                  />
                  <CommandList onWheel={(e) => e.stopPropagation()}>
                    {collectionsQuery.isFetching ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        {t('packages.editPackageDialog.collectionsLoading')}
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>
                          {t('packages.editPackageDialog.collectionsNotFound')}
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
            <Label>{t('packages.editPackageDialog.poolsLabel')}</Label>
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
                          ? t('packages.editPackageDialog.poolsLoading')
                          : t('packages.editPackageDialog.poolsSelect')}
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
                    placeholder={t('packages.editPackageDialog.poolsSearch')}
                    className="h-9"
                  />
                  <CommandList onWheel={(e) => e.stopPropagation()}>
                    <CommandEmpty>{t('packages.editPackageDialog.poolsNotFound')}</CommandEmpty>
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
              <Label htmlFor="edit-pkg-timed">{t('packages.editPackageDialog.timedLabel')}</Label>
              <p className="text-xs text-muted-foreground">
                {t('packages.editPackageDialog.timedDesc')}
              </p>
            </div>
            <Switch
              id="edit-pkg-timed"
              checked={timed}
              onCheckedChange={setTimed}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-pkg-expires">{t('packages.editPackageDialog.expiryLabel')}</Label>
            <Input
              id="edit-pkg-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !isValid}>
              {isLoading
                ? t('packages.editPackageDialog.saving')
                : t('packages.editPackageDialog.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
