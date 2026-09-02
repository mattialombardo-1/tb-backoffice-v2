import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useCan } from '@/lib/auth';
import { Route } from '@/routes/_authenticated/packages';
import { usePackagesList } from '@/lib/hooks/usePackagesList';
import { useSkusList } from '@/lib/hooks/useSkusList';
import { useApiClient } from '@/lib/api/useApiClient';
import { useBulkSelection } from '@/lib/hooks/useBulkSelection';
import { packagesService } from '@/lib/services/packages';
import { skusService } from '@/lib/services/skus';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Package, PackageFilters } from '@/lib/types/packages';
import type { SkuFilters, Sku } from '@/lib/types/skus';
import type { SearchField } from '@/components/packages/PackagesFilters';
import { PackagesTable } from './PackagesTable';
import { PackagesPagination } from './PackagesPagination';
import { PackagesToggleDialog } from './PackagesToggleDialog';
import type { ToggleField } from './PackagesToggleDialog';
import { PackagesEditDialog } from './PackagesEditDialog';
import { PackagesDuplicateDialog } from './PackagesDuplicateDialog';
import { PackagesDeleteDialog } from './PackagesDeleteDialog';
import { PackagesBulkBar } from './PackagesBulkBar';
import type { BulkAction } from './PackagesBulkBar';
import { PackagesBulkDialog } from './PackagesBulkDialog';
import { SkusTable } from './SkusTable';
import { SkusEditDialog } from './SkusEditDialog';
import { SkusDeleteDialog } from './SkusDeleteDialog';
import { SkusBulkBar } from './SkusBulkBar';
import { SkusBulkDialog } from './SkusBulkDialog';
import { PackagesCreateDialog } from './PackagesCreateDialog';
import { PackagesFilters } from './PackagesFilters';
import { SkusCreateDialog } from './SkusCreateDialog';

const PER_PAGE = 20;
type TabValue = 'packages' | 'skus';

