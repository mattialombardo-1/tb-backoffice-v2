import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowUpDown, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Route } from '@/routes/_authenticated/tests';
import { useCan } from '@/lib/auth';
import { useTestsList } from '@/lib/hooks/useTestsList';
import { Button } from '@/components/ui/button';
import { ListPagination } from '@/components/ui/list-pagination';
import type { Test, TestBrand, TestFilters } from '@/lib/types/tests';
import { useApiClient } from '@/lib/api/useApiClient';
import { testsService } from '@/lib/services/tests';
import { TestsTable } from './TestsTable';
import { TestsFilters } from './TestsFilters';
import { TestsCreateSheet } from './TestsCreateSheet';
import { TestsEditSheet } from './TestsEditSheet';
import { TestsDeleteDialog } from './TestsDeleteDialog';
import { TestsReorderList } from './TestsReorderList';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const PER_PAGE = 20;

export function TestsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const client = useApiClient();
  const canCreate = useCan('tests', 'CREATE');

  const filters: TestFilters = {
    search: search.search ?? '',
    brandId: search.brandId ?? '',
    year: search.year ?? '',
    page: search.page ?? 1,
  };

  const hasFilters = !!filters.search || !!filters.brandId || !!filters.year;

  const { data, total, isLoading, error, refetch } = useTestsList(filters);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Test | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Test | null>(null);

  // Reorder mode state
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderByBrand, setReorderByBrand] = useState<Record<string, Test[]>>({});
  const [reorderBrands, setReorderBrands] = useState<TestBrand[]>([]);
  const [activeBrandId, setActiveBrandId] = useState('');
  const [isLoadingReorder, setIsLoadingReorder] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSearch = (patch: Partial<typeof search>) => {
    const next = { ...search, ...patch };
    navigate({
      to: '/tests',
      search: {
        search: next.search || undefined,
        brandId: next.brandId || undefined,
        year: next.year || undefined,
        page: next.page && next.page > 1 ? next.page : undefined,
      },
      replace: true,
    });
  };

  const handleFilterChange = (patch: Partial<TestFilters>) => {
    updateSearch({ ...patch, page: undefined });
  };

  const handleReset = () => {
    navigate({ to: '/tests', search: {}, replace: true });
  };

  const updatePage = (page: number) => {
    updateSearch({ page: page > 1 ? page : undefined });
  };

  const handleDelete = async (test: Test) => {
    try {
      await testsService.delete(client, test.id);
      setDeleteTarget(null);
      toast.success(`Test "${test.name}" eliminato`);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore durante l'eliminazione");
    }
  };

  const handleEditSuccess = (_updated: Test) => {
    setEditTarget(null);
    refetch();
  };

  const handleEnterReorderMode = async () => {
    setIsLoadingReorder(true);
    try {
      const result = await testsService.list(client, { page: 1, limit: 1000 });
      const allTests = result.tests;

      // Extract unique brands preserving first-appearance order
      const brandsMap = new Map<string, TestBrand>();
      for (const test of allTests) {
        for (const brand of test.brands) {
          if (!brandsMap.has(brand.id)) {
            brandsMap.set(brand.id, brand);
          }
        }
      }
      const brands = Array.from(brandsMap.values());

      // For each brand, filter tests and sort by brandOrders
      const byBrand: Record<string, Test[]> = {};
      for (const brand of brands) {
        const brandTests = allTests.filter(t => t.brands.some(b => b.id === brand.id));
        brandTests.sort((a, b) => {
          const aOrder = a.brandOrders?.find(bo => bo.brandId === brand.id)?.order ?? 999999;
          const bOrder = b.brandOrders?.find(bo => bo.brandId === brand.id)?.order ?? 999999;
          return aOrder - bOrder;
        });
        byBrand[brand.id] = brandTests;
      }

      setReorderByBrand(byBrand);
      setReorderBrands(brands);
      setActiveBrandId(brands[0]?.id ?? '');
      setReorderMode(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore durante il caricamento dei test');
    } finally {
      setIsLoadingReorder(false);
    }
  };

  const handleSaveReorder = async () => {
    setIsSaving(true);
    try {
      await Promise.all(
        reorderBrands.map(brand =>
          testsService.reorder(
            client,
            brand.id,
            (reorderByBrand[brand.id] ?? []).map((t, i) => ({ id: t.id, order: i }))
          )
        )
      );
      toast.success('Ordine salvato con successo');
      setReorderMode(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore durante il salvataggio dell'ordine");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelReorder = () => {
    setReorderMode(false);
    setReorderByBrand({});
    setReorderBrands([]);
    setActiveBrandId('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">Test</h1>
              {reorderMode && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Modalità riordino
                </span>
              )}
            </div>
            {!reorderMode && !isLoading && (
              <p className="mt-1 text-sm text-muted-foreground">
                {total.toLocaleString('it-IT')} {total === 1 ? 'test' : 'test'}
              </p>
            )}
            {!reorderMode && isLoading && (
              <p className="mt-1 text-sm text-muted-foreground">Caricamento...</p>
            )}
          </div>
          {!reorderMode && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleEnterReorderMode}
                disabled={isLoadingReorder}
              >
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Modifica ordine
              </Button>
              {canCreate && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea test
                </Button>
              )}
            </div>
          )}
        </div>

        {!reorderMode && (
          <TestsFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleReset}
          />
        )}

        {reorderMode ? (
          isLoadingReorder ? (
            <p className="text-sm text-muted-foreground">Caricamento test...</p>
          ) : (
            <Tabs value={activeBrandId} onValueChange={setActiveBrandId}>
              <TabsList>
                {reorderBrands.map(brand => (
                  <TabsTrigger key={brand.id} value={brand.id}>{brand.name}</TabsTrigger>
                ))}
              </TabsList>
              {reorderBrands.map(brand => (
                <TabsContent key={brand.id} value={brand.id} className="mt-4">
                  <TestsReorderList
                    items={reorderByBrand[brand.id] ?? []}
                    onChange={(items) => setReorderByBrand(prev => ({ ...prev, [brand.id]: items }))}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )
        ) : (
          <TestsTable
            data={data}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            hasFilters={hasFilters}
            onResetFilters={handleReset}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        {reorderMode ? (
          <div className="flex items-center gap-2 justify-end">
            <Button variant="outline" onClick={handleCancelReorder} disabled={isSaving}>
              Annulla
            </Button>
            <Button onClick={handleSaveReorder} disabled={isSaving}>
              {isSaving ? 'Salvataggio...' : 'Salva ordine'}
            </Button>
          </div>
        ) : (
          <ListPagination
            page={filters.page}
            total={total}
            perPage={PER_PAGE}
            onPageChange={updatePage}
          />
        )}
      </div>

      {canCreate && (
        <TestsCreateSheet
          open={createOpen}
          onOpenChange={(o) => { if (!o) setCreateOpen(false); }}
          onSuccess={() => { setCreateOpen(false); refetch(); }}
        />
      )}

      <TestsEditSheet
        test={editTarget}
        onSuccess={handleEditSuccess}
        onCancel={() => setEditTarget(null)}
      />

      <TestsDeleteDialog
        test={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
