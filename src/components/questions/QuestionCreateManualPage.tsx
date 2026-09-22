import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { BookOpen, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useHierarchy } from '@/lib/hooks/useHierarchy';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { useReviewerList } from '@/lib/hooks/useReviewerList';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import type { DifficultyLevel, QuestionType } from '@/lib/types/questions';
import { HierarchySelector } from './HierarchySelector';
import { QuestionContentEditor } from './QuestionContentEditor';
import { QuestionFormActions } from './QuestionFormActions';
import { ReviewerAssignDialog } from './ReviewerAssignDialog';
import { AutosaveIndicator } from './AutosaveIndicator';
import { QuestionStudentPreview } from './QuestionStudentPreview';

const routeApi = getRouteApi('/_authenticated/questions/create-manual');

/** Numeric difficulty (0–5, come salvata sulle slot di campagna) → DifficultyLevel stringa */
const DIFFICULTY_FROM_NUM: Record<number, DifficultyLevel> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

function parseQuestionType(raw: string | undefined): QuestionType | undefined {
  if (raw === 'MULTIPLE_CHOICE' || raw === 'COMPLETION') return raw;
  return undefined;
}

function parseDifficulty(raw: string | undefined): DifficultyLevel | undefined {
  if (!raw) return undefined;
  const asNum = Number(raw);
  if (!Number.isNaN(asNum) && asNum in DIFFICULTY_FROM_NUM) {
    return DIFFICULTY_FROM_NUM[asNum];
  }
  const valid: DifficultyLevel[] = [
    'facile',
    'medio_facile',
    'medio',
    'medio_difficile',
    'difficile',
    'non_ancora_valutata',
  ];
  return valid.includes(raw as DifficultyLevel) ? (raw as DifficultyLevel) : undefined;
}

/**
 * Percorso "Crea manualmente" dell'ingresso unico "Aggiungi domanda" (vedi AddQuestionDialog)
 * — recuperato da main (era il vecchio QuestionCreatePage, prima che questo branch lo
 * sostituisse con il solo flusso di generazione automatica): Classificazione + Contenuto,
 * una domanda alla volta, nessun concetto di quantità/batch. I pezzi che lo alimentano
 * (HierarchySelector, QuestionContentEditor, QuestionFormActions, useQuestionForm...) non
 * erano mai stati rimossi — QuestionEditContent li usa già per la modifica di una domanda
 * esistente — qui li montiamo per la creazione da zero, senza le sezioni di sola revisione
 * (Controlli automatici, Fonte) che lì hanno senso e qui no: non c'è ancora nessun contenuto
 * generato da controllare né fonte assegnata.
 */
