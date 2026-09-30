import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { Layers, PenLine } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface AddQuestionCampaignContext {
  slotId: string;
  campaignId: string;
  campaignName?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  questionType?: string;
  revisorId?: string;
}

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente quando si apre da una slot di campagna ("Produci") — lo stesso contesto va
   *  portato in qualunque dei due percorsi si scelga, non solo in quello automatico. */
  campaignContext?: AddQuestionCampaignContext;
}

/**
 * Biforcazione dell'ingresso unico "Aggiungi domanda": scelta esplicita tra generazione
 * massiva (AI) e creazione manuale, visibile fin da subito. Niente più secondo step con
 * l'elenco dei manuali — il campo Manuale vive dentro il form di generazione massiva
 * (Classificazione, `QuestionSetupAccordion.tsx`), non ha senso chiederlo due volte.
 * I due flussi a valle (`/questions/create`, `/questions/create-manual`) restano quelli che
 * sono, bit per bit — nessuna modifica al loro interno, solo a cosa li precede.
 * Vedi design/decisioni per il ragionamento completo.
 */
export function AddQuestionDialog({ open, onOpenChange, campaignContext }: AddQuestionDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goTo = (to: '/questions/create' | '/questions/create-manual') => {
    onOpenChange(false);
    navigate({ to, search: { ...(campaignContext ?? {}) } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('questions.addDialog.title')}</DialogTitle>
          <DialogDescription>{t('questions.addDialog.desc')}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => goTo('/questions/create')}
            className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
          >
            <Layers className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{t('questions.addDialog.bulkOption.title')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('questions.addDialog.bulkOption.desc')}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => goTo('/questions/create-manual')}
            className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
          >
            <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{t('questions.addDialog.manualOption.title')}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('questions.addDialog.manualOption.desc')}
              </p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
