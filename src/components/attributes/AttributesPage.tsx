import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Plus, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCan } from '@/lib/auth';
import { useAttributesByResource } from '@/lib/hooks/useAttributesByResource';
import type { AttributeItem, AttributeResourceName } from '@/lib/types/attributes';
import { AttributesTable } from './AttributesTable';
import { AttributeDialog } from './AttributeDialog';

const RESOURCES: AttributeResourceName[] = [
  'collections',
  'questions',
  'subjects',
  'users',
  'brands',
];

function ResourceTab({ resource }: { resource: AttributeResourceName }) {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, save } = useAttributesByResource(resource);
  const canUpdate = useCan('attributes', 'UPDATE');
  const canCreate = useCan('attributes', 'CREATE');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{ item: AttributeItem; index: number } | null>(null);

  const currentAttributes = data?.attributes ?? [];

  const handleAdd = async (item: AttributeItem) => {
    try {
      await save([...currentAttributes, item]);
      toast.success(t('attributes.addDialog.success', { name: item.name }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('attributes.addDialog.error');
      toast.error(message);
      throw err;
    }
  };

  const handleEdit = async (item: AttributeItem) => {
    if (!editTarget) return;
    try {
      const updated = currentAttributes.map((a, i) => (i === editTarget.index ? item : a));
      await save(updated);
      toast.success(t('attributes.editDialog.success', { name: item.name }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('attributes.editDialog.error');
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async (index: number) => {
    const removed = currentAttributes[index];
    try {
      await save(currentAttributes.filter((_, i) => i !== index));
      toast.success(t('attributes.deleteSuccess', { name: removed.name }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('attributes.deleteError');
      toast.error(message);
    }
  };

  const openAdd = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  const openEdit = (item: AttributeItem, index: number) => {
    setEditTarget({ item, index });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('attributes.resourceSubtitle', { resource: t(`attributes.resources.${resource}`) })}
        </p>
        {(canCreate || canUpdate) && (
          <Button size="sm" onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" />
            {t('attributes.add')}
          </Button>
        )}
      </div>

      <AttributesTable
        data={currentAttributes}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        canUpdate={canUpdate}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <AttributeDialog
        open={dialogOpen}
        initial={editTarget?.item}
        onClose={() => setDialogOpen(false)}
        onConfirm={editTarget ? handleEdit : handleAdd}
      />
    </div>
  );
}

export function AttributesPage() {
  const { t } = useTranslation();
  const [activeResource, setActiveResource] = useState<AttributeResourceName>('collections');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('attributes.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('attributes.subtitle')}</p>
          </div>
        </div>

        {RESOURCES.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <Tag className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">{t('attributes.empty')}</p>
          </div>
        ) : (
          <Tabs
            value={activeResource}
            onValueChange={(v) => setActiveResource(v as AttributeResourceName)}
          >
            <TabsList>
              {RESOURCES.map((r) => (
                <TabsTrigger key={r} value={r}>
                  {t(`attributes.resources.${r}`)}
                </TabsTrigger>
              ))}
            </TabsList>

            {RESOURCES.map((r) => (
              <TabsContent key={r} value={r} className="mt-4">
                <ResourceTab resource={r} />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
