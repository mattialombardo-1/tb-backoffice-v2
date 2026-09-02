import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BookOpen, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCan } from '@/lib/auth';
import { useSubjectsList } from '@/lib/hooks/useSubjectsList';
import type { Subject } from '@/lib/types/subjects';
import { SubjectsTable } from './SubjectsTable';
import { SubjectsDeleteDialog } from './SubjectsDeleteDialog';
import { SubjectsEditDialog } from './SubjectsEditDialog';
import { SubjectsAddDialog } from './SubjectsAddDialog';
import { SubjectsAddTopicDialog } from './SubjectsAddTopicDialog';

export function SubjectsPage() {
  const { t } = useTranslation();
  const {
    data,
    isLoading,
    error,
    refetch,
    createSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  } = useSubjectsList();

  const canCreate = useCan('subjects', 'CREATE');
  const canUpdate = useCan('subjects', 'UPDATE');
  const canDelete = useCan('subjects', 'DELETE');

  const [search, setSearch] = useState('');
  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [addTopicTarget, setAddTopicTarget] = useState<Subject | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((s) => s.name.toLowerCase().includes(q));
  }, [data, search]);

  const handleAdd = async (name: string) => {
    try {
      await createSubject(name);
      toast.success(t('subjects.addDialog.success', { name }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('subjects.addDialog.error');
      toast.error(message);
      throw err;
    }
  };

  const handleAddTopic = async (subjectId: string, name: string) => {
    try {
      await addTopic(subjectId, name);
      toast.success(t('subjects.addTopicDialog.success', { name }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('subjects.addTopicDialog.error');
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async (subject: Subject) => {
    try {
      await deleteSubject(subject._id);
      setDeleteTarget(null);
      toast.success(t('subjects.deleteDialog.success', { name: subject.name }));
    } catch (err) {
      const message = err instanceof Error ? err.message : t('subjects.deleteDialog.error');
      toast.error(message);
    }
  };

  const handleSave = async (
    subjectId: string,
    diff: {
      name?: string;
      topicsToAdd: string[];
      topicsToUpdate: { id: string; name: string }[];
      topicsToDelete: string[];
    }
  ) => {
    const ops: Promise<unknown>[] = [];

    if (diff.name) {
      ops.push(updateSubject(subjectId, diff.name));
    }
    for (const topicId of diff.topicsToDelete) {
      ops.push(deleteTopic(subjectId, topicId));
    }
    for (const { id, name } of diff.topicsToUpdate) {
      ops.push(updateTopic(subjectId, id, name));
    }
    for (const name of diff.topicsToAdd) {
      ops.push(addTopic(subjectId, name));
    }

    const results = await Promise.allSettled(ops);
    const failures = results.filter((r) => r.status === 'rejected');

    if (failures.length > 0) {
      const reason =
        failures[0].status === 'rejected' && failures[0].reason instanceof Error
          ? failures[0].reason.message
          : t('subjects.editDialog.error');
      throw new Error(reason);
    }

    toast.success(t('subjects.editDialog.success'));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{t('subjects.title')}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('subjects.subtitle')}
            </p>
          </div>
          {canCreate && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('subjects.add')}
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('subjects.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {!isLoading && !error && data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
            <div>
              <p className="text-sm font-medium">{t('subjects.empty')}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t('subjects.emptyHint')}
              </p>
            </div>
            {canCreate && (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('subjects.add')}
              </Button>
            )}
          </div>
        ) : (
          <SubjectsTable
            data={filtered}
            isLoading={isLoading}
            error={error}
            onRetry={refetch}
            canUpdate={canUpdate}
            canDelete={canDelete}
            onEdit={setEditTarget}
            onAddTopic={setAddTopicTarget}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <SubjectsAddDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onConfirm={handleAdd}
      />

      <SubjectsEditDialog
        subject={editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleSave}
      />

      <SubjectsAddTopicDialog
        subject={addTopicTarget}
        onClose={() => setAddTopicTarget(null)}
        onConfirm={handleAddTopic}
      />

      <SubjectsDeleteDialog
        subject={deleteTarget}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
