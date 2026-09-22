import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BookOpen, CheckCircle, Eye, Loader2, Pencil, Send, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useHierarchy } from '@/lib/hooks/useHierarchy';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { HierarchySelector } from './HierarchySelector';
import { QuestionContentEditor } from './QuestionContentEditor';
import { QuestionFormActions } from './QuestionFormActions';
import { ReviewerAssignDialog } from './ReviewerAssignDialog';
import { AutosaveIndicator } from './AutosaveIndicator';
import { QuestionStudentPreview } from './QuestionStudentPreview';
import { parseExplanation } from './questionQualityChecks';
import { findPassageForQuestionText } from './questionBanks';
import { REJECT_CUSTOM_REASON, REJECT_CUSTOM_TEXT_MAX, REJECT_REASONS } from '@/lib/rejectReasons';
import { REVIEW_SUCCESS_TOAST_CLASSNAME } from './QuestionGenerationStep';

export interface QuestionEditContentProps {
  form: ReturnType<typeof useQuestionForm>;
  subjectId: string;
  subjectName: string | null;
  topicId: string | null;
  topicName: string | null;
  isReviewMode: boolean;
  /** Called when the user closes the editor (X button, or "Esci senza salvare"). */
  onClose: () => void;
  /** Called after every successful save (draft, submit, approve) so the caller can refresh its own cached copy. */
  onSaved?: () => void;
  /** Called after a successful approve / save-and-approve. Defaults to onClose. */
  onApproved?: () => void;
  /** Overrides the `z-50` on the fixed overlay wrapper — lets callers stack this above another full-screen surface. */
  zIndexClassName?: string;
}

