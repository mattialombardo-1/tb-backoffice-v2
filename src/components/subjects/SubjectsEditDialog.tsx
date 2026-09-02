import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
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
import { Separator } from '@/components/ui/separator';
import type { Subject, SubjectTopic } from '@/lib/types/subjects';

interface TopicRow {
  _id?: string;
  name: string;
}

interface SubjectsEditDialogProps {
  subject: Subject | null;
  onClose: () => void;
  onSave: (
    subjectId: string,
    patch: {
      name?: string;
      topicsToAdd: string[];
      topicsToUpdate: { id: string; name: string }[];
      topicsToDelete: string[];
    }
  ) => Promise<void>;
}

function buildDiff(
  original: SubjectTopic[],
  current: TopicRow[],
  originalName: string,
  currentName: string
) {
  const originalMap = new Map(original.map((t) => [t._id, t.name]));
  const currentIds = new Set(current.filter((r) => r._id).map((r) => r._id as string));

  const topicsToDelete = original
    .filter((t) => !currentIds.has(t._id))
    .map((t) => t._id);

  const topicsToUpdate = current
    .filter((r) => r._id && r.name.trim() !== originalMap.get(r._id))
    .map((r) => ({ id: r._id as string, name: r.name.trim() }));

  const topicsToAdd = current.filter((r) => !r._id).map((r) => r.name.trim());

  const name = currentName.trim() !== originalName ? currentName.trim() : undefined;

  return { name, topicsToAdd, topicsToUpdate, topicsToDelete };
}

export function SubjectsEditDialog({ subject, onClose, onSave }: SubjectsEditDialogProps) {
  const { t } = useTranslation();
  const [subjectName, setSubjectName] = useState('');
  const [topicRows, setTopicRows] = useState<TopicRow[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (subject) {
      setSubjectName(subject.name);
      setTopicRows(subject.topics?.map((t) => ({ _id: t._id, name: t.name })) ?? []);
      setNewTopicName('');
    }
  }, [subject]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onClose();
  };

  const removeTopic = (index: number) => {
    setTopicRows((rows) => rows.filter((_, i) => i !== index));
  };

  const updateTopicName = (index: number, value: string) => {
    setTopicRows((rows) => rows.map((r, i) => (i === index ? { ...r, name: value } : r)));
  };

  const addTopic = () => {
    const trimmed = newTopicName.trim();
    if (!trimmed) return;
    setTopicRows((rows) => [...rows, { name: trimmed }]);
    setNewTopicName('');
  };

  const handleAddTopicKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  const handleSubmit = async () => {
    if (!subject || isSubmitting) return;

    const pendingTopicName = newTopicName.trim();
    const allRows = pendingTopicName
      ? [...topicRows, { name: pendingTopicName }]
      : topicRows;

    const invalidRows = allRows.filter((r) => !r.name.trim());
    if (invalidRows.length > 0) {
      toast.error(t('subjects.editDialog.allTopicsRequired'));
      return;
    }

    const diff = buildDiff(
      subject.topics ?? [],
      allRows,
      subject.name,
      subjectName
    );

    const hasChanges =
      diff.name !== undefined ||
      diff.topicsToAdd.length > 0 ||
      diff.topicsToUpdate.length > 0 ||
      diff.topicsToDelete.length > 0;

    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(subject._id, diff);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : t('subjects.editDialog.error');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!subject} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>{t('subjects.editDialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 overflow-y-auto flex-1 pr-1">
          {/* Subject name */}
          <div className="space-y-2">
            <Label htmlFor="edit-subject-name">{t('subjects.editDialog.nameLabel')}</Label>
            <Input
              id="edit-subject-name"
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              placeholder={t('subjects.editDialog.namePlaceholder')}
            />
          </div>

          <Separator />

          {/* Topics */}
          <div className="space-y-3">
            <Label>{t('subjects.editDialog.topicsLabel')}</Label>

            {topicRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('subjects.editDialog.noTopics')}</p>
            ) : (
              <div className="space-y-2">
                {topicRows.map((row, i) => (
                  <div key={row._id ?? `new-${i}`} className="flex items-center gap-2">
                    <Input
                      value={row.name}
                      onChange={(e) => updateTopicName(i, e.target.value)}
                      placeholder={t('subjects.editDialog.topicNamePlaceholder')}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTopic(i)}
                      aria-label={t('subjects.editDialog.removeTopicAria')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add topic */}
            <div className="flex items-center gap-2">
              <Input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                onKeyDown={handleAddTopicKey}
                placeholder={t('subjects.editDialog.newTopicPlaceholder')}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={addTopic}
                disabled={!newTopicName.trim()}
                aria-label={t('subjects.editDialog.addTopicAria')}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !subjectName.trim()}>
            {isSubmitting ? t('subjects.editDialog.saving') : t('subjects.editDialog.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
