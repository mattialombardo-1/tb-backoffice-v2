import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { REJECT_CUSTOM_REASON, REJECT_CUSTOM_TEXT_MAX, REJECT_REASONS } from '@/lib/rejectReasons';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { QuestionContentEditor } from './QuestionContentEditor';
import { QuestionStudentPreview } from './QuestionStudentPreview';
import type { DraftQuestion } from './QuestionGenerationStep';

interface QuestionDraftEditContentProps {
  draft: DraftQuestion;
  materiaName?: string;
  argomentoName?: string;
  sottoArgomentoName?: string;
  subjectId: string;
  topicId: string;
  sottoArgomentoId: string;
  onClose: () => void;
  /** Scrive le modifiche nella bozza E la approva nello stesso gesto (crea per davvero la
   *  domanda sul backend mock, poi la approva) — vedi il commento sopra il componente.
   *  `wasModified` arriva già calcolato da qui (form.isDirty prima del salvataggio, non dopo:
   *  vedi handleSaveAndApproveClick) così il chiamante non deve indovinarlo da un patch che
   *  potrebbe anche essere "vuoto". Ritorna true se la persistenza è andata a buon fine. */
  onSaveAndApprove: (patch: Partial<DraftQuestion>, wasModified: boolean) => Promise<boolean>;
}

/**
 * Copia di QuestionEditContent dedicata alle bozze non ancora inviate in revisione — non lo
 * stesso componente, perché le opzioni in alto sono strutturalmente diverse: qui non c'è un
 * revisore da scegliere (la CTA che apre questa schermata è visibile solo quando il revisore
 * è già te stesso — vedi requestDiscard/isReviewerSelf in QuestionGenerationStep), non c'è
 * Rigetta (non è un flusso di revisione), e soprattutto la domanda non esiste ancora sul
 * backend quando si apre questa schermata (persistedQuestionId è null): "Salva e Approva" la
 * crea per davvero (mock API) e la approva nello stesso click — un solo momento, non due
 * (prima si editava in locale, poi si tornava alla riga per un secondo click su "Approva":
 * visto che chi modifica è sempre chi approva in questo flusso — Caso A, isReviewerSelf — i
 * due gesti sono lo stesso giudizio, non ha senso separarli). La chiamata vera e propria resta
 * in onSaveAndApprove, qui non si importa questionsService — stesso principio di separazione
 * già in QuestionGenerationStep (persistAndApprove/persistAndSubmit). Stesso schema di
 * QuestionEditContent (handleSaveAndApprove lì) per bottone/colori/feedback facoltativo post-
 * salvataggio, con QuestionDraftEditContent come origine del pattern. Per lo stesso motivo di
 * prima, Materia/Argomento/Sotto-argomento restano badge statici (i valori già decisi al passo
 * 1), non l'HierarchySelector interattivo dell'originale: quello userebbe useHierarchy per
 * interrogare il catalogo reale, ma le domande generate da QuestionSetupAccordion possono avere
 * un topicId "fixedOptions" (__fixed__...) che nel catalogo non esiste — mostrarlo in un
 * dropdown live lo farebbe apparire vuoto/sbagliato. form (useQuestionForm) resta in modalità
 * "creazione" (nessun editQuestionId, quindi nessuna fetch): viene solo seminato una volta al
 * mount con i valori della bozza, poi form.markClean() azzera l'isDirty che quella semina
 * avrebbe altrimenti attivato (passa dagli stessi setter dell'utente) — serve solo a sapere se
 * c'è stata una modifica vera (vedi wasModified in handleSaveAndApproveClick), "Salva e
 * Approva" resta invece sempre cliccabile anche a form pulito: si può approvare senza aver
 * cambiato nulla, non solo dopo una modifica.
 */
