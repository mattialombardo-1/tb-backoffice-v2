import { useState } from 'react';
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
import type { Subject } from '@/lib/types/subjects';

interface SubjectsAddTopicDialogProps {
  subject: Subject | null;
  onClose: () => void;
  onConfirm: (subjectId: string, name: string) => Promise<void>;
}

export function SubjectsAddTopicDialog({
  subject,
  onClose,
  onConfirm,
}: SubjectsAddTopicDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) {
      setName('');
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !subject || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(subject._id, trimmed);
      setName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!subject} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('subjects.addTopicDialog.title')}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {subject && (
            <p className="text-sm text-muted-foreground">
              {t('subjects.addTopicDialog.subjectLabel')}{' '}
              <span className="font-medium text-foreground">{subject.name}</span>
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="topic-name">{t('subjects.addTopicDialog.nameLabel')}</Label>
            <Input
              id="topic-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('subjects.addTopicDialog.namePlaceholder')}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? t('subjects.addTopicDialog.adding') : t('subjects.addTopicDialog.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
