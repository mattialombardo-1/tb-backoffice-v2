import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { useReviewerList } from '@/lib/hooks/useReviewerList';
import { useAuth } from '@/lib/auth';

interface ReviewerAssignDialogProps {
  open: boolean;
  onClose: () => void;
  /** reviewerName è "Nome Cognome" puro (non la label del combobox, che ha anche l'email
   *  accodata) — pensato per essere inserito nel toast di conferma del chiamante, es.
   *  "Domanda inviata a Chiara Vitale." */
  onConfirm: (reviewerId: string, reviewerName: string) => Promise<void>;
}

export function ReviewerAssignDialog({ open, onClose, onConfirm }: ReviewerAssignDialogProps) {
  const { t } = useTranslation();
  const { reviewers, isLoading } = useReviewerList();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUserEmail = user?.profile?.email as string | undefined;

  const handleConfirm = async () => {
    if (!selectedId) return;
    const selectedReviewer = reviewers.find((r) => r._id === selectedId);
    // Fallback all'email: capita raramente (dato non ancora arricchito da Cognito), ma un
    // toast con {{name}} vuoto ("Domanda inviata a .") sarebbe peggio di un'email al posto
    // del nome.
    const reviewerName =
      [selectedReviewer?.name, selectedReviewer?.surname].filter(Boolean).join(' ') ||
      selectedReviewer?.email ||
      '';
    setIsSubmitting(true);
    try {
      await onConfirm(selectedId, reviewerName);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const options = reviewers
    .filter((r) => !currentUserEmail || r.email?.toLowerCase() !== currentUserEmail.toLowerCase())
    .map((r) => ({
      value: r._id,
      label: [r.name, r.surname].filter(Boolean).join(' ') + (r.email ? ` — ${r.email}` : ''),
    }));

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('questions.reviewer.title')}</DialogTitle>
          <DialogDescription>{t('questions.reviewer.desc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label>{t('questions.reviewer.label')}</Label>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('questions.reviewer.loading')}
            </div>
          ) : (
            <SearchableCombobox
              value={selectedId}
              onChange={setSelectedId}
              options={options}
              placeholder={t('questions.reviewer.select')}
              searchPlaceholder="Cerca revisore..."
              emptyMessage="Nessun revisore trovato."
            />
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedId || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('questions.reviewer.submit')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