export function QuestionDraftEditContent({
  draft,
  materiaName,
  argomentoName,
  sottoArgomentoName,
  subjectId,
  topicId,
  sottoArgomentoId,
  onClose,
  onSaveAndApprove,
}: QuestionDraftEditContentProps) {
  // Il tipo non è più uniforme per tutto il batch (griglia difficoltà × tipo in
  // QuestionSetupAccordion) — ogni bozza porta il proprio, vedi DraftQuestion.type.
  const isMultipleChoice = draft.type === 'MULTIPLE_CHOICE';
  const form = useQuestionForm({
    initialType: draft.type,
    initialDifficulty: draft.difficulty,
  });
  const {
    updateHierarchyRef,
    setQuestionText,
    setExplanationText,
    setCompletionAnswer,
    setAlternatives,
    markClean,
  } = form;

  // Semina il form una sola volta al mount, non ad ogni render — altrimenti ogni carattere
  // digitato verrebbe sovrascritto dal valore originale della bozza. Passa anche la gerarchia
  // (già nota, mai editata qui) così form.validationErrors non segnala mai "seleziona una
  // materia/argomento": sono badge statici sotto, non c'è nulla da selezionare. markClean()
  // alla fine azzera l'isDirty che i setter sopra hanno appena acceso — non è una modifica
  // dell'utente, solo il caricamento dei valori di partenza.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    setQuestionText(draft.text);
    setExplanationText(draft.explanation);
    setCompletionAnswer(draft.completionAnswer);
    if (isMultipleChoice) {
      setAlternatives(
        draft.alternatives.map((text, i) => ({
          id: crypto.randomUUID(),
          text,
          isCorrect: i === draft.correctIndex,
          order: i,
        }))
      );
    }
    updateHierarchyRef({
      subjectId,
      subjectName: materiaName ?? null,
      topicId,
      topicName: argomentoName ?? null,
      sottoArgomentoId: sottoArgomentoId || null,
    });
    markClean();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [showPassageDialog, setShowPassageDialog] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Motivo della modifica — facoltativo, a differenza di quello di "Scarta" (stessa lista,
  // stesso componente Select+"Altro", vedi @/lib/rejectReasons): qui serve solo a capire cosa
  // è stato corretto, non è vincolante per confermare. Come per "Scarta" (discard() in
  // QuestionGenerationStep), non c'è un campo sul backend dove salvarlo — solo loggato.
  const [editReasonOpen, setEditReasonOpen] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editCustomText, setEditCustomText] = useState('');
  const isEditCustomReason = editReason === REJECT_CUSTOM_REASON;

  const handleBackClick = () => {
    if (form.isDirty) {
      setConfirmLeaveOpen(true);
    } else {
      onClose();
    }
  };

  const handleConfirmLeave = () => {
    setConfirmLeaveOpen(false);
    onClose();
  };

  // Salva e approva nello stesso click (vedi il commento sul componente) — niente più toast
  // qui dentro: lo mostra onSaveAndApprove (successo o errore), che è anche l'unico a sapere
  // se la persistenza è davvero riuscita. wasModified va letto PRIMA di chiamarlo: il patch
  // potrebbe lasciare isDirty invariato lato chiamante, ma qui è lo stato del form che conta,
  // e solo qui sappiamo se l'utente ha davvero toccato qualcosa prima di approvare. Se fallisce
  // (network), si resta sulla schermata — niente modale di feedback né chiusura, l'utente può
  // solo riprovare.
  const handleSaveAndApproveClick = async () => {
    const patch: Partial<DraftQuestion> = {
      text: form.questionText,
      difficulty: form.difficulty,
      explanation: form.explanationText,
      completionAnswer: form.completionAnswer,
    };
    if (isMultipleChoice) {
      patch.alternatives = form.alternatives.map((a) => a.text);
      const correctIdx = form.alternatives.findIndex((a) => a.isCorrect);
      patch.correctIndex = correctIdx === -1 ? 0 : correctIdx;
    }
    const wasModified = form.isDirty;
    setIsApproving(true);
    const success = await onSaveAndApprove(patch, wasModified);
    setIsApproving(false);
    if (!success) return;
    if (wasModified) {
      setEditReason('');
      setEditCustomText('');
      setEditReasonOpen(true);
    } else {
      onClose();
    }
  };

  // La domanda è già salvata e approvata a questo punto (vedi handleSaveAndApproveClick) —
  // chiudere la modale, con "Invia feedback" o saltandola (Salta, Esc, click fuori), riporta
  // sempre alla lista: non c'è più nulla da annullare, solo il motivo facoltativo da loggare o
  // meno. Si apre solo se wasModified era true — approvare senza aver cambiato nulla non è una
  // "modifica" su cui chiedere un motivo.
  const submitFeedback = () => {
    const reason = isEditCustomReason ? editCustomText.trim() : editReason;
    if (reason) console.info('[modifica bozza] motivo:', reason, 'domanda:', draft.id);
    setEditReasonOpen(false);
    onClose();
  };

  const skipFeedback = () => {
    setEditReasonOpen(false);
    onClose();
  };

  const hasValidationErrors = Object.keys(form.validationErrors).length > 0;

  const classificationTags = [materiaName, argomentoName, sottoArgomentoName].filter(
    (v): v is string => !!v
  );

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background">
      {/* Header — vedi il commento sul componente per perché è diverso dall'originale. */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-8 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Modifica bozza</h1>
        </div>
        <Button
          onClick={handleSaveAndApproveClick}
          disabled={hasValidationErrors || isApproving}
          className="bg-emerald-600 text-white hover:bg-emerald-700"
        >
          {isApproving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          Salva e Approva
        </Button>
      </div>

      {/* Due colonne, stesso layout di QuestionEditContent */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-7xl items-start">
          <div className="flex-1 space-y-6 px-10 py-8">
            <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
              <Accordion type="single" collapsible>
                <AccordionItem value="fonte" className="border-b-0">
                  <AccordionTrigger className="px-3 py-3 hover:no-underline">
                    <div className="flex items-center gap-2.5">
                      <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm font-medium">Fonte disponibile</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pt-3 pb-4">
                    <div className="space-y-2">
                      <p className="text-sm">
                        <span className="font-semibold">Manuale:</span> {draft.source.manuale}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Capitolo:</span> {draft.source.capitolo}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Pagina:</span> {draft.source.pagina}
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
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Badge statici, non HierarchySelector — vedi il commento sul componente. */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classificazione</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {classificationTags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contenuto</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionContentEditor form={form} />
              </CardContent>
            </Card>
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

      {/* Stesso dialog "Fonte" del post-generazione — qui il passaggio è già noto
          (draft.passage), non va recuperato per tentativi da findPassageForQuestionText. */}
      <Dialog open={showPassageDialog} onOpenChange={setShowPassageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fonte</DialogTitle>
            <DialogDescription>
              {draft.source.manuale} — {draft.source.capitolo} · p. {draft.source.pagina}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 p-5">
            <p className="text-sm leading-relaxed">{draft.passage}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Conferma uscita solo se ci sono modifiche non salvate — stesso pattern/copy di
          QuestionCreateManualPage (AlertDialog, non Dialog: nessun click-fuori/Esc). */}
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

      {/* Motivo della modifica — facoltativo (vedi il commento sullo state sopra): "Conferma"
          resta sempre cliccabile, a differenza di "Scarta" dove il motivo è obbligatorio. La
          modifica è già salvata quando questa modale si apre (vedi handleSaveClick) — chiuderla
          in un modo qualsiasi (Salta, Esc, click fuori) riporta comunque alla lista. */}
      <Dialog open={editReasonOpen} onOpenChange={(next) => !next && skipFeedback()}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Modifica salvata</DialogTitle>
            <DialogDescription>
              Vuoi aggiungere una motivazione? È facoltativo, ci aiuta a capire come migliorare.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Label htmlFor="edit-reason">Motivazione</Label>
            <Select value={editReason} onValueChange={setEditReason}>
              <SelectTrigger id="edit-reason">
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

            {isEditCustomReason && (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={editCustomText}
                  onChange={(e) =>
                    setEditCustomText(e.target.value.slice(0, REJECT_CUSTOM_TEXT_MAX))
                  }
                  placeholder="Descrivi brevemente il motivo"
                  maxLength={REJECT_CUSTOM_TEXT_MAX}
                />
                <p
                  className={cn(
                    'text-right text-xs text-muted-foreground',
                    editCustomText.length >= REJECT_CUSTOM_TEXT_MAX && 'text-destructive'
                  )}
                >
                  {editCustomText.length}/{REJECT_CUSTOM_TEXT_MAX}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={skipFeedback}>
              Salta
            </Button>
            <Button onClick={submitFeedback}>
              <Send className="mr-1.5 h-3.5 w-3.5" />
              Invia feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