export function PackagesPage() {
  const { t } = useTranslation();
  const canCreatePackage = useCan('packages', 'CREATE');
  const canCreateSku = useCan('skus', 'CREATE');
  const search = Route.useSearch();
  const navigate = useNavigate();
  const client = useApiClient();

  const activeTab: TabValue = search.tab ?? 'packages';
  const currentPage = search.page ?? 1;
  const currentSearch = search.search ?? '';
  const currentSearchField: SearchField = search.searchField ?? 'name';

  const pkgFilters: PackageFilters = {
    page: activeTab === 'packages' ? currentPage : 1,
    searchField: activeTab === 'packages' ? currentSearchField : undefined,
    search: activeTab === 'packages' ? currentSearch || undefined : undefined,
  };
  const skuFilters: SkuFilters = {
    page: activeTab === 'skus' ? currentPage : 1,
    searchField: activeTab === 'skus' ? currentSearchField : undefined,
    search: activeTab === 'skus' ? currentSearch || undefined : undefined,
  };

  const pkgList = usePackagesList(pkgFilters);
  const skuList = useSkusList(skuFilters);

  const [createPkgOpen, setCreatePkgOpen] = useState(false);
  const [createPkgLoading, setCreatePkgLoading] = useState(false);
  const [createSkuOpen, setCreateSkuOpen] = useState(false);
  const [createSkuLoading, setCreateSkuLoading] = useState(false);

  const [toggleTarget, setToggleTarget] = useState<{ pkg: Package; field: ToggleField } | null>(
    null
  );
  const [toggleLoading, setToggleLoading] = useState(false);
  const [editPkg, setEditPkg] = useState<Package | null>(null);
  const [editPkgLoading, setEditPkgLoading] = useState(false);
  const [duplicatePkg, setDuplicatePkg] = useState<Package | null>(null);
  const [duplicatePkgLoading, setDuplicatePkgLoading] = useState(false);
  const [deletePkg, setDeletePkg] = useState<Package | null>(null);
  const [deletePkgLoading, setDeletePkgLoading] = useState(false);

  const pkgBulk = useBulkSelection();
  const [pkgBulkAction, setPkgBulkAction] = useState<BulkAction | null>(null);
  const [pkgBulkLoading, setPkgBulkLoading] = useState(false);

  const pkgPageIds = pkgList.data.map((p) => p.id);
  const isPkgPageFullySelected = pkgBulk.isPageFullySelected(pkgPageIds);

  const [editSku, setEditSku] = useState<Sku | null>(null);
  const [editSkuLoading, setEditSkuLoading] = useState(false);
  const [deleteSku, setDeleteSku] = useState<Sku | null>(null);
  const [deleteSkuLoading, setDeleteSkuLoading] = useState(false);
  const [skuBulkDeleteOpen, setSkuBulkDeleteOpen] = useState(false);
  const [skuBulkLoading, setSkuBulkLoading] = useState(false);

  const skuBulk = useBulkSelection();
  const skuPageIds = skuList.data.map((s) => s.id);
  const isSkuPageFullySelected = skuBulk.isPageFullySelected(skuPageIds);

  const handleCreatePkg = async (payload: {
    skuId: string;
    active: boolean;
    isFree: boolean;
    timed: boolean;
    name: string;
    expiresAt: string | null;
    collectionIds: string[];
    poolIds: string[];
  }) => {
    setCreatePkgLoading(true);
    try {
      await packagesService.create(client, payload);
      toast.success(t('packages.createPackageDialog.success'));
      setCreatePkgOpen(false);
      pkgList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.createPackageDialog.error'));
    } finally {
      setCreatePkgLoading(false);
    }
  };

  const handleCreateSku = async (payload: {
    code: string;
    name: string;
    brands: { id: string; name: string }[];
    url?: string;
  }) => {
    setCreateSkuLoading(true);
    try {
      await skusService.create(client, payload);
      toast.success(t('packages.createSkuDialog.success'));
      setCreateSkuOpen(false);
      skuList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.createSkuDialog.error'));
    } finally {
      setCreateSkuLoading(false);
    }
  };

  const switchTab = (tab: TabValue) => {
    pkgBulk.clearSelection();
    skuBulk.clearSelection();
    navigate({ to: '/packages', search: { tab: tab === 'packages' ? undefined : tab } });
  };

  const updatePage = (page: number) => {
    navigate({
      to: '/packages',
      search: {
        tab: activeTab === 'packages' ? undefined : activeTab,
        page: page > 1 ? page : undefined,
        searchField: currentSearchField === 'name' ? undefined : currentSearchField,
        search: currentSearch || undefined,
      },
    });
  };

  const updateSearch = (value: string) => {
    navigate({
      to: '/packages',
      search: {
        tab: activeTab === 'packages' ? undefined : activeTab,
        searchField: currentSearchField === 'name' ? undefined : currentSearchField,
        search: value || undefined,
      },
    });
  };

  const updateSearchField = (field: SearchField) => {
    navigate({
      to: '/packages',
      search: {
        tab: activeTab === 'packages' ? undefined : activeTab,
        searchField: field === 'name' ? undefined : field,
        search: undefined,
      },
    });
  };

  const handleToggleConfirm = async (pkg: Package, field: ToggleField) => {
    setToggleLoading(true);
    try {
      if (field === 'active') {
        await packagesService.setActive(client, pkg.id, !pkg.active);
        const name = pkg.name ?? pkg.skuCode ?? '';
        const status = !pkg.active
          ? t('packages.toggleDialog.activeOn')
          : t('packages.toggleDialog.activeOff');
        toast.success(t('packages.toggleDialog.success', { name, status }));
      } else if (field === 'timed') {
        await packagesService.update(client, pkg.id, { timed: !pkg.timed });
        const name = pkg.name ?? pkg.skuCode ?? '';
        const status = !pkg.timed
          ? t('packages.toggleDialog.timedOn')
          : t('packages.toggleDialog.timedOff');
        toast.success(t('packages.toggleDialog.success', { name, status }));
      } else {
        toast.info(t('packages.toggleDialog.featureNotAvailable'));
      }
      setToggleTarget(null);
      pkgList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.toggleDialog.error'));
    } finally {
      setToggleLoading(false);
    }
  };

  const handleEditPkgConfirm = async (
    pkg: Package,
    payload: {
      name: string;
      timed: boolean;
      expiresAt: string | null;
      collectionIds: string[];
      poolIds: string[];
    }
  ) => {
    setEditPkgLoading(true);
    try {
      await packagesService.update(client, pkg.id, payload);
      toast.success(t('packages.editPackageDialog.success'));
      setEditPkg(null);
      pkgList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.editPackageDialog.error'));
    } finally {
      setEditPkgLoading(false);
    }
  };

  const handleDuplicatePkgConfirm = async (
    _pkg: Package,
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
  ) => {
    setDuplicatePkgLoading(true);
    try {
      await packagesService.create(client, payload);
      toast.success(t('packages.duplicatePackageDialog.success'));
      setDuplicatePkg(null);
      pkgList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.duplicatePackageDialog.error'));
    } finally {
      setDuplicatePkgLoading(false);
    }
  };

  const handleDeletePkgConfirm = async (pkg: Package) => {
    setDeletePkgLoading(true);
    const name = pkg.name ?? pkg.skuCode ?? pkg.id;
    try {
      await packagesService.delete(client, pkg.id);
      toast.success(t('packages.deletePackageDialog.success', { name }));
      setDeletePkg(null);
      pkgList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.deletePackageDialog.error'));
    } finally {
      setDeletePkgLoading(false);
    }
  };

  const handlePkgBulkConfirm = async () => {
    if (!pkgBulkAction) return;
    const ids = Array.from(pkgBulk.selectedIds);
    const count = ids.length;
    setPkgBulkLoading(true);
    try {
      if (pkgBulkAction === 'setActive' || pkgBulkAction === 'setInactive') {
        const active = pkgBulkAction === 'setActive';
        await Promise.all(ids.map((id) => packagesService.setActive(client, id, active)));
        if (active) {
          toast.success(t('packages.bulkPackageDialog.activateDesc', { count }));
        } else {
          toast.success(t('packages.bulkPackageDialog.deactivateDesc', { count }));
        }
      } else if (pkgBulkAction === 'delete') {
        await Promise.all(ids.map((id) => packagesService.delete(client, id)));
        toast.success(t('packages.bulkPackageDialog.deleteDesc', { count }));
      } else {
        toast.info(t('packages.toggleDialog.featureNotAvailable'));
      }
      setPkgBulkAction(null);
      pkgBulk.clearSelection();
      pkgList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.bulkPackageDialog.error'));
    } finally {
      setPkgBulkLoading(false);
    }
  };

  const handlePkgTogglePage = () => {
    if (isPkgPageFullySelected) pkgBulk.deselectPage(pkgPageIds);
    else pkgBulk.selectPage(pkgPageIds);
  };

  const handleEditSkuConfirm = async (sku: Sku, payload: { name: string; code: string }) => {
    setEditSkuLoading(true);
    try {
      await skusService.update(client, sku.id, payload);
      toast.success(t('packages.editSkuDialog.success'));
      setEditSku(null);
      skuList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.editSkuDialog.error'));
    } finally {
      setEditSkuLoading(false);
    }
  };

  const handleDeleteSkuConfirm = async (sku: Sku) => {
    setDeleteSkuLoading(true);
    try {
      await skusService.delete(client, sku.id);
      toast.success(t('packages.deleteSkuDialog.success', { name: sku.name }));
      setDeleteSku(null);
      skuList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.deleteSkuDialog.error'));
    } finally {
      setDeleteSkuLoading(false);
    }
  };

  const handleSkuBulkDeleteConfirm = async () => {
    const ids = Array.from(skuBulk.selectedIds);
    const count = ids.length;
    setSkuBulkLoading(true);
    try {
      await Promise.all(ids.map((id) => skusService.delete(client, id)));
      toast.success(t('packages.bulkSkuDialog.success', { count }));
      setSkuBulkDeleteOpen(false);
      skuBulk.clearSelection();
      skuList.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('packages.bulkSkuDialog.error'));
    } finally {
      setSkuBulkLoading(false);
    }
  };

  const handleSkuTogglePage = () => {
    if (isSkuPageFullySelected) skuBulk.deselectPage(skuPageIds);
    else skuBulk.selectPage(skuPageIds);
  };

  const activePagination =
    activeTab === 'packages'
      ? { total: pkgList.total, page: pkgFilters.page }
      : { total: skuList.total, page: skuFilters.page };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('packages.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('packages.subtitle')}</p>
          </div>
          {activeTab === 'packages' && canCreatePackage && (
            <Button onClick={() => setCreatePkgOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('packages.createPackage')}
            </Button>
          )}
          {activeTab === 'skus' && canCreateSku && (
            <Button onClick={() => setCreateSkuOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('packages.createSku')}
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(v) => switchTab(v as TabValue)}>
          <div className="flex items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="packages">{t('packages.tabPackages')}</TabsTrigger>
              <TabsTrigger value="skus">{t('packages.tabSkus')}</TabsTrigger>
            </TabsList>
            <PackagesFilters
              search={currentSearch}
              onSearchChange={updateSearch}
              searchField={currentSearchField}
              onSearchFieldChange={updateSearchField}
              codeLabel={
                activeTab === 'packages'
                  ? t('packages.searchFieldSkuCode')
                  : t('packages.searchFieldCode')
              }
            />
          </div>

          <TabsContent value="packages">
            <PackagesTable
              data={pkgList.data}
              isLoading={pkgList.isLoading}
              error={pkgList.error}
              onRetry={pkgList.refetch}
              onToggle={(pkg, field) => setToggleTarget({ pkg, field })}
              onEdit={setEditPkg}
              onDuplicate={setDuplicatePkg}
              onDelete={setDeletePkg}
              isSelected={pkgBulk.isSelected}
              isPageFullySelected={isPkgPageFullySelected}
              onToggleItem={pkgBulk.toggleItem}
              onTogglePage={handlePkgTogglePage}
            />
          </TabsContent>

          <TabsContent value="skus">
            <SkusTable
              data={skuList.data}
              isLoading={skuList.isLoading}
              error={skuList.error}
              onRetry={skuList.refetch}
              onEdit={setEditSku}
              onDelete={setDeleteSku}
              isSelected={skuBulk.isSelected}
              isPageFullySelected={isSkuPageFullySelected}
              onToggleItem={skuBulk.toggleItem}
              onTogglePage={handleSkuTogglePage}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4 space-y-3">
        {activeTab === 'packages' && (
          <PackagesBulkBar
            selectedCount={pkgBulk.selectedCount}
            onAction={setPkgBulkAction}
            onClear={pkgBulk.clearSelection}
          />
        )}
        {activeTab === 'skus' && (
          <SkusBulkBar
            selectedCount={skuBulk.selectedCount}
            onDelete={() => setSkuBulkDeleteOpen(true)}
            onClear={skuBulk.clearSelection}
          />
        )}
        <PackagesPagination
          page={activePagination.page}
          total={activePagination.total}
          perPage={PER_PAGE}
          onPageChange={updatePage}
        />
      </div>

      <PackagesCreateDialog
        open={createPkgOpen}
        isLoading={createPkgLoading}
        onConfirm={handleCreatePkg}
        onCancel={() => setCreatePkgOpen(false)}
      />
      <SkusCreateDialog
        open={createSkuOpen}
        isLoading={createSkuLoading}
        onConfirm={handleCreateSku}
        onCancel={() => setCreateSkuOpen(false)}
      />

      <PackagesToggleDialog
        pkg={toggleTarget?.pkg ?? null}
        field={toggleTarget?.field ?? null}
        isLoading={toggleLoading}
        onConfirm={handleToggleConfirm}
        onCancel={() => setToggleTarget(null)}
      />
      <PackagesEditDialog
        pkg={editPkg}
        isLoading={editPkgLoading}
        onConfirm={handleEditPkgConfirm}
        onCancel={() => setEditPkg(null)}
      />
      <PackagesDuplicateDialog
        pkg={duplicatePkg}
        isLoading={duplicatePkgLoading}
        onConfirm={handleDuplicatePkgConfirm}
        onCancel={() => setDuplicatePkg(null)}
      />
      <PackagesDeleteDialog
        pkg={deletePkg}
        isLoading={deletePkgLoading}
        onConfirm={handleDeletePkgConfirm}
        onCancel={() => setDeletePkg(null)}
      />
      <PackagesBulkDialog
        action={pkgBulkAction}
        selectedCount={pkgBulk.selectedCount}
        isLoading={pkgBulkLoading}
        onConfirm={handlePkgBulkConfirm}
        onCancel={() => setPkgBulkAction(null)}
      />

      <SkusEditDialog
        sku={editSku}
        isLoading={editSkuLoading}
        onConfirm={handleEditSkuConfirm}
        onCancel={() => setEditSku(null)}
      />
      <SkusDeleteDialog
        sku={deleteSku}
        isLoading={deleteSkuLoading}
        onConfirm={handleDeleteSkuConfirm}
        onCancel={() => setDeleteSku(null)}
      />
      <SkusBulkDialog
        open={skuBulkDeleteOpen}
        selectedCount={skuBulk.selectedCount}
        isLoading={skuBulkLoading}
        onConfirm={handleSkuBulkDeleteConfirm}
        onCancel={() => setSkuBulkDeleteOpen(false)}
      />
    </div>
  );
}