export function QuestionEditContent({
  form,
  subjectId,
  subjectName,
  topicId,
  topicName,
  isReviewMode,
  onClose,
  onSaved,
  onApproved,
  zIndexClassName = 'z-50',
}: QuestionEditContentProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  // All four values are available synchronously when this component mounts →
  // useHierarchy initialises correctly from the very first render, no async seeding needed.
  const hierarchy = useHierarchy({
    subjectId,
    subjectName: subjectName ?? undefined,
    topicId: topicId ?? null,
    topicName: topicName ?? undefined,
  });

  // Keep autosave ref and reactive validation in sync with the current selection.
  const { updateHierarchyRef } = form;
  useEffect(() => {
    updateHierarchyRef(hierarchy.selection);
  }, [hierarchy.selection, updateHierarchyRef]);

  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  // "Vedi il passaggio" nella card Fonte — stesso dialog del post-generazione.
  const [showPassageDialog, setShowPassageDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectCustomText, setRejectCustomText] = useState('');
  const isCustomReason = rejectReason === REJECT_CUSTOM_REASON;
  const canConfirmReject =
    rejectReason !== '' && (!isCustomReason || rejectCustomText.trim().length > 0);

  // Motivo facoltativo dopo un "Modifica" + "Salva e Approva" — stesso pattern di
  // QuestionDraftEditContent nel post-generazione: il salvataggio (qui, salvataggio+
  // approvazione insieme) è già avvenuto quando questa modale si apre, non è più un gate.
  // Non compare se approvi senza aver modificato nulla (vedi handleSaveAndApprove: si apre
  // solo se form.isDirty era true prima del salvataggio) — "modifica" è il trigger, non
  // "approvazione".
  const [editFeedbackOpen, setEditFeedbackOpen] = useState(false);
  const [editFeedbackReason, setEditFeedbackReason] = useState('');
  const [editFeedbackCustomText, setEditFeedbackCustomText] = useState('');
  const isEditFeedbackCustomReason = editFeedbackReason === REJECT_CUSTOM_REASON;

  const handleClose = () => {
    if (form.isDirty) {
      setConfirmLeaveOpen(true);
    } else {
      onClose();
    }
  };

  const handleSaveDraft = async () => {
    const savedId = await form.saveDraft(hierarchy.selection);
    if (savedId) {
      toast.success(t('questions.create.draftSaved'));
      onSaved?.();
    } else {
      toast.error(t('questions.create.errorSave'));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(form.validationErrors).length > 0) {
      toast.error(t('questions.create.allFieldsRequired'));
      return;
    }
    setReviewerDialogOpen(true);
  };

  const handleConfirmSubmit = async (reviewerId: string, reviewerName: string) => {
    try {
      await form.submitToReviewer(hierarchy.selection, reviewerId);
      toast.success(t('questions.create.submitted', { name: reviewerName }));
      onSaved?.();
    } catch {
      toast.error("Errore durante l'invio");
      throw new Error('submit failed');
    }
  };

  const handleApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      onSaved?.();
      (onApproved ?? onClose)();
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  const openRejectDialog = () => {
    setRejectReason('');
    setRejectCustomText('');
    setRejectDialogOpen(true);
  };

  /** Rigetta: la domanda torna in bozza — esce dalla coda "da revisionare". Il motivo
   *  scelto non ha ancora un campo dedicato sul backend reale (nessun endpoint di
   *  feedback/commento sulle domande) — per ora resta solo nel log, non lo inventiamo
   *  come campo salvato per davvero. */
  const handleReject = async () => {
    if (!form.questionId) return;
    const reason = isCustomReason ? rejectCustomText.trim() : rejectReason;
    setIsRejecting(true);
    try {
      await questionsService.reject(client, form.questionId);
      console.info('[rigetta] motivo:', reason);
      setRejectDialogOpen(false);
      toast.success('Domanda rigettata.');
      onSaved?.();
      (onApproved ?? onClose)();
    } catch {
      toast.error(t('common.error'));
      setIsRejecting(false);
    }
  };

  const handleSaveAndApprove = async () => {
    if (!form.questionId) return;
    // Letto prima del salvataggio: saveDraft azzera isDirty internamente (setIsDirty(false) a
    // fine salvataggio, in useQuestionForm), quindi dopo non saprei più distinguere "hai
    // modificato qualcosa" da "hai solo riaperto in modifica senza toccare nulla".
    const wasModified = form.isDirty;
    setIsApproving(true);
    try {
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(
        wasModified ? 'Domanda modificata e approvata con successo.' : t('myReviews.approved'),
        { className: REVIEW_SUCCESS_TOAST_CLASSNAME }
      );
      onSaved?.();
      if (wasModified) {
        setEditFeedbackReason('');
        setEditFeedbackCustomText('');
        setEditFeedbackOpen(true);
        setIsApproving(false);
      } else {
        (onApproved ?? onClose)();
      }
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  // La domanda è già salvata e approvata quando questa modale si apre (vedi
  // handleSaveAndApprove) — chiuderla in un modo qualsiasi (Salta, Esc, click fuori) porta
  // comunque via dalla schermata, come faceva prima l'approvazione da sola.
  const submitEditFeedback = () => {
    const reason = isEditFeedbackCustomReason ? editFeedbackCustomText.trim() : editFeedbackReason;
    if (reason) console.info('[modifica domanda] motivo:', reason, 'domanda:', form.questionId);
    setEditFeedbackOpen(false);
    (onApproved ?? onClose)();
  };

  const skipEditFeedback = () => {
    setEditFeedbackOpen(false);
    (onApproved ?? onClose)();
  };

  // Fonte della domanda (manuale/capitolo/pagina), letta dal campo esplicativo — usata
  // dalla card "Fonte" qui sotto. I controlli automatici che un tempo la leggevano da qui
  // sono stati rimossi dal flusso di modifica (non si mostrano in nessuna fase).
  const { source: explanationSource } = parseExplanation(form.explanationText);
  // Il passaggio non è mai salvato sul backend, ma le domande generate da
  // QuestionGenerationStep hanno testo identico a un template lì dentro — recuperando
  // quello si mostra lo stesso passaggio "simulato" della generazione. undefined per le
  // domande del catalogo reale o quelle il cui testo è stato modificato dopo.
  const simulatedPassage = findPassageForQuestionText(form.questionText);

  return (
    <div className={cn('fixed inset-0 flex flex-col bg-background', zIndexClassName)}>
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
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Modifica Domanda</h1>
            {form.isReadOnly && (
              <Badge variant="secondary">
                <Eye className="size-3" />
                {t('questions.readOnly')}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator
            status={form.autosaveStatus}
            lastSavedAt={form.lastSavedAt}
            isDirty={form.isDirty}
          />
          {form.isReadOnly ? (
            <>
              <Button variant="outline" onClick={() => form.setIsReadOnly(false)}>
                <Pencil className="h-4 w-4" />
                Modifica
              </Button>
              {isReviewMode && (
                <Button
                  variant="destructive"
                  onClick={openRejectDialog}
                  disabled={isApproving || isRejecting}
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Rigetta
                </Button>
              )}
              <Button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Salva e Approva
              </Button>
            </>
          ) : isReviewMode ? (
            <Button
              onClick={handleSaveAndApprove}
              disabled={isApproving || Object.keys(form.validationErrors).length > 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              {t('myReviews.saveAndApprove')}
            </Button>
          ) : (
            <QuestionFormActions
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              isSaving={form.autosaveStatus === 'saving'}
              isReadOnly={form.isReadOnly}
              canSaveDraft={hierarchy.isComplete}
              hasValidationErrors={Object.keys(form.validationErrors).length > 0}
            />
          )}
        </div>
      </div>

      {/* Two-column content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-7xl items-start">
          {/* Left: form */}
          <div className="flex-1 space-y-6 px-10 py-8">
            {/* Fonte — in testa al contenuto, prima ancora della Classificazione: è quello
                che chi revisiona vuole leggere subito (l'anteprima a destra è già lì per il
                contenuto vero e proprio). Sotto invece parte l'editor, che conta solo se si
                sceglie di modificare. I controlli automatici che stavano qui sopra sono stati
                rimossi dal flusso di modifica: dopo un intervento manuale non verrebbero
                ricalcolati. */}
            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
              <Accordion type="single" collapsible>
                <AccordionItem value="fonte" className="border-b-0">
                  <AccordionTrigger className="px-3 py-3 hover:no-underline">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {explanationSource ? 'Fonte disponibile' : 'Fonte non disponibile'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-3 pb-4">
                    {explanationSource ? (
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-semibold">Manuale:</span>{' '}
                          {explanationSource.manuale}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Capitolo:</span>{' '}
                          {explanationSource.capitolo}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Pagina:</span> {explanationSource.pagina}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => setShowPassageDialog(true)}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          Vedi il passaggio
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Nessuna fonte disponibile per questa domanda.
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

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
                  Seleziona brand, materia e argomento per modificare il contenuto.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: sticky preview */}
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

      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Vuoi lasciare la pagina?</DialogTitle>
            <DialogDescription>
              Ci sono modifiche non salvate. Se esci ora, andranno perse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)}>
              Rimani
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmLeaveOpen(false);
                onClose();
              }}
            >
              Esci senza salvare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Rigetta domanda</DialogTitle>
            <DialogDescription>
              Seleziona il motivo: la domanda uscirà dalla coda di revisione.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Label htmlFor="reject-reason">Motivazione</Label>
            <Select value={rejectReason} onValueChange={setRejectReason}>
              <SelectTrigger id="reject-reason">
                <SelectValue placeholder="Seleziona un motivo" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isCustomReason && (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={rejectCustomText}
                  onChange={(e) =>
                    setRejectCustomText(e.target.value.slice(0, REJECT_CUSTOM_TEXT_MAX))
                  }
                  placeholder="Descrivi brevemente il motivo"
                  maxLength={REJECT_CUSTOM_TEXT_MAX}
                />
                <p
                  className={cn(
                    'text-right text-xs text-muted-foreground',
                    rejectCustomText.length >= REJECT_CUSTOM_TEXT_MAX && 'text-destructive'
                  )}
                >
                  {rejectCustomText.length}/{REJECT_CUSTOM_TEXT_MAX}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isRejecting}
            >
              Annulla
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!canConfirmReject || isRejecting}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Rigetta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Motivo facoltativo dopo "Modifica" + "Salva e Approva" — stesso schema di
          QuestionDraftEditContent (Salta / Invia feedback), vedi editFeedbackOpen sopra. */}
      <Dialog open={editFeedbackOpen} onOpenChange={(next) => !next && skipEditFeedback()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Modifica salvata</DialogTitle>
            <DialogDescription>
              Vuoi aggiungere una motivazione? È facoltativo, ci aiuta a capire come migliorare.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Label htmlFor="edit-feedback-reason">Motivazione</Label>
            <Select value={editFeedbackReason} onValueChange={setEditFeedbackReason}>
              <SelectTrigger id="edit-feedback-reason">
                <SelectValue placeholder="Seleziona un motivo (facoltativo)" />
              </SelectTrigger>
              <SelectContent>
                {REJECT_REASONS.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isEditFeedbackCustomReason && (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={editFeedbackCustomText}
                  onChange={(e) =>
                    setEditFeedbackCustomText(e.target.value.slice(0, REJECT_CUSTOM_TEXT_MAX))
                  }
                  placeholder="Descrivi brevemente il motivo"
                  maxLength={REJECT_CUSTOM_TEXT_MAX}
                />
                <p
                  className={cn(
                    'text-right text-xs text-muted-foreground',
                    editFeedbackCustomText.length >= REJECT_CUSTOM_TEXT_MAX && 'text-destructive'
                  )}
                >
                  {editFeedbackCustomText.length}/{REJECT_CUSTOM_TEXT_MAX}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={skipEditFeedback}>
              Salta
            </Button>
            <Button onClick={submitEditFeedback}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Invia feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stesso dialog "Fonte" del post-generazione e di QuestionsViewDialog — il passaggio
          citato varia per domanda, recuperato tramite simulatedPassage sopra. */}
      <Dialog open={showPassageDialog} onOpenChange={setShowPassageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fonte</DialogTitle>
            {explanationSource && (
              <DialogDescription>
                {explanationSource.manuale}
                {explanationSource.capitolo && ` — ${explanationSource.capitolo}`} · p.{' '}
                {explanationSource.pagina}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 p-5">
            {simulatedPassage ? (
              <p className="text-sm leading-relaxed">{simulatedPassage}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nessun passaggio salvato per questa domanda.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