export function QuestionCreateManualPage() {
  const {
    slotId,
    campaignId,
    campaignName,
    subjectId,
    topicId,
    difficulty,
    questionType,
    revisorId,
    manualeTitle,
  } = routeApi.useSearch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const client = useApiClient();

  const isCampaignMode = !!(slotId && campaignId);
  const initialDifficulty = parseDifficulty(difficulty);
  const initialType = parseQuestionType(questionType);

  const hierarchy = useHierarchy(subjectId ? { subjectId, topicId: topicId ?? null } : undefined);
  const form = useQuestionForm({ initialDifficulty, initialType });
  const { updateHierarchyRef } = form;
  // Solo per il ramo campagna sotto (nessun ReviewerAssignDialog lì: il revisore è già
  // sulla slot, vedi handleSubmit) — serve a risolvere revisorId in un nome per il toast di
  // conferma, dato che l'id da solo non ci arriva mai passato per davvero all'utente.
  const { reviewers } = useReviewerList({ enabled: isCampaignMode && !!revisorId });

  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  useEffect(() => {
    updateHierarchyRef(hierarchy.selection);
  }, [hierarchy.selection, updateHierarchyRef]);

  useEffect(() => {
    if (!form.isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.isDirty]);

  const handleClose = () => {
    if (form.isDirty) {
      setConfirmLeaveOpen(true);
    } else {
      navigate({ to: '/questions' });
    }
  };

  const handleConfirmLeave = () => {
    setConfirmLeaveOpen(false);
    navigate({ to: '/questions' });
  };

  const handleSaveDraft = async () => {
    const savedId = await form.saveDraft(hierarchy.selection);
    if (savedId) {
      toast.success(t('questions.create.draftSaved'));
    } else {
      toast.error(t('questions.create.errorSave'));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(form.validationErrors).length > 0) {
      toast.error(t('questions.create.allFieldsRequired'));
      return;
    }
    // In modalità campagna il revisore è già assegnato sulla slot — salta il picker,
    // stesso comportamento del flusso di generazione automatica.
    if (isCampaignMode && revisorId) {
      const revisor = reviewers.find((r) => r._id === revisorId);
      const revisorName =
        [revisor?.name, revisor?.surname].filter(Boolean).join(' ') || revisor?.email || '';
      handleConfirmSubmit(revisorId, revisorName);
      return;
    }
    setReviewerDialogOpen(true);
  };

  const handleConfirmSubmit = async (reviewerId: string, reviewerName: string) => {
    try {
      const savedQuestionId = await form.submitToReviewer(hierarchy.selection, reviewerId);
      toast.success(t('questions.create.submitted', { name: reviewerName }));

      if (isCampaignMode && savedQuestionId) {
        try {
          await campaignsService.updateSlot(client, campaignId!, slotId!, {
            status: 'in_review',
            questionId: savedQuestionId,
          });
        } catch {
          // Non-fatal — la domanda è stata inviata, l'aggiornamento della slot è best-effort.
          console.error('Failed to update campaign slot after question submission');
        }
        navigate({ to: '/my-slots' });
      } else {
        navigate({ to: '/questions' });
      }
    } catch {
      toast.error("Errore durante l'invio");
      throw new Error('submit failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-8 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Crea Domanda</h1>
            <p className="text-sm text-muted-foreground">Scrivi materia, contenuto e risposte.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator
            status={form.autosaveStatus}
            lastSavedAt={form.lastSavedAt}
            isDirty={form.isDirty}
          />
          <QuestionFormActions
            onSaveDraft={handleSaveDraft}
            onSubmit={handleSubmit}
            isSaving={form.autosaveStatus === 'saving'}
            isReadOnly={form.isReadOnly}
            canSaveDraft={hierarchy.isComplete}
            hasValidationErrors={Object.keys(form.validationErrors).length > 0}
          />
        </div>
      </div>

      {/* Campaign mode banner — stesso testo/stile del flusso di generazione automatica. */}
      {isCampaignMode && (
        <div className="shrink-0 border-b bg-amber-50 px-8 py-2 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">Stai producendo per la campagna:</span>{' '}
            {campaignName ?? campaignId}
            {' — '}
            La domanda verrà associata automaticamente allo slot quando inviata in revisione.
          </p>
        </div>
      )}

      {/* Manuale scelto in AddQuestionDialog — stesso banner informativo del percorso
          automatico (QuestionCreatePage), stessa ragione: è l'unica cosa che il sistema sa
          e l'utente no. Assente se si arriva qui senza passare da AddQuestionDialog. */}
      {manualeTitle && (
        <div className="flex shrink-0 items-center gap-2 border-b bg-muted/30 px-8 py-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>
            Manuale di riferimento:{' '}
            <span className="font-medium text-foreground">{manualeTitle}</span>
          </span>
        </div>
      )}

      {/* Due colonne, un solo scroll — stesso layout di QuestionEditContent, senza le
          sezioni di sola revisione (Controlli automatici, Fonte): qui non c'è ancora
          contenuto da controllare né una fonte assegnata. */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-7xl items-start">
          <div className="flex-1 space-y-6 px-10 py-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classificazione</CardTitle>
              </CardHeader>
              <CardContent>
                <HierarchySelector hierarchy={hierarchy} disabled={form.isReadOnly} />
              </CardContent>
            </Card>

            {hierarchy.isComplete ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenuto</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionContentEditor form={form} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Seleziona brand, materia, argomento e sotto-argomento per abilitare il modulo di
                  creazione.
                </CardContent>
              </Card>
            )}
          </div>

          <div
            className="sticky top-0 w-[35%] shrink-0 overflow-y-auto border-l"
            style={{ maxHeight: 'calc(100dvh - 68px)' }}
          >
            <div className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Anteprima studente
              </p>
              <QuestionStudentPreview
                questionText={form.questionText}
                type={form.type}
                alternatives={form.alternatives}
                alternativeStyle={form.alternativeStyle}
                completionAnswer={form.completionAnswer}
                questionImages={form.questionImageEntries.map((e) => e.viewUrl)}
                explanationText={form.explanationText}
                explanationImages={form.explanationImageEntries.map((e) => e.viewUrl)}
              />
            </div>
          </div>
        </div>
      </div>

      <ReviewerAssignDialog
        open={reviewerDialogOpen}
        onClose={() => setReviewerDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* AlertDialog, non Dialog: decisione bloccante — niente click-fuori/Esc, solo una
          delle due azioni esplicite. Stesso pattern del flusso di generazione automatica. */}
      <AlertDialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Hai fatto delle modifiche, vuoi scartarle e uscire?</AlertDialogTitle>
            <AlertDialogDescription>
              Le modifiche non salvate andranno perse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continua a modificare</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmLeave}
              className={buttonVariants({ variant: 'destructive' })}
            >
              Scarta ed esci
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
