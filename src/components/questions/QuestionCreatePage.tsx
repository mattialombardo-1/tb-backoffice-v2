import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { BookOpen, CheckCircle, Loader2, Pencil, Plus, X } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
import { useCapabilities } from '@/lib/auth';
import { useHierarchy } from '@/lib/hooks/useHierarchy';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { questionsService } from '@/lib/services/questions';
import type { DifficultyLevel, QuestionType } from '@/lib/types/questions';
import { QuestionSetupAccordion } from './QuestionSetupAccordion';
import { ReviewerAssignDialog } from './ReviewerAssignDialog';
import { AutosaveIndicator } from './AutosaveIndicator';

const routeApi = getRouteApi('/_authenticated/questions/create');

/** Numeric difficulty (0–5, as stored in campaign slots) → DifficultyLevel string */
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
  // Accept string form as-is if it matches
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

export function QuestionCreatePage() {
  const {
    questionId: editId,
    slotId,
    campaignId,
    campaignName,
    subjectId,
    topicId,
    difficulty,
    questionType,
    reviewMode,
    manualeTitle,
  } = routeApi.useSearch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const client = useApiClient();
  const { me } = useCapabilities();
  const meId = me?.user._id ?? null;

  const isEditMode = !!editId;
  const isCampaignMode = !!(slotId && campaignId);
  const initialDifficulty = parseDifficulty(difficulty);
  const initialType = parseQuestionType(questionType);

  const hierarchy = useHierarchy(subjectId ? { subjectId, topicId: topicId ?? null } : undefined);

  const form = useQuestionForm(editId ? editId : { initialDifficulty, initialType });
  const { updateHierarchyRef } = form;

  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Sollevati da QuestionSetupAccordion: servono qui per sapere se i campi
  // obbligatori (Materia, Argomento, Tipo di domanda, Quantità, Numero di
  // risposte se Risposta chiusa, Revisore) sono compilati e quindi se la CTA
  // "Crea Domanda" può essere cliccabile. Partono vuoti: i valori più
  // frequenti (Tipo, Quantità) e "Assegna a me" sono proposte di default, ma
  // QuestionSetupAccordion li applica solo alla prima apertura della sezione
  // che li contiene — non prima, non appena atterrati sul form (vedi lì).
  const [proposalType, setProposalType] = useState<QuestionType | ''>('');
  const [proposalQuantity, setProposalQuantity] = useState('');
  const [proposalAnswerCount, setProposalAnswerCount] = useState('');
  const [proposalReviewerId, setProposalReviewerId] = useState<string | null>(null);
  const canGenerate =
    hierarchy.isComplete &&
    proposalType !== '' &&
    proposalQuantity !== '' &&
    Number(proposalQuantity) > 0 &&
    (proposalType !== 'MULTIPLE_CHOICE' || proposalAnswerCount !== '') &&
    proposalReviewerId !== null;

  // Secondo step dopo "Crea Domanda" (non un dialog) — vedi QuestionGenerationStep.
  const [summaryOpen, setSummaryOpen] = useState(false);
  // Uscendo da lì: se il revisore assegnato è te stesso, ha senso atterrare direttamente
  // sulla tua coda di revisione — è lì che andresti comunque subito dopo. Per chiunque
  // altro, il comportamento resta quello di sempre (lista generale Domande).
  const handleExitSummary = () => {
    setSummaryOpen(false);
    navigate({
      to: proposalReviewerId && proposalReviewerId === meId ? '/questions/to-review' : '/questions',
    });
  };

  useEffect(() => {
    updateHierarchyRef(hierarchy.selection);
  }, [hierarchy.selection, updateHierarchyRef]);

  // In modalità "Crea Domanda" i campi che contano (materia/argomento, tipo,
  // quantità, revisore) non passano da useQuestionForm — sono sollevati da
  // QuestionSetupAccordion — quindi form.isDirty da solo non li vede mai:
  // uscire dopo averli compilati non mostrerebbe mai la conferma. In
  // revisione/modifica invece i campi editati sono quelli reali di
  // useQuestionForm, che resta l'unica fonte di verità lì.
  const hasUnsavedCreationInput =
    hierarchy.selection.subjectId != null ||
    proposalType !== '' ||
    proposalQuantity !== '' ||
    proposalAnswerCount !== '' ||
    proposalReviewerId !== null;
  const isFormDirty =
    !reviewMode && !isEditMode ? form.isDirty || hasUnsavedCreationInput : form.isDirty;

  // Reload/chiusura scheda: qui non possiamo mostrare il nostro AlertDialog —
  // il browser mostra il proprio dialog nativo (testo non personalizzabile,
  // per policy anti-spam di tutti i browser moderni), attivato solo se
  // l'evento viene "prevenuto" mentre il form è sporco.
  useEffect(() => {
    if (!isFormDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFormDirty]);

  const handleClose = () => {
    if (isFormDirty) {
      setConfirmLeaveOpen(true);
    } else {
      navigate({ to: '/questions' });
    }
  };

  const handleConfirmLeave = () => {
    setConfirmLeaveOpen(false);
    navigate({ to: '/questions' });
  };

  // handleSaveDraft/handleSubmit (vecchio form manuale) rimossi: legati a campi
  // (questionText, alternatives...) che questa proposta non mostra più — vedi
  // "Crea Domanda" in alto a destra.

  const handleConfirmSubmit = async (reviewerId: string, reviewerName: string) => {
    try {
      const savedQuestionId = await form.submitToReviewer(hierarchy.selection, reviewerId);
      toast.success(t('questions.create.submitted', { name: reviewerName }));

      // If this question was created from a campaign slot, update the slot and navigate back
      if (isCampaignMode && savedQuestionId) {
        try {
          await campaignsService.updateSlot(client, campaignId!, slotId!, {
            status: 'in_review',
            questionId: savedQuestionId,
          });
        } catch {
          // Non-fatal — the question was submitted, slot update is best-effort
          console.error('Failed to update campaign slot after question submission');
        }
        navigate({ to: '/my-slots' });
      }
    } catch {
      toast.error("Errore durante l'invio");
      throw new Error('submit failed');
    }
  };

  /** Review mode: approve question as-is (status → ACTIVE, no edits). */
  const handleApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      // Always save before approving: the Lambda snapshot requires subject.name and
      // topic.name to be non-empty, but older questions may have been saved with
      // empty names. A saveDraft here ensures the DB record is up-to-date.
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      navigate({ to: '/questions/to-review' });
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  /** Review mode: save edited content then approve (status → ACTIVE). */
  const handleSaveAndApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      navigate({ to: '/questions/to-review' });
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  if (form.isLoadingQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="mb-4 h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (form.loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-8">
        <h1 className="mb-4 text-2xl font-semibold">Errore</h1>
        <p className="text-muted-foreground">{form.loadError}</p>
      </div>
    );
  }

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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold">
                {reviewMode
                  ? t('myReviews.reviewTitle')
                  : isEditMode
                    ? 'Modifica Domanda'
                    : 'Crea Domanda'}
              </h1>
              {form.isReadOnly && !reviewMode && (
                <Badge variant="secondary">{t('questions.readOnly')}</Badge>
              )}
              {reviewMode && form.isReadOnly && (
                <Badge variant="secondary">{t('myReviews.readOnlyBadge')}</Badge>
              )}
              {reviewMode && !form.isReadOnly && (
                <Badge variant="outline" className="border-amber-400 text-amber-600">
                  {t('myReviews.editingBadge')}
                </Badge>
              )}
            </div>
            {!reviewMode && !isEditMode && (
              <p className="text-sm text-muted-foreground">
                Indica i parametri e crea le domande da revisionare.
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator
            status={form.autosaveStatus}
            lastSavedAt={form.lastSavedAt}
            isDirty={form.isDirty}
          />
          {reviewMode ? (
            form.isReadOnly ? (
              /* Read-only review: Approva + Modifica */
              <>
                <Button
                  variant="outline"
                  onClick={() => form.setIsReadOnly(false)}
                  disabled={isApproving}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('myReviews.edit')}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isApproving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {t('myReviews.approve')}
                </Button>
              </>
            ) : (
              /* Editing review: Salva e Approva */
              <Button
                onClick={handleSaveAndApprove}
                disabled={isApproving || Object.keys(form.validationErrors).length > 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {t('myReviews.saveAndApprove')}
              </Button>
            )
          ) : null}
        </div>
      </div>

      {/* Campaign mode banner */}
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

      {/* Manuale scelto in AddQuestionDialog — solo informativo, in testa al contenuto: è
          l'unica cosa che il sistema sa e l'utente no (se il manuale è "pronto" per la
          generazione a batch), vale la pena renderla visibile qui. Grigio/muted, non amber
          come il banner di campagna sopra: quello è un avviso operativo, questo è solo
          contesto. Assente se si arriva qui senza passare da AddQuestionDialog (es. link
          diretto) — niente banner vuoto. */}
      {manualeTitle && (
        <div className="flex shrink-0 items-center gap-2 border-b bg-muted/30 px-8 py-2 text-sm text-muted-foreground">
          <BookOpen className="h-4 w-4 shrink-0" />
          <span>
            Manuale di riferimento:{' '}
            <span className="font-medium text-foreground">{manualeTitle}</span>
          </span>
        </div>
      )}

      {/* Colonna unica: Classificazione (aperta di default), Composizione e
          Gestisci revisione — la CTA finale vive qui in fondo, fuori
          dall'accordion, al termine del flusso multistep. */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-10 py-8">
          <QuestionSetupAccordion
            hierarchy={hierarchy}
            disabled={form.isReadOnly}
            type={proposalType}
            onTypeChange={setProposalType}
            onQuantityChange={setProposalQuantity}
            onAnswerCountChange={setProposalAnswerCount}
            reviewerId={proposalReviewerId}
            onReviewerIdChange={setProposalReviewerId}
            summaryOpen={summaryOpen}
            onExitSummary={handleExitSummary}
            manualeTitle={manualeTitle}
          />

          {!reviewMode && (
            <div className="flex justify-end pt-6">
              <Button
                size="lg"
                disabled={form.isReadOnly || !canGenerate}
                onClick={() => setSummaryOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Crea Domanda
              </Button>
            </div>
          )}
        </div>
      </div>

      <ReviewerAssignDialog
        open={reviewerDialogOpen}
        onClose={() => setReviewerDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* AlertDialog, non Dialog: è una decisione bloccante — non deve chiudersi
          cliccando fuori o con Esc, solo scegliendo esplicitamente una delle
          due azioni. Il click fuori è già bloccato di default da Radix per
          AlertDialog; l'Esc lo blocchiamo esplicitamente qui. */}
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
