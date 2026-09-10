import { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  Check,
  ChevronDown,
  Eye,
  FileText,
  ListPlus,
  Loader2,
  LogOut,
  Paperclip,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import type { CreateQuestionPayload, DifficultyLevel } from '@/lib/types/questions';
import { QUESTION_BANKS, pickQuestionBank } from './questionBanks';

type DraftStatus = 'pending' | 'in_revisione' | 'scartata';

// Blu neutro, non uno stato — stessa palette usata da QuestionSetupAccordion per i tag
// di riepilogo a sezione chiusa (coerenza tra le due schermate del flusso).
const HEADER_TAG_CLASSNAME =
  'border-sky-500 bg-sky-100 font-normal text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300';

/** Fonte a cui è ancorata la domanda — tre campi separati (invece di un'unica stringa) così
 *  in UI ogni riga ha l'etichetta attenuata e il valore in evidenza, come da riferimento. */
interface SourceInfo {
  manuale: string;
  capitolo: string;
  pagina: number;
}

interface DraftQuestion {
  id: string;
  /** Codice univoco della domanda — identificativo mostrato in UI, non lo stesso di `id`
   *  (che è solo la chiave interna della lista). Cambia se la domanda viene rigenerata. */
  code: string;
  text: string;
  alternatives: string[];
  correctIndex: number;
  completionAnswer: string;
  /** Correzione commentata — motivazione della risposta corretta ancorata a una fonte,
   *  come da linee guida del brief (nessuna domanda senza fonte). */
  explanation: string;
  /** Passaggio del manuale citato come fonte — mostrato nella modale "Vedi il passaggio". */
  passage: string;
  source: SourceInfo;
  status: DraftStatus;
  /** ID reale una volta creata per davvero sul backend (mock) — non più solo simulata.
   *  Finché è null la domanda vive solo qui; una volta valorizzato, "Scarta" si
   *  disattiva: la fonte di verità è passata al backend, non si può più tornare indietro. */
  persistedQuestionId: string | null;
  isPersisting: boolean;
}

// Proposta di design: ogni domanda deve poter indicare la fonte da cui è stata ancorata (per
// come da brief, mai senza fonte) — un modulo per argomento (stesso ordine della banca), il
// capitolo (argomento + eventuale sottoargomento) e una pagina plausibile.
const MODULE_NUMBERS: Record<string, number> = Object.fromEntries(
  Object.keys(QUESTION_BANKS).map((name, i) => [name, i + 1])
);

function generateSource(argomentoName?: string, sottoArgomentoName?: string): SourceInfo {
  const page = Math.floor(Math.random() * 400) + 20;
  const moduleNumber = argomentoName ? MODULE_NUMBERS[argomentoName] : undefined;
  const manuale = moduleNumber
    ? `Manuale di Teoria - Modulo ${moduleNumber} Chimica`
    : 'Manuale di Teoria - Chimica';
  const capitolo = [argomentoName, sottoArgomentoName].filter(Boolean).join(' - ') || 'Chimica';
  return { manuale, capitolo, pagina: page };
}

/** Versione a testo piano — usata solo per il campo esplicativo reale (nessun campo
 *  dedicato sul backend, vedi buildCreatePayload). */
function formatSource(source: SourceInfo): string {
  return `Manuale: ${source.manuale}\nCapitolo: ${source.capitolo}\nPagina: ${source.pagina}`;
}

const ALT_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// Tag di stato per riga — colori deliberatamente diversi da quelli dello stesso stato
// altrove nel backoffice (es. "Da revisionare" è ambra nella lista Domande): qui il
// verde segnala "già inviata con successo", non "in attesa di qualcuno".
const STATUS_TAG_LABEL: Record<DraftStatus, string> = {
  pending: 'Da revisionare',
  in_revisione: 'In revisione',
  scartata: 'Scartata',
};

const STATUS_TAG_CLASSNAME: Record<DraftStatus, string> = {
  pending:
    'border-yellow-500 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  in_revisione:
    'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  scartata:
    'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

// Proposta di design: codice univoco solo identificativo (non un vero id di dominio, come il
// resto del prototipo) — alfanumerico minuscolo, niente separatori, lunghezza simile
// all'esempio fornito.
const CODE_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';

function generateDraftCode(length = 24): string {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function buildDrafts(
  count: number,
  argomentoName: string | undefined,
  sottoArgomentoName: string | undefined,
  isMultipleChoice: boolean,
  answerCount: number
): DraftQuestion[] {
  const bank = pickQuestionBank(argomentoName);
  return Array.from({ length: count }, (_, i) => {
    const template = bank[i % bank.length];
    return {
      id: `draft-${i}`,
      code: generateDraftCode(),
      text: template.text,
      alternatives: isMultipleChoice ? template.alternatives.slice(0, answerCount) : [],
      correctIndex: 0,
      completionAnswer: template.completionAnswer,
      explanation: template.explanation,
      passage: template.passage,
      source: generateSource(argomentoName, sottoArgomentoName),
      status: 'pending',
      persistedQuestionId: null,
      isPersisting: false,
    };
  });
}

// Proposta di design: la difficoltà scelta per la generazione (DIFFICULTA_OPTIONS, un
// parametro nostro) non è la scala reale delle domande (DifficultyLevel) — questa mappa
// traduce l'una nell'altra solo al momento di creare la domanda per davvero.
const DIFFICULTY_LABEL_TO_REAL: Record<string, DifficultyLevel> = {
  Facile: 'facile',
  'Medio-Facile': 'medio_facile',
  Media: 'medio',
  'Medio-Difficile': 'medio_difficile',
  Difficile: 'difficile',
  Qualsiasi: 'non_ancora_valutata',
};

function toRealDifficulty(label: string | undefined): DifficultyLevel {
  if (!label) return 'non_ancora_valutata';
  return DIFFICULTY_LABEL_TO_REAL[label] ?? 'non_ancora_valutata';
}

interface QuestionGenerationSummaryDialogProps {
  open: boolean;
  onExit: () => void;
  subjectId: string;
  materiaName?: string;
  topicId: string;
  argomentoName?: string;
  sottoArgomentoId: string;
  sottoArgomentoName?: string;
  difficultyLabel?: string;
  typeLabel: string;
  isMultipleChoice: boolean;
  quantity: number;
  answerCount: number;
  /** Chi riceve le domande quando vengono mandate in revisione — scelto in "Gestisci
   *  revisione" (QuestionSetupAccordion), obbligatorio: "Crea Bozze" resta disabilitato
   *  finché non è valorizzato. */
  reviewerId: string | null;
  /** Anteprima della nota facoltativa inserita in "Opzioni aggiuntive" — già troncata a
   *  30 caratteri + ".." da QuestionSetupAccordion, stessa regola del tag a sezione chiusa. */
  notesLabel?: string;
  /** Nome del file allegato in "Opzioni aggiuntive", se presente. */
  attachmentLabel?: string;
  /** Etichetta già pronta del revisore assegnato (es. "Assegnato a te (Nome)") — calcolata
   *  da QuestionSetupAccordion, stessa che compare nel tag di "Gestisci revisione". */
  reviewerLabel?: string;
}

/**
 * Proposta di design — modale di riepilogo dopo "Crea Bozze". Genera contenuti
 * simulati (nessun motore AI reale, come il resto del prototipo): la lista si
 * rigenera ogni volta che la modale si apre. Ogni domanda è di sola lettura —
 * "Manda in revisione" la crea per davvero (mock API), "Scarta" la esclude
 * dall'invio (recuperabile con "Ripristina" finché la modale resta aperta).
 * Nessuna modifica manuale del contenuto in questa schermata: quella vive
 * nella vera schermata di revisione. Uscire richiede che ogni domanda sia
 * stata decisa — inviata o scartata — altrimenti la conferma di uscita
 * avvisa che le domande ancora indecise andranno perse.
 */
export function QuestionGenerationSummaryDialog({
  open,
  onExit,
  subjectId,
  materiaName,
  topicId,
  argomentoName,
  sottoArgomentoId,
  sottoArgomentoName,
  difficultyLabel,
  typeLabel,
  isMultipleChoice,
  quantity,
  answerCount,
  reviewerId,
  notesLabel,
  attachmentLabel,
  reviewerLabel,
}: QuestionGenerationSummaryDialogProps) {
  const client = useApiClient();
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  // "Manda tutte in revisione" in corso — disabilita il pulsante in alto mentre le chiamate
  // sono in volo (quelle per riga hanno il proprio isPersisting, vedi DraftQuestion).
  const [isSendingAll, setIsSendingAll] = useState(false);
  // Pausa breve dopo l'invio riuscito, prima di chiudere — lascia il tempo di leggere
  // il toast di conferma. Il pulsante resta a icona di caricamento per tutta la durata,
  // così non sembra "finito" e poi sparisce di colpo.
  const [isClosingAfterSend, setIsClosingAfterSend] = useState(false);
  // "Esci" non chiude più direttamente — chiede prima conferma (l'unico modo di uscire
  // da questa schermata, dato che click esterno ed Escape sono disattivati).
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  // Id del draft di cui "Vedi il passaggio" sta mostrando la fonte — null quando la
  // modale è chiusa.
  const [passageDraftId, setPassageDraftId] = useState<string | null>(null);

  // Un ref per riga (chiave = draft.id), per poter ancorare lo scroll all'inizio
  // della riga appena aperta — vedi l'effect sotto.
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Cliccare sullo sfondo (header, footer, area tra le righe) chiude la riga aperta —
  // stesso pattern di QuestionSetupAccordion. Esclude i click dentro un altro Dialog
  // annidato (es. "Vedi il passaggio", conferma di uscita): non sono "sfondo", sono
  // un'altra superficie sopra quella corrente.
  const rowsListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openRowId) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (rowsListRef.current?.contains(target)) return;
      if (target instanceof Element) {
        const targetDialog = target.closest('[data-slot="dialog-content"]');
        const ownDialog = rowsListRef.current?.closest('[data-slot="dialog-content"]');
        if (targetDialog && targetDialog !== ownDialog) return;
      }
      setOpenRowId(null);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openRowId]);

  useEffect(() => {
    if (open) {
      setDrafts(
        buildDrafts(quantity, argomentoName, sottoArgomentoName, isMultipleChoice, answerCount)
      );
      setOpenRowId(null);
      setConfirmExitOpen(false);
      setPassageDraftId(null);
      setIsClosingAfterSend(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // A prescindere da dove si trovava lo scroll, aprire una riga la ancora in cima
  // all'area scrollabile: l'utente vede subito il testo della domanda appena aperta,
  // non un accordion che si espande fuori dalla vista.
  useEffect(() => {
    if (openRowId) {
      rowRefs.current[openRowId]?.scrollIntoView({ block: 'start' });
    }
  }, [openRowId]);

  const updateDraft = (id: string, patch: Partial<DraftQuestion>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  // Scelta deliberata di non tenere questa domanda — resta recuperabile con "Ripristina"
  // finché la modale è aperta; non tocca il backend (non è mai stata creata).
  const discard = (id: string) => {
    updateDraft(id, { status: 'scartata' });
    toast.success('Domanda scartata.');
  };

  const restore = (id: string) => {
    updateDraft(id, { status: 'pending' });
    toast.success('Domanda ripristinata.');
  };

  const buildCreatePayload = (draft: DraftQuestion): CreateQuestionPayload => ({
    subjectId,
    subjectName: materiaName ?? '',
    topicId,
    topicName: argomentoName ?? '',
    sottoArgomentoId,
    type: isMultipleChoice ? 'MULTIPLE_CHOICE' : 'COMPLETION',
    difficulty: toRealDifficulty(difficultyLabel),
    questionText: draft.text,
    // Il backend reale non ha un campo dedicato per la fonte della "Correzione
    // commentata" — la accodiamo al campo esplicativo esistente invece di inventare un
    // campo che il backend vero non saprebbe salvare (additionalProperties: false).
    explanationText: `${draft.explanation}\n\n${formatSource(draft.source)}`,
    alternatives: isMultipleChoice
      ? draft.alternatives.map((text, i) => ({
          id: crypto.randomUUID(),
          text,
          isCorrect: i === draft.correctIndex,
          order: i,
        }))
      : [],
    completionAnswer: isMultipleChoice ? '' : draft.completionAnswer,
    language: 'IT-it',
  });

  /** Crea la domanda per davvero (mock API) e, se c'è un revisore, la manda subito in
   *  revisione. Ritorna l'id reale creato. */
  const persistDraft = async (draft: DraftQuestion): Promise<string> => {
    const created = await questionsService.create(client, buildCreatePayload(draft));
    if (reviewerId) {
      await questionsService.submit(client, created.id, reviewerId);
    }
    return created.id;
  };

  const sendToReview = async (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft || draft.status !== 'pending') return;
    updateDraft(id, { isPersisting: true });
    try {
      const questionId = await persistDraft(draft);
      updateDraft(id, {
        status: 'in_revisione',
        persistedQuestionId: questionId,
        isPersisting: false,
      });
      toast.success('Domanda mandata in revisione.');
    } catch {
      updateDraft(id, { isPersisting: false });
      toast.error("Errore durante l'invio in revisione. Riprova.");
    }
  };

  /** Manda in revisione tutte le domande ancora "pending" (non le scartate). Ritorna il
   *  numero di invii falliti, così chi chiama può decidere se uscire subito dopo o no. */
  const sendAllToReview = async (): Promise<number> => {
    const targets = drafts.filter((d) => d.status === 'pending');
    if (targets.length === 0) return 0;
    setIsSendingAll(true);
    setDrafts((prev) =>
      prev.map((d) => (targets.some((t) => t.id === d.id) ? { ...d, isPersisting: true } : d))
    );
    const outcomes = await Promise.allSettled(targets.map((d) => persistDraft(d)));
    let failures = 0;
    setDrafts((prev) =>
      prev.map((d) => {
        const idx = targets.findIndex((t) => t.id === d.id);
        if (idx === -1) return d;
        const outcome = outcomes[idx];
        if (outcome.status === 'fulfilled') {
          return {
            ...d,
            status: 'in_revisione',
            persistedQuestionId: outcome.value,
            isPersisting: false,
          };
        }
        failures += 1;
        return { ...d, isPersisting: false };
      })
    );
    setIsSendingAll(false);
    if (failures > 0) {
      toast.error('Alcune domande non sono state inviate in revisione. Riprova.');
    } else {
      toast.success('Domande mandate in revisione.');
    }
    return failures;
  };

  // "Manda tutte e esci" nella conferma di uscita: invia il rimanente e esce solo se
  // è andato tutto a buon fine — altrimenti resta sul riepilogo, che nel frattempo
  // mostra già lo stato aggiornato riga per riga.
  const handleSendAllAndExit = async () => {
    const failures = await sendAllToReview();
    if (failures === 0) {
      onExit();
    } else {
      setConfirmExitOpen(false);
    }
  };

  // CTA principale del footer: invia tutte le domande "pending" e, se è andato tutto
  // a buon fine, chiude da sola dopo una breve pausa — l'utente non deve più cliccare
  // "Esci" a mano. In caso di errori resta sul riepilogo (già segnalato dal toast).
  const handleSendAllToReview = async () => {
    const failures = await sendAllToReview();
    if (failures === 0) {
      setIsClosingAfterSend(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onExit();
    }
  };

  const handleExitClick = () => {
    if (daDecidere === 0) {
      onExit();
    } else {
      setConfirmExitOpen(true);
    }
  };

  const inRevisione = drafts.filter((d) => d.status === 'in_revisione').length;
  const scartate = drafts.filter((d) => d.status === 'scartata').length;
  const daDecidere = drafts.length - inRevisione - scartate;

  // Tre righe di tag distinte nell'header: composizione della domanda, opzioni
  // aggiuntive (nota + allegato) e revisore assegnato — ognuna a capo, solo se ha
  // almeno un valore.
  // Divise in due gruppi, separati da un divider "|" — riflette le due sezioni distinte
  // del form da cui provengono (Classificazione e Composizione).
  const classificationTags = [materiaName, argomentoName, sottoArgomentoName].filter(
    (v): v is string => !!v
  );
  const compositionOnlyTags = [
    difficultyLabel,
    typeLabel,
    isMultipleChoice ? `${answerCount} risposte` : null,
  ].filter((v): v is string => !!v);
  const compositionTags = [...classificationTags, ...compositionOnlyTags];

  const additionalOptionsTags: { label: string; icon: LucideIcon }[] = [
    notesLabel ? { label: notesLabel, icon: FileText } : null,
    attachmentLabel ? { label: attachmentLabel, icon: Paperclip } : null,
  ].filter((v): v is { label: string; icon: LucideIcon } => v !== null);

  const hasHeaderTagRows =
    compositionTags.length > 0 || additionalOptionsTags.length > 0 || !!reviewerLabel;
  // Con una domanda aperta, queste righe non servono più (sono uguali per ogni riga,
  // non specifiche della domanda in vista) — si comprimono per fare spazio.
  const isRowOpen = openRowId !== null;

  const passageDraft = drafts.find((d) => d.id === passageDraftId) ?? null;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onExit()}>
      <DialogContent
        className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-4xl"
        showCloseButton={false}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-0 border-b px-8 py-6">
          <div className="flex flex-col text-left">
            <div className="flex items-start justify-between gap-4">
              <DialogTitle>{drafts.length} Domande Create</DialogTitle>
              <Badge variant="secondary" className="shrink-0">
                <Eye className="size-3" />
                Domande in sola lettura
              </Badge>
            </div>
            {hasHeaderTagRows && (
              // Trucco grid-template-rows 0fr/1fr per animare un'altezza "auto" — le tag
              // vanno a capo, quindi un max-height fisso non reggerebbe. Si comprime aprendo
              // una domanda (openRowId): quelle righe descrivono l'intera generazione, non la
              // singola domanda, quindi restano invariate riga per riga — nasconderle non
              // perde informazione, e si riprende spazio verticale proprio quando serve di più.
              <div
                className={cn(
                  'grid transition-all duration-200 ease-out',
                  isRowOpen ? 'grid-rows-[0fr]' : 'mt-4 grid-rows-[1fr]'
                )}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-3.5">
                    {compositionTags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <SlidersHorizontal className="size-3.5 shrink-0 text-muted-foreground" />
                        <div className="flex flex-wrap items-center gap-1.5">
                          {classificationTags.map((tag) => (
                            <Badge key={tag} variant="outline" className={HEADER_TAG_CLASSNAME}>
                              {tag}
                            </Badge>
                          ))}
                          {classificationTags.length > 0 && compositionOnlyTags.length > 0 && (
                            <span className="text-muted-foreground" aria-hidden="true">
                              |
                            </span>
                          )}
                          {compositionOnlyTags.map((tag) => (
                            <Badge key={tag} variant="outline" className={HEADER_TAG_CLASSNAME}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {additionalOptionsTags.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <ListPlus className="size-3.5 shrink-0 text-muted-foreground" />
                        <div className="flex flex-wrap gap-1.5">
                          {additionalOptionsTags.map(({ label, icon: Icon }) => (
                            <Badge key={label} variant="outline" className={HEADER_TAG_CLASSNAME}>
                              <Icon className="size-3" />
                              {label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {reviewerLabel && (
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="size-3.5 shrink-0 text-muted-foreground" />
                        <Badge variant="outline" className={HEADER_TAG_CLASSNAME}>
                          {reviewerLabel}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogHeader>

        <div ref={rowsListRef} className="flex-1 overflow-y-auto">
          {drafts.map((draft, index) => {
            const isOpen = openRowId === draft.id;
            // Una volta creata per davvero (mock API), la fonte di verità passa al backend:
            // "Scarta" si disattiva.
            const isPersisted = !!draft.persistedQuestionId;
            const isScartata = draft.status === 'scartata';
            return (
              <div
                key={draft.id}
                ref={(el) => {
                  rowRefs.current[draft.id] = el;
                }}
                className="border-b last:border-b-0"
              >
                <div
                  className={cn(
                    'flex w-full items-center justify-between gap-4 px-8 py-5 transition-colors',
                    !isOpen && 'hover:bg-accent/50'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenRowId(isOpen ? null : draft.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p
                      className={cn(
                        'truncate text-sm font-medium',
                        isScartata && 'text-muted-foreground line-through'
                      )}
                    >
                      <span className="mr-1.5 text-muted-foreground">{index + 1}.</span>
                      {draft.text}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                      {draft.code}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn('mt-1.5', STATUS_TAG_CLASSNAME[draft.status])}
                    >
                      {STATUS_TAG_LABEL[draft.status]}
                    </Badge>
                  </button>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </div>

                {isOpen && (
                  <div className="px-8 py-3">
                    <div className="space-y-5 rounded-lg bg-muted/50 p-5">
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Testo della domanda</p>
                        <p className="text-sm">{draft.text}</p>
                      </div>

                      {isMultipleChoice ? (
                        <div className="space-y-2.5">
                          <p className="text-xs text-muted-foreground">Risposte</p>
                          {draft.alternatives.map((alt, i) => {
                            const isCorrect = draft.correctIndex === i;
                            return (
                              <div
                                key={i}
                                className={cn(
                                  'flex items-center gap-3 rounded-md border px-3 py-2 text-sm',
                                  isCorrect
                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                                    : 'border-border bg-background'
                                )}
                              >
                                <span
                                  className={cn(
                                    'flex size-5 shrink-0 items-center justify-center',
                                    !isCorrect && 'invisible'
                                  )}
                                >
                                  <Check className="size-3.5" />
                                </span>
                                <span>{alt}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">Risposta corretta</p>
                          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                            {draft.completionAnswer}
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5 border-t pt-4">
                        <p className="text-xs text-muted-foreground">Correzione commentata</p>
                        <p className="text-sm font-semibold">
                          Risposta corretta:{' '}
                          {isMultipleChoice
                            ? (ALT_LETTERS[draft.correctIndex] ?? '')
                            : draft.completionAnswer}
                        </p>
                        <p className="text-sm">{draft.explanation}</p>
                        <div className="space-y-2 pt-3">
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <BookOpen className="size-3.5" />
                            Fonte
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm">
                              <span className="font-semibold">Manuale:</span> {draft.source.manuale}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Capitolo:</span>{' '}
                              {draft.source.capitolo}
                            </p>
                            <p className="text-sm">
                              <span className="font-semibold">Pagina:</span> {draft.source.pagina}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-1"
                            onClick={() => setPassageDraftId(draft.id)}
                          >
                            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                            Vedi il passaggio
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={isPersisted || isScartata}
                          onClick={() => discard(draft.id)}
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Scarta
                        </Button>
                        {isScartata && (
                          <Button variant="ghost" size="sm" onClick={() => restore(draft.id)}>
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Ripristina
                          </Button>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-end gap-3">
                        <Button
                          size="sm"
                          disabled={draft.status !== 'pending' || draft.isPersisting}
                          onClick={() => sendToReview(draft.id)}
                        >
                          {draft.isPersisting ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Manda in revisione
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-4 border-t px-8 py-3">
          <p className="text-sm text-muted-foreground">
            {inRevisione} in revisione · {scartate} scartate · {daDecidere} da revisionare
          </p>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleExitClick}>
              <LogOut className="mr-1.5 h-4 w-4" />
              Esci
            </Button>
            <Button onClick={handleSendAllToReview} disabled={isSendingAll || isClosingAfterSend}>
              {isSendingAll || isClosingAfterSend ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Manda tutte in revisione
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Si apre solo se restano domande "da decidere" — se sono già tutte inviate o
          scartate, non c'è niente da perdere e "Esci" chiude direttamente. */}
      <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Uscire dal riepilogo domande?</DialogTitle>
            <DialogDescription>
              {inRevisione} in revisione · {scartate} scartate · {daDecidere} ancora da revisionare.
              Se esci ora, quelle non ancora inviate né scartate andranno perse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmExitOpen(false)}>
              Rimani
            </Button>
            <Button variant="outline" onClick={onExit}>
              Esci comunque
            </Button>
            <Button onClick={handleSendAllAndExit} disabled={isSendingAll}>
              {isSendingAll ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Manda tutte e esci
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Il testo citato varia per domanda (draft.passage) — stessa fonte già mostrata
          nelle tre righe sopra, qui nel formato compatto della citazione. */}
      <Dialog open={!!passageDraftId} onOpenChange={(next) => !next && setPassageDraftId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fonte</DialogTitle>
            {passageDraft && (
              <DialogDescription>
                {passageDraft.source.manuale} — {passageDraft.source.capitolo} · p.{' '}
                {passageDraft.source.pagina}
              </DialogDescription>
            )}
          </DialogHeader>
          {passageDraft && (
            <div className="rounded-lg bg-muted/50 p-5">
              <p className="text-sm leading-relaxed">{passageDraft.passage}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
