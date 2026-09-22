import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, Save, Send } from 'lucide-react';
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
import { REVIEW_SUCCESS_TOAST_CLASSNAME, type DraftQuestion } from './QuestionGenerationStep';

interface QuestionDraftEditContentProps {
  draft: DraftQuestion;
  isMultipleChoice: boolean;
  materiaName?: string;
  argomentoName?: string;
  sottoArgomentoName?: string;
  subjectId: string;
  topicId: string;
  sottoArgomentoId: string;
  onClose: () => void;
  /** Scrive le modifiche nella bozza in QuestionGenerationStep — locale, nessuna chiamata
   *  al backend qui (vedi il commento sopra il componente). */
  onSave: (patch: Partial<DraftQuestion>) => void;
}

/**
 * Copia di QuestionEditContent dedicata alle bozze non ancora inviate in revisione — non lo
 * stesso componente, perché le opzioni in alto sono strutturalmente diverse: qui non c'è un
 * revisore da scegliere (la CTA che apre questa schermata è visibile solo quando il revisore
 * è già te stesso — vedi requestDiscard/isReviewerSelf in QuestionGenerationStep), non c'è
 * Approva/Rigetta (non è un flusso di revisione), e soprattutto la domanda non esiste ancora
 * sul backend (persistedQuestionId è null finché non la mandi in revisione da lì): "Salva
 * modifiche" qui aggiorna solo l'oggetto DraftQuestion in memoria tramite onSave, non chiama
 * questionsService. Per lo stesso motivo Materia/Argomento/Sotto-argomento sono badge statici
 * (i valori già decisi al passo 1), non l'HierarchySelector interattivo dell'originale: quello
 * userebbe useHierarchy per interrogare il catalogo reale, ma le domande generate da
 * QuestionSetupAccordion possono avere un topicId "fixedOptions" (__fixed__...) che nel
 * catalogo non esiste — mostrarlo in un dropdown live lo farebbe apparire vuoto/sbagliato.
 * form (useQuestionForm) resta in modalità "creazione" (nessun editQuestionId, quindi nessuna
 * fetch): viene solo seminato una volta al mount con i valori della bozza, poi form.markClean()
 * azzera isDirty che quella semina avrebbe altrimenti attivato (passa dagli stessi setter
 * dell'utente) — così "Salva modifiche" resta disabilitato finché non tocchi davvero qualcosa.
 */
export function QuestionDraftEditContent({
  draft,
  isMultipleChoice,
  materiaName,
  argomentoName,
  sottoArgomentoName,
  subjectId,
  topicId,
  sottoArgomentoId,
  onClose,
  onSave,
}: QuestionDraftEditContentProps) {
  const form = useQuestionForm({
    initialType: isMultipleChoice ? 'MULTIPLE_CHOICE' : 'COMPLETION',
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

  // La modifica si salva subito al click, non dopo il feedback (vedi il commento sullo state
  // di editReasonOpen sotto): la modale che segue non è più una conferma di salvataggio, è una
  // richiesta di motivazione facoltativa su una modifica già avvenuta — per questo dà conferma
  // (toast) qui, prima di aprirla, e non nella modale stessa.
  const handleSaveClick = () => {
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
    onSave(patch);
    toast.success('Modifiche salvate.', {
      duration: 5000,
      className: REVIEW_SUCCESS_TOAST_CLASSNAME,
    });
    setEditReason('');
    setEditCustomText('');
    setEditReasonOpen(true);
  };

  // La modifica è già salvata a questo punto (vedi handleSaveClick) — chiudere la modale, con
  // "Invia feedback" o saltandola (Salta, Esc, click fuori), riporta sempre alla lista: non
  // c'è più nulla da annullare, solo il motivo facoltativo da loggare o meno.
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
        <Button onClick={handleSaveClick} disabled={hasValidationErrors || !form.isDirty}>
          <Save className="h-4 w-4" />
          Salva modifiche
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
