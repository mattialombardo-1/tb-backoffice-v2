import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BookOpen,
  Check,
  CheckCircle,
  ChevronDown,
  Eye,
  FileText,
  ListChecks,
  ListPlus,
  Loader2,
  Paperclip,
  Pencil,
  RotateCcw,
  Send,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { useCapabilities } from '@/lib/auth';
import { questionsService } from '@/lib/services/questions';
import { useBulkSelection } from '@/lib/hooks/useBulkSelection';
import {
  DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  type CreateQuestionPayload,
  type DifficultyLevel,
  type QuestionType,
} from '@/lib/types/questions';
import { createGenerationId, recordGeneratedQuestion } from '@/lib/hooks/questionGenerationBatches';
import { REJECT_CUSTOM_REASON, REJECT_CUSTOM_TEXT_MAX, REJECT_REASONS } from '@/lib/rejectReasons';
import { QuestionDraftEditContent } from './QuestionDraftEditContent';
import { QUESTION_BANKS, pickQuestionBank } from './questionBanks';

// 'approvata' esiste solo per il Caso A (revisore = sé stessi): la domanda è creata e
// approvata subito, senza mai passare da 'in_revisione' — 'in_revisione' esiste solo per
// il Caso B (altro revisore). I due stati non si mischiano mai sulla stessa domanda, sono
// prodotti da due percorsi di persistenza distinti (vedi persistAndApprove/persistAndSubmit
// più sotto).
export type DraftStatus = 'pending' | 'in_revisione' | 'approvata' | 'scartata';

// Grayscale, non l'accento blu: sono un riepilogo di cosa hai generato, non uno stato — un
// colore acceso avrebbe fatto contrasto con i badge di stato delle righe sotto, che sono
// l'informazione che conta davvero qui. Stesso trattamento di QuestionSetupAccordion.
const HEADER_TAG_CLASSNAME = 'border-border bg-muted font-normal text-muted-foreground';

/** Fonte a cui è ancorata la domanda — tre campi separati (invece di un'unica stringa) così
 *  in UI ogni riga ha l'etichetta attenuata e il valore in evidenza, come da riferimento. */
export interface SourceInfo {
  manuale: string;
  capitolo: string;
  pagina: number;
}

export interface DraftQuestion {
  id: string;
  /** Codice univoco della domanda — identificativo mostrato in UI, non lo stesso di `id`
   *  (che è solo la chiave interna della lista). Cambia se la domanda viene rigenerata. */
  code: string;
  /** Assegnata alla domanda già in fase di generazione (vedi buildDrafts), non più derivata
   *  da un unico parametro di batch: ogni domanda porta il livello del proprio "secchio"
   *  (facile/media/difficile), il batch può mischiarli nella stessa richiesta. */
  difficulty: DifficultyLevel;
  /** Stessa idea di `difficulty` sopra, applicata al tipo: con la griglia difficoltà × tipo
   *  di QuestionSetupAccordion il batch può mischiare "Risposta chiusa" e "Completamento"
   *  nella stessa generazione, quindi ogni domanda porta anche il proprio tipo. */
  type: QuestionType;
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

// manualeTitle: quando il flusso parte dal picker di AddQuestionDialog, la riga "Manuale"
// della Fonte deve sempre coincidere con quello scelto lì — non ha senso ancorare la domanda
// a un manuale diverso da quello dichiarato in partenza. Il nome sintetico sotto resta solo
// il fallback per i percorsi senza un manuale scelto (es. da campagna).
function generateSource(
  argomentoName: string | undefined,
  sottoArgomentoName: string | undefined,
  manualeTitle: string | undefined
): SourceInfo {
  const page = Math.floor(Math.random() * 400) + 20;
  const moduleNumber = argomentoName ? MODULE_NUMBERS[argomentoName] : undefined;
  const manuale =
    manualeTitle ??
    (moduleNumber
      ? `Manuale di Teoria - Modulo ${moduleNumber} Chimica`
      : 'Manuale di Teoria - Chimica');
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
// "Da mandare in revisione" resta il default (Caso B, il più comune) — il Caso A lo
// sovrascrive con "Da decidere" a runtime (vedi statusLabel dentro il componente, usa
// isReviewerSelf che non esiste qui a livello di modulo).
const STATUS_TAG_LABEL: Record<DraftStatus, string> = {
  // Non "Da revisionare": chi genera qui non è quasi mai chi revisiona — nel 90% dei
  // casi la manda a un altro revisore. "Da revisionare" implicherebbe erroneamente
  // che tocchi a lui/lei; il vero passo che manca è inviarla.
  pending: 'Da mandare in revisione',
  in_revisione: 'In revisione',
  // Solo Caso A (vedi DraftStatus) — mai prodotto insieme a in_revisione sulla stessa domanda.
  approvata: 'Approvata',
  scartata: 'Scartata',
};

const STATUS_TAG_CLASSNAME: Record<DraftStatus, string> = {
  pending:
    'border-yellow-500 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  in_revisione:
    'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  // Stesso verde di in_revisione: entrambi sono l'esito "riuscito" della propria riga, solo
  // per casi diversi (mai insieme nello stesso batch, vedi isReviewerSelf).
  approvata:
    'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  scartata:
    'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
};

// Toast di conferma invio in revisione — verde successo invece del grigio neutro di tutti
// gli altri toast dell'app (Toaster in sonner.tsx forza bg-background/text-foreground su
// tutto, per design). Stessi toni di STATUS_TAG_CLASSNAME.in_revisione sopra, solo con !
// per vincere sulla classe neutra di base. Scoped a questi toast (per-call className), non
// al Toaster globale: cambiare quello colorerebbe ogni toast.success dell'app, non richiesto.
// Esportata perché QuestionDraftEditContent riusa lo stesso verde/stessa durata per il
// toast di "Modifiche salvate." — stesso linguaggio visivo di conferma in tutto il flusso.
export const REVIEW_SUCCESS_TOAST_CLASSNAME =
  '!border-emerald-500 !bg-emerald-100 !text-emerald-700 dark:!border-emerald-800 dark:!bg-emerald-950 dark:!text-emerald-300';

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

/** Quante domande generare per ciascuna cella difficoltà × tipo — sostituisce il vecchio
 *  parametro unico "count" + "un solo tipo per tutto il batch": ogni cella ha il suo
 *  secchio, la richiesta può mischiarli (es. 5 chiuse facili, 3 aperte medie, 10 chiuse
 *  difficili nella stessa generazione). */
type QuantityByDifficultyAndType = Record<
  'facile' | 'media' | 'difficile',
  Record<QuestionType, number>
>;

/** Numero di risposte per "Risposta chiusa", uno per livello — non più un unico valore
 *  per l'intero batch (vedi answerCounts in QuestionSetupAccordion). */
type AnswerCountByDifficulty = Record<keyof QuantityByDifficultyAndType, number>;

// Le tre etichette di QuestionSetupAccordion → scala reale delle domande (DifficultyLevel).
// "Media" è l'unico nome che non coincide 1:1 con la scala reale (lì è "medio").
const BUCKET_TO_REAL_DIFFICULTY: Record<keyof QuantityByDifficultyAndType, DifficultyLevel> = {
  facile: 'facile',
  media: 'medio',
  difficile: 'difficile',
};

const QUESTION_TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

function buildDrafts(
  quantityByDifficultyAndType: QuantityByDifficultyAndType,
  argomentoName: string | undefined,
  sottoArgomentoName: string | undefined,
  answerCountByDifficulty: AnswerCountByDifficulty,
  manualeTitle: string | undefined
): DraftQuestion[] {
  const bank = pickQuestionBank(argomentoName);
  // Un secchio per livello, nell'ordine facile → media → difficile, e dentro ogni livello
  // un secchio per tipo — non mischiati a caso nella lista, così scorrendola si capisce a
  // colpo d'occhio come si compone il batch.
  const drafts: DraftQuestion[] = [];
  (Object.keys(BUCKET_TO_REAL_DIFFICULTY) as (keyof QuantityByDifficultyAndType)[]).forEach(
    (bucket) => {
      QUESTION_TYPES.forEach((type) => {
        const isMultipleChoice = type === 'MULTIPLE_CHOICE';
        for (let i = 0; i < quantityByDifficultyAndType[bucket][type]; i++) {
          const index = drafts.length;
          const template = bank[index % bank.length];
          drafts.push({
            id: `draft-${index}`,
            code: generateDraftCode(),
            difficulty: BUCKET_TO_REAL_DIFFICULTY[bucket],
            type,
            text: template.text,
            alternatives: isMultipleChoice
              ? template.alternatives.slice(0, answerCountByDifficulty[bucket])
              : [],
            correctIndex: 0,
            completionAnswer: template.completionAnswer,
            explanation: template.explanation,
            passage: template.passage,
            source: generateSource(argomentoName, sottoArgomentoName, manualeTitle),
            status: 'pending',
            persistedQuestionId: null,
            isPersisting: false,
          });
        }
      });
    }
  );
  return drafts;
}

interface QuestionGenerationStepProps {
  onExit: () => void;
  subjectId: string;
  materiaName?: string;
  topicId: string;
  argomentoName?: string;
  sottoArgomentoId: string;
  sottoArgomentoName?: string;
  /** Quante domande per cella difficoltà × tipo — sostituisce quantity+difficultyLabel+
   *  typeLabel: non più un totale con una difficoltà e un tipo uniformi, un batch può
   *  mischiare i tre livelli e i due tipi. */
  quantityByDifficultyAndType: QuantityByDifficultyAndType;
  /** Numero di risposte per "Risposta chiusa", uno per livello — sostituisce il vecchio
   *  answerCount unico per tutto il batch, coerente con quantityByDifficultyAndType sopra. */
  answerCountByDifficulty: AnswerCountByDifficulty;
  /** Chi riceve le domande quando vengono mandate in revisione — scelto in "Gestisci
   *  revisione" (QuestionSetupAccordion), obbligatorio: "Crea Domanda" resta disabilitato
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
  /** Manuale scelto in AddQuestionDialog, se il flusso parte da lì — vedi generateSource:
   *  ancora la riga "Manuale" della Fonte a quello scelto invece che a un nome sintetico. */
  manualeTitle?: string;
}

/**
 * Secondo step del flusso di creazione domande, non un dialog — stesso layout full-screen
 * di QuestionCreatePage (QuestionSetupAccordion lo monta al posto dell'accordion quando
 * "Crea Domanda" viene premuto, stesso `fixed inset-0`). Un dialog pieno di informazioni
 * toglieva il senso di flusso e invitava a chiuderlo; qui invece si scorre come nello
 * step 1. Genera contenuti simulati (nessun motore AI reale, come il resto del
 * prototipo): una nuova lista ad ogni montaggio, cioè ad ogni "Crea Domanda". Ogni domanda
 * è di sola lettura — "Manda in revisione" la crea per davvero (mock API), "Scarta" la
 * esclude dall'invio (recuperabile con "Ripristina" finché questo step resta montato).
 * Modifica manuale del contenuto possibile solo quando il revisore è te stesso (CTA
 * "Modifica" per riga, vedi isReviewerSelf/editingDraftId/QuestionDraftEditContent più
 * sotto) — per chiunque altro la domanda resta di sola lettura qui, si corregge dalla vera
 * schermata di revisione. Uscire richiede che ogni domanda sia stata decisa — inviata o
 * scartata — altrimenti la conferma di uscita avvisa che le domande ancora indecise
 * andranno perse.
 */
export function QuestionGenerationStep({
  onExit,
  subjectId,
  materiaName,
  topicId,
  argomentoName,
  sottoArgomentoId,
  sottoArgomentoName,
  quantityByDifficultyAndType,
  answerCountByDifficulty,
  reviewerId,
  notesLabel,
  attachmentLabel,
  reviewerLabel,
  manualeTitle,
}: QuestionGenerationStepProps) {
  const client = useApiClient();
  const { t } = useTranslation();
  // "A te stesso" vs "a qualcun altro" — stessa fonte (meId) di QuestionSetupAccordion, non
  // una prop dedicata: lì reviewerChoice ('me' | 'other') non arriva fin qui, solo il
  // reviewerId già risolto — ricalcoliamo il confronto qui invece di allargare l'interfaccia
  // per un solo booleano derivabile. Quando è sé stesso, mandare in revisione non merita una
  // conferma: è solo un passo del proprio flusso, non un invio a qualcun altro.
  const { me } = useCapabilities();
  const isReviewerSelf = reviewerId !== null && reviewerId === (me?.user._id ?? null);
  // reviewerLabel arriva già formattato da QuestionSetupAccordion ("Assegnato a Nome
  // Cognome" quando non è "a te" — vedi gestisciRevisioneLabel lì): estraiamo solo il nome
  // per poterlo inserire a metà frase nella modale di conferma e nel copy dell'uscita,
  // invece di dover ripetere "Assegnato a" in mezzo a un'altra frase.
  const reviewerDisplayName = reviewerLabel?.replace(/^Assegnato a /, '') ?? '';
  // Nome proprio (non "te") per il caso "a sé stessi" — stessa fonte/stesso fallback di
  // meName in QuestionSetupAccordion. Serve solo al toast sotto: lì il nome ci deve essere
  // sempre, anche quando il revisore è l'utente stesso — la modale di conferma (sopra) resta
  // invece l'unico punto che salta per il caso "a sé stessi", quello non cambia.
  const meName = [me?.user.name, me?.user.surname].filter(Boolean).join(' ') || 'te';
  // Suffisso "a Nome Cognome" per i toast di conferma invio — sempre il nome vero, anche a
  // sé stessi (non "a te").
  const recipientSuffix = ` a ${isReviewerSelf ? meName : reviewerDisplayName}`;
  // Inizializzati al montaggio (lazy initializer), non da un effect che "resetta all'apertura":
  // questo step viene montato/smontato da QuestionSetupAccordion, quindi ogni apertura è già
  // un montaggio nuovo — una nuova lista di bozze compresa.
  const [drafts, setDrafts] = useState<DraftQuestion[]>(() =>
    buildDrafts(
      quantityByDifficultyAndType,
      argomentoName,
      sottoArgomentoName,
      answerCountByDifficulty,
      manualeTitle
    )
  );
  // Un id per questa generazione (un montaggio = una generazione, vedi sopra) — registrato
  // per ogni domanda creata per davvero (vedi persistAndApprove/persistAndSubmit più sotto),
  // così "Domande da revisionare" può formare un batch a sé per ogni generazione invece di
  // sommarla a una già esistente con stessi materia/argomento/data. Vedi
  // questionGenerationBatches.ts.
  const [generationId] = useState(createGenerationId);
  // Più domande possono restare aperte insieme (non solo l'ultima cliccata): ognuna con il
  // proprio header sticky, così scorrendo capisci sempre in quale sei — vedi il trigger di riga.
  const [openRowIds, setOpenRowIds] = useState<string[]>([]);
  // L'ultima riga aperta (non chiusa) — è quella su cui ancorare lo scroll, non l'intero set.
  const [lastOpenedId, setLastOpenedId] = useState<string | null>(null);
  // Riga che si è appena richiusa da sola dopo un'approvazione (non un toggle manuale
  // dell'utente): il collasso del suo contenuto sposta il resto della lista verso l'alto,
  // quindi senza riancorare lo scroll ci si ritrova a vedere righe più in basso invece del
  // titolo appena approvato — vedi l'effect gemello di quello su lastOpenedId.
  const [lastAutoClosedId, setLastAutoClosedId] = useState<string | null>(null);
  // "Manda tutte in revisione" in corso — disabilita il pulsante in alto mentre le chiamate
  // sono in volo (quelle per riga hanno il proprio isPersisting, vedi DraftQuestion).
  const [isSendingAll, setIsSendingAll] = useState(false);
  // Pausa breve dopo l'invio riuscito, prima di uscire — lascia il tempo di leggere
  // il toast di conferma. Il pulsante resta a icona di caricamento per tutta la durata,
  // così non sembra "finito" e poi sparisce di colpo.
  const [isClosingAfterSend, setIsClosingAfterSend] = useState(false);
  // "Esci" non esce più direttamente se restano domande da decidere — chiede prima conferma.
  const [confirmExitOpen, setConfirmExitOpen] = useState(false);
  // Selezione multipla — stesso hook generico e stesse caratteristiche di "Domande da
  // revisionare" (checkbox "seleziona tutto" con indeterminate, chip col conteggio,
  // Annulla selezione, Scarta e Manda in revisione disattivate finché non c'è almeno una
  // domanda selezionata). Solo le domande "pending" sono selezionabili — stesso criterio
  // che già abilita/disabilita "Scarta" e "Manda in revisione" riga per riga.
  const bulk = useBulkSelection();
  const [isBulkSending, setIsBulkSending] = useState(false);
  // Id del draft di cui "Vedi il passaggio" sta mostrando la fonte — null quando la
  // modale è chiusa.
  const [passageDraftId, setPassageDraftId] = useState<string | null>(null);
  // Id del draft aperto in QuestionDraftEditContent (CTA "Modifica" — solo quando il
  // revisore è sé stessi, vedi isReviewerSelf) — null quando l'editor è chiuso.
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  // Azione di invio in attesa di conferma — solo quando il revisore non è "te stesso" (vedi
  // isReviewerSelf sopra). Un solo stato per tutti e tre gli entry point (riga singola, "Manda
  // tutte in revisione", "Manda in revisione" della selezione) invece di tre dialog separati:
  // stesso contenuto/stesse azioni, cambia solo cosa contare e quale funzione invocare alla
  // conferma. null = modale chiusa.
  const [pendingSend, setPendingSend] = useState<
    { kind: 'single'; id: string } | { kind: 'all' } | { kind: 'selection' } | null
  >(null);
  // Azione di scarto in attesa di conferma — stesso pattern di pendingSend sopra, un solo
  // stato per i due entry point (riga singola, "Scarta" della selezione). Prima passavano
  // diretti (vedi discard/handleBulkDiscard sotto): ora chiedono sempre un motivo, anche se
  // la domanda non è mai stata creata per davvero — è feedback su cosa migliorare nella
  // prossima generazione, non una spiegazione dovuta a qualcuno. ids fissati al momento
  // dell'apertura (non ricalcolati da bulk.selectedIds alla conferma): la selezione non
  // cambia comunque mentre la modale è aperta, ma così il conteggio nel copy è garantito
  // stabile. null = modale chiusa.
  const [pendingDiscard, setPendingDiscard] = useState<
    { kind: 'single'; id: string } | { kind: 'selection'; ids: string[] } | null
  >(null);
  const [discardReason, setDiscardReason] = useState('');
  const [discardCustomText, setDiscardCustomText] = useState('');
  const isDiscardCustomReason = discardReason === REJECT_CUSTOM_REASON;
  const canConfirmDiscard =
    discardReason !== '' && (!isDiscardCustomReason || discardCustomText.trim().length > 0);

  // Un ref per riga (chiave = draft.id), per poter ancorare lo scroll all'inizio
  // della riga appena aperta — vedi l'effect sotto.
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Cliccare sullo sfondo (header, area tra le righe) richiude tutte le righe aperte —
  // stesso pattern di QuestionSetupAccordion, con la stessa esclusione dei bottoni esterni
  // (altrimenti il pointerdown sposta il layout PRIMA che il click si risolva e lo "ruba" a
  // bottoni come "Manda tutte in revisione"). Esclude anche i click dentro un Dialog
  // annidato (conferma di uscita, "Vedi il passaggio") E sul suo overlay — cliccare fuori
  // da quelle modali deve solo chiuderle, senza toccare le righe aperte sotto né lo scroll.
  // Esclude anche i popper Radix (es. il <Select> "Motivazione" nel dialog di Scarta): il
  // suo elenco opzioni è portato fuori dal DOM del dialog, in un wrapper a sé con
  // data-radix-popper-content-wrapper — senza l'esclusione, scegliere un motivo veniva
  // letto come "click fuori" e richiudeva la riga aperta sotto, senza nessun ancoraggio
  // dello scroll (a differenza della richiusura automatica dopo Approva/Scarta).
  const rowsListRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (openRowIds.length === 0) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (rowsListRef.current?.contains(target)) return;
      if (
        target instanceof Element &&
        target.closest(
          '[data-slot="dialog-content"], [data-slot="dialog-overlay"], [data-radix-popper-content-wrapper]'
        )
      ) {
        return;
      }
      if (target instanceof Element && target.closest('button')) return;
      setOpenRowIds([]);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openRowIds.length]);

  // A prescindere da dove si trovava lo scroll, aprire una riga la ancora in cima
  // all'area scrollabile: l'utente vede subito il testo della domanda appena aperta,
  // non un accordion che si espande fuori dalla vista.
  useEffect(() => {
    if (lastOpenedId) {
      rowRefs.current[lastOpenedId]?.scrollIntoView({ block: 'start' });
    }
  }, [lastOpenedId]);

  // Stessa ancora, per la richiusura automatica dopo l'approvazione: la riga appena
  // approvata deve restare in vista, non sparire sotto le righe che le stavano dietro.
  useEffect(() => {
    if (lastAutoClosedId) {
      rowRefs.current[lastAutoClosedId]?.scrollIntoView({ block: 'start' });
    }
  }, [lastAutoClosedId]);

  const toggleRow = (id: string) => {
    setOpenRowIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      setLastOpenedId(id);
      return [...prev, id];
    });
  };

  const updateDraft = (id: string, patch: Partial<DraftQuestion>) => {
    setDrafts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  // Scelta deliberata di non tenere questa domanda — resta recuperabile con "Ripristina"
  // finché questo step resta montato; non tocca il backend (non è mai stata creata). Il
  // motivo non viene salvato da nessuna parte (non c'è un campo sul backend, la domanda non
  // esiste nemmeno lì) — solo loggato, stesso limite mock di bulkReject in questions.ts.
  const discard = (id: string, reason?: string) => {
    updateDraft(id, { status: 'scartata' });
    // Stessa richiusura automatica di "Approva" (vedi approveDraft): decisione presa,
    // non serve tenerla aperta — e stesso ancoraggio dello scroll sulla riga, non sulle
    // righe che le stavano dietro.
    setOpenRowIds((prev) => prev.filter((x) => x !== id));
    setLastAutoClosedId(id);
    if (reason) console.info('[scarta] motivo:', reason, 'domanda:', id);
    toast.success('Domanda scartata.');
  };

  const requestDiscard = (id: string) => {
    setDiscardReason('');
    setDiscardCustomText('');
    setPendingDiscard({ kind: 'single', id });
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
    type: draft.type,
    difficulty: draft.difficulty,
    questionText: draft.text,
    // Il backend reale non ha un campo dedicato per la fonte della "Correzione
    // commentata" — la accodiamo al campo esplicativo esistente invece di inventare un
    // campo che il backend vero non saprebbe salvare (additionalProperties: false).
    explanationText: `${draft.explanation}\n\n${formatSource(draft.source)}`,
    alternatives:
      draft.type === 'MULTIPLE_CHOICE'
        ? draft.alternatives.map((text, i) => ({
            id: crypto.randomUUID(),
            text,
            isCorrect: i === draft.correctIndex,
            order: i,
          }))
        : [],
    completionAnswer: draft.type === 'MULTIPLE_CHOICE' ? '' : draft.completionAnswer,
    language: 'IT-it',
  });

  // Da qui in giù, due famiglie di funzioni completamente separate — mai condivise tra
  // Caso A e Caso B, per costruzione: ognuna produce solo lo stato che le compete
  // (approvata / in_revisione) tramite il proprio percorso di persistenza
  // (persistAndApprove / persistAndSubmit). Quale famiglia viene davvero chiamata dai
  // bottoni dipende da isReviewerSelf nel JSX più sotto, non da un branch nascosto qui.

  /** Caso A (isReviewerSelf): crea la domanda per davvero e la approva subito — mai
   *  'in_revisione', il revisore è già chi sta generando, non serve passare dalla coda
   *  "Domande da revisionare". */
  const persistAndApprove = async (draft: DraftQuestion): Promise<string> => {
    const created = await questionsService.create(client, buildCreatePayload(draft));
    recordGeneratedQuestion(created.id, generationId);
    await questionsService.approve(client, created.id);
    return created.id;
  };

  /** Caso B (altro revisore): crea la domanda e la manda in revisione a reviewerId — mai
   *  approvata da qui, solo da chi la riceve. */
  const persistAndSubmit = async (draft: DraftQuestion): Promise<string> => {
    const created = await questionsService.create(client, buildCreatePayload(draft));
    recordGeneratedQuestion(created.id, generationId);
    if (reviewerId) {
      await questionsService.submit(client, created.id, reviewerId);
    }
    return created.id;
  };

  /** Nucleo condiviso da entrambi i casi per il bulk (singola riga inclusa, chiamata con un
   *  array di un elemento): persiste ogni target in parallelo con la funzione e lo stato di
   *  arrivo passati dal chiamante, aggiorna lo stato riga per riga in base all'esito. Ritorna
   *  il numero di fallimenti — non manda toast né tocca isPersisting a livello di pulsante,
   *  quello resta al chiamante. Il parametro esplicito (non un branch su isReviewerSelf qui
   *  dentro) è la garanzia che Caso A non possa mai produrre 'in_revisione' né Caso B
   *  'approvata'. */
  const persistTargets = async (
    targets: DraftQuestion[],
    persistFn: (draft: DraftQuestion) => Promise<string>,
    nextStatus: 'approvata' | 'in_revisione'
  ): Promise<number> => {
    if (targets.length === 0) return 0;
    setDrafts((prev) =>
      prev.map((d) => (targets.some((t) => t.id === d.id) ? { ...d, isPersisting: true } : d))
    );
    const outcomes = await Promise.allSettled(targets.map((d) => persistFn(d)));
    let failures = 0;
    setDrafts((prev) =>
      prev.map((d) => {
        const idx = targets.findIndex((t) => t.id === d.id);
        if (idx === -1) return d;
        const outcome = outcomes[idx];
        if (outcome.status === 'fulfilled') {
          return {
            ...d,
            status: nextStatus,
            persistedQuestionId: outcome.value,
            isPersisting: false,
          };
        }
        failures += 1;
        return { ...d, isPersisting: false };
      })
    );
    return failures;
  };

  // --- Caso A: Approva (riga singola / tutte / selezione) — mai una conferma, è solo un
  // passo del proprio flusso, non un invio a qualcun altro. ---

  const approveDraft = async (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft || draft.status !== 'pending') return;
    const failures = await persistTargets([draft], persistAndApprove, 'approvata');
    if (failures === 0) {
      // Approvata: niente più CTA al suo interno (vedi sotto), quindi non ha più senso
      // tenerla aperta — si richiude da sola come le altre righe già chiuse.
      setOpenRowIds((prev) => prev.filter((x) => x !== id));
      setLastAutoClosedId(id);
      toast.success('Domanda approvata.', {
        duration: 5000,
        className: REVIEW_SUCCESS_TOAST_CLASSNAME,
      });
    } else {
      toast.error("Errore durante l'approvazione. Riprova.");
    }
  };

  /** "Salva e Approva" di QuestionDraftEditContent — unico passo per editare e approvare una
   *  bozza, invece dei due di prima (chiudi l'editor, poi un secondo click su "Approva" nella
   *  riga): chi modifica qui è sempre chi approva (Caso A), i due gesti sono lo stesso giudizio.
   *  patchedDraft (non `draft` di stato) è quello che persistAndApprove usa per il payload di
   *  creazione — così la domanda creata riflette subito le modifiche appena fatte, senza dover
   *  aspettare che updateDraft aggiorni lo stato prima di leggerlo. onSaveAndApprove in
   *  QuestionDraftEditContent già mostra l'errore a video se failures > 0; qui serve solo il
   *  successo (toast + richiusura riga), stesso trattamento di approveDraft sopra. */
  const saveAndApproveDraft = async (
    id: string,
    patch: Partial<DraftQuestion>,
    wasModified: boolean
  ): Promise<boolean> => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft || draft.status !== 'pending') return false;
    const patchedDraft = { ...draft, ...patch };
    updateDraft(id, patch);
    const failures = await persistTargets([patchedDraft], persistAndApprove, 'approvata');
    if (failures > 0) {
      toast.error("Errore durante il salvataggio e l'approvazione. Riprova.");
      return false;
    }
    setOpenRowIds((prev) => prev.filter((x) => x !== id));
    setLastAutoClosedId(id);
    toast.success(wasModified ? 'Domanda modificata e approvata.' : 'Domanda approvata.', {
      duration: 5000,
      className: REVIEW_SUCCESS_TOAST_CLASSNAME,
    });
    return true;
  };

  /** CTA principale del footer per il Caso A. L'uscita automatica a esito riuscito non è
   *  gestita qui — vedi l'effect su daDecidere più sotto. */
  const approveAll = async () => {
    const targets = drafts.filter((d) => d.status === 'pending');
    if (targets.length === 0) return 0;
    setIsSendingAll(true);
    const failures = await persistTargets(targets, persistAndApprove, 'approvata');
    setIsSendingAll(false);
    if (failures > 0) {
      toast.error('Alcune domande non sono state approvate. Riprova.');
    } else {
      toast.success(
        targets.length === 1 ? 'Domanda approvata.' : `${targets.length} domande approvate.`,
        { duration: 5000, className: REVIEW_SUCCESS_TOAST_CLASSNAME }
      );
    }
    return failures;
  };

  const handleBulkApprove = async () => {
    const ids = bulk.selectedIds;
    const targets = drafts.filter((d) => ids.has(d.id) && d.status === 'pending');
    if (targets.length === 0) return;
    setIsBulkSending(true);
    const failures = await persistTargets(targets, persistAndApprove, 'approvata');
    setIsBulkSending(false);
    bulk.clearSelection();
    if (failures > 0) {
      toast.error('Alcune domande non sono state approvate. Riprova.');
    } else {
      toast.success(`${targets.length} domande approvate.`, {
        duration: 5000,
        className: REVIEW_SUCCESS_TOAST_CLASSNAME,
      });
    }
  };

  // Il Caso A non offre un terzo bottone "Approva tutte e esci" nel dialog di uscita — solo
  // "Rimani" / "Elimina le rimanenti" (vedi lo step 4 del brief e il dialog più sotto):
  // approveAll resta comunque richiamabile da lì per il bottone "Approva tutte" in alto,
  // che segue lo stesso auto-exit del Caso B quando daDecidere torna a 0 (vedi l'effect
  // più sotto), senza bisogno di un handler di uscita dedicato.

  // --- Caso B: Manda in revisione (riga singola / tutte / selezione) — sempre con conferma,
  // vedi pendingSend/confirmPendingSend più sotto. ---

  const sendToReview = async (id: string) => {
    const draft = drafts.find((d) => d.id === id);
    if (!draft || draft.status !== 'pending') return;
    const failures = await persistTargets([draft], persistAndSubmit, 'in_revisione');
    if (failures === 0) {
      toast.success(`Domanda mandata in revisione${recipientSuffix}.`, {
        duration: 5000,
        className: REVIEW_SUCCESS_TOAST_CLASSNAME,
      });
    } else {
      toast.error("Errore durante l'invio in revisione. Riprova.");
    }
  };

  /** Manda in revisione tutte le domande ancora "pending" (non le scartate). Ritorna il
   *  numero di invii falliti, così chi chiama può decidere se uscire subito dopo o no. */
  const sendAllToReview = async (): Promise<number> => {
    const targets = drafts.filter((d) => d.status === 'pending');
    if (targets.length === 0) return 0;
    setIsSendingAll(true);
    const failures = await persistTargets(targets, persistAndSubmit, 'in_revisione');
    setIsSendingAll(false);
    if (failures > 0) {
      toast.error('Alcune domande non sono state inviate in revisione. Riprova.');
    } else {
      toast.success(`Domande mandate in revisione${recipientSuffix}.`, {
        duration: 5000,
        className: REVIEW_SUCCESS_TOAST_CLASSNAME,
      });
    }
    return failures;
  };

  /** "Manda in revisione" della toolbar di selezione — stessa dinamica del singolo Manda in
   *  revisione per riga: solo lo scope cambia, dalla singola riga alla selezione corrente. */
  const handleBulkSendToReview = async () => {
    const ids = bulk.selectedIds;
    const targets = drafts.filter((d) => ids.has(d.id) && d.status === 'pending');
    if (targets.length === 0) return;
    setIsBulkSending(true);
    const failures = await persistTargets(targets, persistAndSubmit, 'in_revisione');
    setIsBulkSending(false);
    bulk.clearSelection();
    if (failures > 0) {
      toast.error('Alcune domande non sono state inviate in revisione. Riprova.');
    } else {
      toast.success(`Domande mandate in revisione${recipientSuffix}.`, {
        duration: 5000,
        className: REVIEW_SUCCESS_TOAST_CLASSNAME,
      });
    }
  };

  /** I tre entry point che mandano in revisione (riga, tutte, selezione) — solo Caso B,
   *  chiamati dal JSX solo quando !isReviewerSelf (vedi i bottoni più sotto): aprono sempre
   *  la modale di conferma, mai un invio diretto — mandare a qualcun altro merita sempre una
   *  conferma esplicita, a differenza di Approva (Caso A), che non la merita mai (vedi sopra). */
  const requestSendToReview = (id: string) => setPendingSend({ kind: 'single', id });
  const requestSendAllToReview = () => setPendingSend({ kind: 'all' });
  const requestBulkSendToReview = () => setPendingSend({ kind: 'selection' });

  const confirmPendingSend = async () => {
    if (!pendingSend) return;
    if (pendingSend.kind === 'single') {
      await sendToReview(pendingSend.id);
    } else if (pendingSend.kind === 'all') {
      await sendAllToReview();
    } else {
      await handleBulkSendToReview();
    }
    setPendingSend(null);
  };

  /** "Scarta" della toolbar di selezione — stessa dinamica del singolo Scarta per riga: apre
   *  la modale di motivazione invece di scartare subito (vedi pendingDiscard sopra). Gli id
   *  si fissano qui, al momento della richiesta — confirmDiscard non li ricalcola. */
  const requestBulkDiscard = () => {
    const ids = drafts
      .filter((d) => bulk.selectedIds.has(d.id) && d.status === 'pending')
      .map((d) => d.id);
    if (ids.length === 0) return;
    setDiscardReason('');
    setDiscardCustomText('');
    setPendingDiscard({ kind: 'selection', ids });
  };

  const confirmDiscard = () => {
    if (!pendingDiscard) return;
    const reason = isDiscardCustomReason ? discardCustomText.trim() : discardReason;
    if (pendingDiscard.kind === 'single') {
      discard(pendingDiscard.id, reason);
    } else {
      const { ids } = pendingDiscard;
      setDrafts((prev) => prev.map((d) => (ids.includes(d.id) ? { ...d, status: 'scartata' } : d)));
      console.info('[scarta] motivo:', reason, 'domande:', ids);
      toast.success(ids.length === 1 ? 'Domanda scartata.' : `${ids.length} domande scartate.`);
      bulk.clearSelection();
    }
    setPendingDiscard(null);
  };

  const handleExitClick = () => {
    if (daDecidere === 0) {
      onExit();
    } else {
      setConfirmExitOpen(true);
    }
  };

  // Solo le "pending" sono selezionabili/spuntabili — stesso criterio di Scarta/Manda in
  // revisione riga per riga.
  const selectablePendingIds = drafts.filter((d) => d.status === 'pending').map((d) => d.id);
  const allPendingSelected = bulk.isPageFullySelected(selectablePendingIds);
  const somePendingSelected = selectablePendingIds.some((id) => bulk.selectedIds.has(id));
  const selectAllState: boolean | 'indeterminate' =
    selectablePendingIds.length === 0
      ? false
      : allPendingSelected
        ? true
        : somePendingSelected
          ? 'indeterminate'
          : false;
  const handleToggleSelectAll = () => {
    if (allPendingSelected) {
      bulk.deselectPage(selectablePendingIds);
    } else {
      bulk.selectPage(selectablePendingIds);
    }
  };

  // approvate e inRevisione non compaiono mai insieme sullo stesso batch (Caso A produce
  // solo 'approvata', Caso B solo 'in_revisione', vedi DraftStatus) — sommarle entrambe in
  // daDecidere resta corretto in entrambi i casi, quella che non si applica è sempre 0.
  const approvate = drafts.filter((d) => d.status === 'approvata').length;
  const inRevisione = drafts.filter((d) => d.status === 'in_revisione').length;
  const scartate = drafts.filter((d) => d.status === 'scartata').length;
  const daDecidere = drafts.length - approvate - inRevisione - scartate;

  // "Da decidere" nel Caso A (approva/modifica+approva/scarta tocca a te), "Da mandare in
  // revisione" nel Caso B (STATUS_TAG_LABEL.pending, il default) — solo 'pending' cambia per
  // caso, gli altri stati (in_revisione/approvata/scartata) sono già esclusivi di un solo
  // caso ciascuno, non serve differenziarli ulteriormente qui.
  const statusLabel = (status: DraftStatus) =>
    status === 'pending' && isReviewerSelf ? 'Da decidere' : STATUS_TAG_LABEL[status];

  // Quanto sta per essere mandato — per il copy della modale di conferma (pendingSend, vedi
  // sopra). selectedCount di bulk conta solo pending (le uniche spuntabili, vedi la checkbox
  // riga per riga), quindi coincide già con quante ne manderà davvero handleBulkSendToReview.
  const pendingSendCount =
    pendingSend?.kind === 'single'
      ? 1
      : pendingSend?.kind === 'all'
        ? daDecidere
        : bulk.selectedCount;
  const isPendingSendInFlight =
    pendingSend?.kind === 'single'
      ? (drafts.find((d) => d.id === pendingSend.id)?.isPersisting ?? false)
      : pendingSend?.kind === 'all'
        ? isSendingAll
        : isBulkSending;

  // Bug: una volta decise tutte le domande (mandate in revisione o scartate, in qualunque
  // combinazione), la schermata restava aperta finché non si cliccava "Esci" a mano — solo
  // "Manda tutte in revisione" usciva da sola, perché aveva la sua uscita cablata dentro il
  // proprio handler. Con la selezione multipla ci sono molte più strade per arrivare a
  // "niente più da decidere" (scarta singolo, manda singolo, scarta bulk, manda bulk, in
  // qualunque mix) — un effect sul totale, non un handler alla volta, le copre tutte allo
  // stesso modo: appena non resta nulla da decidere, esce da sola dopo la stessa pausa breve
  // già usata per "Manda tutte in revisione" (tempo di leggere il toast di conferma).
  //
  // onExit in dipendenza e isClosingAfterSend (stato) come guardia dentro l'effect erano il
  // bug vero: onExit è una closure ricreata dal genitore ad ogni suo render, e
  // setIsClosingAfterSend(true) fa scattare subito un altro giro dell'effect — che, con
  // isClosingAfterSend tra le dipendenze, esegue la cleanup (clearTimeout) e ritorna subito
  // per la guardia, annullando il timer appena creato prima che i 1000ms passino: non usciva
  // mai, e nei casi peggiori (onExit che cambia ad ogni render) rientrava in loop abbastanza
  // in fretta da far esplodere React con "Maximum update depth exceeded". Un ref (non-stato,
  // non triggera l'effect) per "già partito" e la sempre-ultima onExit in un ref latch la
  // pianificazione a un solo giro reale, indipendente da quante volte l'effect si ripete.
  const exitStartedRef = useRef(false);
  const onExitRef = useRef(onExit);
  // Aggiornato in un effect, non durante il render: scrivere un ref lì è vietato (può
  // succedere prima che React abbia commesso l'albero) — qui basta che sia pronto al
  // prossimo giro, non nello stesso render in cui `onExit` cambia.
  useEffect(() => {
    onExitRef.current = onExit;
  }, [onExit]);
  useEffect(() => {
    if (daDecidere !== 0) {
      // Si può tornare indietro da "tutto deciso" con "Ripristina" — se succede prima che
      // l'uscita scatti, va ri-armata la prossima volta che si torna a zero.
      exitStartedRef.current = false;
      return;
    }
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;
    setIsClosingAfterSend(true);
    const timer = setTimeout(() => onExitRef.current(), 1000);
    return () => clearTimeout(timer);
  }, [daDecidere]);

  // Tre righe di tag distinte nell'header: composizione della domanda, opzioni
  // aggiuntive (nota + allegato) e revisore assegnato — ognuna a capo, solo se ha
  // almeno un valore.
  // Divise in due gruppi, separati da un divider "|" — riflette le due sezioni distinte
  // del form da cui provengono (Classificazione e Composizione).
  const classificationTags = [materiaName, argomentoName, sottoArgomentoName].filter(
    (v): v is string => !!v
  );
  // Due tag di riepilogo della griglia: uno per livello ("5 facili · 5 medie · 10
  // difficili", a prescindere dal tipo) e uno per tipo ("12 Risposta chiusa · 8
  // Completamento", a prescindere dal livello) — solo i valori > 0 compaiono in ciascuno.
  const bucketTotal = (bucket: keyof QuantityByDifficultyAndType) =>
    QUESTION_TYPES.reduce((sum, t) => sum + quantityByDifficultyAndType[bucket][t], 0);
  const typeTotal = (t: QuestionType) =>
    (Object.keys(quantityByDifficultyAndType) as (keyof QuantityByDifficultyAndType)[]).reduce(
      (sum, bucket) => sum + quantityByDifficultyAndType[bucket][t],
      0
    );
  const quantityBreakdownTag = [
    bucketTotal('facile') ? `${bucketTotal('facile')} facili` : null,
    bucketTotal('media') ? `${bucketTotal('media')} medie` : null,
    bucketTotal('difficile') ? `${bucketTotal('difficile')} difficili` : null,
  ]
    .filter((v): v is string => !!v)
    .join(' · ');
  const typeBreakdownTag = QUESTION_TYPES.filter((t) => typeTotal(t) > 0)
    .map((t) => `${typeTotal(t)} ${QUESTION_TYPE_LABELS[t]}`)
    .join(' · ');
  // Niente più un tag "X risposte": col numero di risposte per livello (non più un
  // unico valore per tutto il batch) non c'è un numero solo da riassumere qui — resta
  // visibile per riga, nella griglia di composizione.
  const compositionOnlyTags = [quantityBreakdownTag || null, typeBreakdownTag || null].filter(
    (v): v is string => !!v
  );
  const compositionTags = [...classificationTags, ...compositionOnlyTags];

  const additionalOptionsTags: { label: string; icon: LucideIcon }[] = [
    notesLabel ? { label: notesLabel, icon: FileText } : null,
    attachmentLabel ? { label: attachmentLabel, icon: Paperclip } : null,
  ].filter((v): v is { label: string; icon: LucideIcon } => v !== null);

  const hasHeaderTagRows =
    compositionTags.length > 0 || additionalOptionsTags.length > 0 || !!reviewerLabel;

  const passageDraft = drafts.find((d) => d.id === passageDraftId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* X sulla propria riga, in alto a sinistra — non accanto al titolo, come nel
          resto del backoffice. La badge "sola lettura" le sta accanto: è lo stato
          dell'intera pagina che si sta per chiudere, non un'etichetta del titolo.
          Solo Caso B: nel Caso A non è più vero, "Modifica" lo smentisce — vedi
          isReviewerSelf. */}
      <div className="flex shrink-0 flex-col gap-4 border-b bg-background px-8 py-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitClick}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
          {!isReviewerSelf && (
            <Badge variant="secondary" className="shrink-0">
              <Eye className="size-3" />
              Domande in sola lettura
            </Badge>
          )}
        </div>
        {/* items-stretch (default, non più items-start): le due colonne prendono la
            stessa altezza, così il recap a destra può ancorarsi in basso, in linea
            con l'ultima riga di tag a sinistra ("Assegnato a...") invece di stare
            incollato sotto la CTA. */}
        <div className="flex justify-between gap-4">
          <div className="flex flex-col">
            {/* "Create" da solo suona concluso — il cliente lo leggeva come "fatto" quando in
                realtà è a metà flusso: le domande esistono ma non sono ancora salvate.
                Titolo e sottotitolo nominano il passo che manca, non solo la CTA a destra.
                Caso A (isReviewerSelf): copy fornita dal brief corretto — il passo che
                manca è decidere, non "mandare" a qualcuno (non esiste un revisore esterno
                che "non le vede ancora"). Caso B: invariato. */}
            <h1 className="text-xl font-semibold">
              {drafts.length}{' '}
              {isReviewerSelf ? 'domande create' : 'Domande pronte per la revisione'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isReviewerSelf
                ? 'Non ancora salvate. Puoi approvare, modificare o scartare ogni domanda creata.'
                : 'Non ancora visibili al revisore. Mandale in revisione per completare la creazione delle domande.'}
            </p>
            {/* Prova: header sempre visibile, non si comprime più aprendo una domanda —
                per valutare quanto spazio reale resta alla revisione. */}
            {hasHeaderTagRows && (
              <div className="mt-4 flex flex-col gap-3.5">
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
            )}
          </div>
          {/* CTA principale spostata qui dal footer — "Esci" è sparita: la X in alto
              a sinistra basta per uscire, e "Manda tutte in revisione"/"Approva tutte"
              escono già da sole a esito riuscito (vedi l'effect su daDecidere più sotto).
              justify-between:
              CTA in cima, recap ancorato in fondo alla colonna — in linea con
              "Assegnato a...", l'ultima riga a sinistra. */}
          <div className="flex shrink-0 flex-col items-end justify-between gap-2">
            {bulk.isBulkMode ? (
              <div className="flex items-center gap-3">
                {/* Stesse caratteristiche della selezione in "Domande da revisionare":
                    checkbox "seleziona tutto" con indeterminate, chip sempre visibile (anche
                    a 0), Annulla selezione, poi le due azioni — disattivate finché non c'è
                    almeno una domanda selezionata. */}
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectAllState}
                    onCheckedChange={handleToggleSelectAll}
                    aria-label={t('myReviews.bulk.selectAllAction')}
                  />
                  <span className="text-sm text-muted-foreground">
                    {t('myReviews.bulk.selectAll', { count: selectablePendingIds.length })}
                  </span>
                </div>

                {/* min-w fisso + tabular-nums: senza, il numero di cifre (1 vs 2) cambia la
                    larghezza della chip ad ogni spunta e fa "ballare" Annulla
                    selezione/Scarta/Manda in revisione a destra. */}
                <Badge variant="secondary" className="min-w-28 tabular-nums">
                  {t('questions.bulk.selected', { count: bulk.selectedCount })}
                </Badge>

                <Button variant="ghost" size="sm" onClick={bulk.toggleBulkMode}>
                  {t('questions.bulk.cancelSelection')}
                </Button>

                {/* Stessa dinamica dei bottoni per riga: "Scarta" ghost + testo destructive
                    (apre la modale di motivazione, vedi requestBulkDiscard), poi Approva
                    (Caso A, verde pieno — stesso trattamento del vero "Approva" in
                    QuestionCreatePage) o Manda in revisione (Caso B, pieno ma neutro: qui non
                    si sta approvando nulla, solo mandando avanti nel flusso). */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  disabled={bulk.selectedCount === 0}
                  onClick={requestBulkDiscard}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  Scarta
                </Button>
                {isReviewerSelf ? (
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    disabled={bulk.selectedCount === 0 || isBulkSending}
                    onClick={handleBulkApprove}
                  >
                    {isBulkSending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Approva
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={bulk.selectedCount === 0 || isBulkSending}
                    onClick={requestBulkSendToReview}
                  >
                    {isBulkSending ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Manda in revisione
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Entrare in selezione multipla chiude le righe aperte — coi loro
                    // pulsanti "Scarta"/"Approva"/"Manda in revisione" per riga, altrimenti
                    // resterebbe ambiguo se un click va alla riga aperta sotto o alla selezione.
                    setOpenRowIds([]);
                    bulk.toggleBulkMode();
                  }}
                >
                  <ListChecks className="mr-1.5 h-4 w-4" />
                  {t('myReviews.bulk.toggle')}
                </Button>
                {isReviewerSelf ? (
                  <Button
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={approveAll}
                    disabled={isSendingAll || isClosingAfterSend}
                  >
                    {isSendingAll || isClosingAfterSend ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-1.5 h-4 w-4" />
                    )}
                    Approva tutte
                  </Button>
                ) : (
                  <Button
                    onClick={requestSendAllToReview}
                    disabled={isSendingAll || isClosingAfterSend}
                  >
                    {isSendingAll || isClosingAfterSend ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-1.5 h-4 w-4" />
                    )}
                    Manda tutte in revisione
                  </Button>
                )}
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {isReviewerSelf
                ? `${approvate} approvate · ${scartate} scartate · ${daDecidere} da decidere`
                : `${inRevisione} in revisione · ${scartate} scartate · ${daDecidere} da mandare in revisione`}
            </p>
          </div>
        </div>
      </div>

      {/* pb-4: senza più un footer a chiudere lo schermo, l'ultima riga arriverebbe
          a filo col bordo della viewport. */}
      <div ref={rowsListRef} className="flex-1 overflow-y-auto pb-4">
        {drafts.map((draft, index) => {
          const isOpen = openRowIds.includes(draft.id);
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
              {/* Sticky solo a domanda aperta: finché scorri il suo contenuto resta in
                  cima (z-10, sfondo opaco), finché non arrivi alla prossima domanda
                  aperta — che la spinge via naturalmente, essendo più giù nel flusso.
                  A riga chiusa niente sticky: non ha contenuto sotto da scorrere. */}
              <div
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                onClick={() => toggleRow(draft.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleRow(draft.id);
                  }
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-4 px-8 py-5 transition-colors',
                  !isOpen && 'hover:bg-accent/50',
                  isOpen && 'sticky top-0 z-10 bg-background'
                )}
              >
                {bulk.isBulkMode && (
                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {draft.status === 'pending' ? (
                      <Checkbox
                        checked={bulk.isSelected(draft.id)}
                        onCheckedChange={() => bulk.toggleItem(draft.id)}
                        aria-label={t('myReviews.bulk.selectAction', { index: index + 1 })}
                      />
                    ) : (
                      // Spacer: non selezionabile (già inviata o scartata), ma la riga resta
                      // allineata con quelle che hanno la checkbox.
                      <div className="h-4 w-4" />
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
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
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {/* Prova visibile del mix di difficoltà nel batch (es. facili e difficili
                      nella stessa generazione) — grigio neutro, non uno stato come quello
                      accanto. */}
                  <Badge variant="outline" className={HEADER_TAG_CLASSNAME}>
                    {DIFFICULTY_LABELS[draft.difficulty]}
                  </Badge>
                  <Badge variant="outline" className={STATUS_TAG_CLASSNAME[draft.status]}>
                    {statusLabel(draft.status)}
                  </Badge>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </div>
              </div>

              {isOpen && (
                <div className="px-8 pt-1 pb-3">
                  {/* Niente più "Testo della domanda" qui dentro: è lo stesso testo
                      già in testa alla riga, appena sopra — ripeterlo nel box grigio
                      era ridondante. Il box comincia già dalle risposte. */}
                  <div className="space-y-5 rounded-lg bg-muted/50 p-5">
                    {draft.type === 'MULTIPLE_CHOICE' ? (
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
                        {draft.type === 'MULTIPLE_CHOICE'
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
                            <span className="font-semibold">Capitolo:</span> {draft.source.capitolo}
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

                  {/* Affiancati, non spezzati agli estremi del layout — un solo cluster di
                      azioni a destra. "Scarta" resta ghost + testo destructive, "Manda in
                      revisione" passa a outline: il pieno (variant="default") resta solo
                      su "Manda tutte in revisione" in alto a destra nell'header.
                      Niente più azioni una volta approvata (solo Caso A, l'unico stato che
                      arriva qui senza passare da 'scartata' — vedi isScartata sotto, che
                      resta com'era: "Scarta" e "Modifica"/"Approva" restano visibili ma
                      disabilitati quando scartata, con "Ripristina" per tornare indietro):
                      approvata è definitiva, non c'è nulla da scartare, modificare o
                      approvare di nuovo su una domanda già creata. */}
                  {draft.status !== 'approvata' && (
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={isPersisted || isScartata}
                        onClick={() => requestDiscard(draft.id)}
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
                      {/* Solo quando il revisore è sé stessi: se la revisione tocca comunque a
                          te, ha senso poter correggere la bozza direttamente qui invece di
                          mandarla in revisione così com'è e poi riaprirla da "Domande da
                          revisionare". Non ha senso per un altro revisore: non è lui/lei a
                          decidere cosa correggere in fase di generazione. Apre
                          QuestionDraftEditContent — vedi lì il perché non è lo stesso
                          componente di QuestionEditContent (la domanda non esiste ancora sul
                          backend). */}
                      {isReviewerSelf && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={draft.status !== 'pending'}
                          onClick={() => setEditingDraftId(draft.id)}
                        >
                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                          Modifica
                        </Button>
                      )}
                      {/* Approva (Caso A) e Manda in revisione (Caso B) non sono due varianti
                          dello stesso bottone: chiamano funzioni completamente separate
                          (approveDraft vs requestSendToReview, vedi sopra) — qui cambia solo
                          quale delle due il click invoca, in base a isReviewerSelf. Approva è
                          verde pieno, stesso trattamento del vero "Approva" in
                          QuestionCreatePage — Manda in revisione resta outline neutro come
                          prima: non sta approvando nulla, solo mandando avanti nel flusso. */}
                      {isReviewerSelf ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          disabled={draft.status !== 'pending' || draft.isPersisting}
                          onClick={() => approveDraft(draft.id)}
                        >
                          {draft.isPersisting ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Approva
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={draft.status !== 'pending' || draft.isPersisting}
                          onClick={() => requestSendToReview(draft.id)}
                        >
                          {draft.isPersisting ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Send className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Manda in revisione
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Si apre solo se restano domande "da decidere" — se sono già tutte decise (approvate/
          inviate o scartate), non c'è niente da perdere e "Esci" esce direttamente.
          Un solo dialog per entrambi i casi, non due varianti: in nessuno dei due le domande
          "da decidere" sono mai state persistite (Caso A passa da create+approve solo
          all'Approva, Caso B da create+submit solo al Manda in revisione), quindi "uscire
          perde tutto il non deciso" è vero in entrambi allo stesso modo — cambiano solo le
          parole per la parte già risolta (approvate vs in revisione). Niente più scorciatoia
          "manda tutte e esci" per il Caso B: un'uscita è un'uscita, non un invio di massa
          travestito da conferma — chi vuole mandarle tutte lo fa dalla toolbar, poi esce. */}
      <Dialog open={confirmExitOpen} onOpenChange={setConfirmExitOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Uscire dal riepilogo domande?</DialogTitle>
            <DialogDescription>
              <span className="mb-1.5 block font-semibold">
                {isReviewerSelf ? approvate : inRevisione}{' '}
                {isReviewerSelf ? 'approvate' : 'in revisione'} · {scartate} scartate · {daDecidere}{' '}
                ancora da decidere.
              </span>
              Se esci ora, le {daDecidere} domande non ancora{' '}
              {isReviewerSelf ? 'approvate' : 'mandate in revisione'} né scartate verranno
              eliminate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmExitOpen(false)}>
              Rimani
            </Button>
            <Button variant="destructive" onClick={onExit}>
              {/* Niente mr-1.5 sull'icona: il Button ha già gap-2 tra i figli (vedi
                  buttonVariants) — aggiungerlo sommava i due spazi, più largo del gap-2 usato
                  da sola altrove (es. "Salva e Approva" in QuestionDraftEditContent). */}
              <Trash2 className="h-4 w-4" />
              Elimina le rimanenti
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Il testo citato varia per domanda (draft.passage) — stessa fonte già mostrata
          nelle tre righe sopra, qui nel formato compatto della citazione. */}
      <Dialog open={!!passageDraftId} onOpenChange={(next) => !next && setPassageDraftId(null)}>
        <DialogContent className="max-w-lg">
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

      {/* Solo Caso B: requestSendToReview/requestSendAllToReview/requestBulkSendToReview sono
          chiamate dal JSX solo quando !isReviewerSelf (vedi i bottoni sopra) — il Caso A non
          apre mai questa modale, approveDraft/approveAll/handleBulkApprove agiscono diretti.
          Mandare domande al proprio giro di revisione non ha bisogno di ribadire a chi
          vanno, mandarle a qualcun altro sì. Stessa modale per tutti e tre gli entry point:
          cambia solo il conteggio (pendingSendCount) e quale funzione la conferma esegue
          davvero (confirmPendingSend). */}
      <Dialog open={!!pendingSend} onOpenChange={(next) => !next && setPendingSend(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Confermi l'invio in revisione?</DialogTitle>
            {/* asChild: DialogDescription è di norma un <p>, qui serve un <div> per andare a
                capo tra la frase e il tag del revisore (flex-col, non più flex-wrap in riga).
                Stesso stile di badge (HEADER_TAG_CLASSNAME) già usato in "Gestisci revisione"
                nell'header, ma solo col nome — niente prefisso "Assegnato a" (la frase sopra
                introduce già il destinatario) e niente icona (che nell'header serve a
                introdurre la riga da sola, qui il testo la introduce già). */}
            <DialogDescription asChild>
              <div className="flex flex-col items-start gap-2.5">
                <span className="font-semibold">
                  {pendingSendCount === 1
                    ? 'La domanda verrà mandata in revisione e assegnata a:'
                    : `Le ${pendingSendCount} domande verranno mandate in revisione e assegnate a:`}
                </span>
                <Badge variant="outline" className={cn(HEADER_TAG_CLASSNAME, 'font-semibold')}>
                  {reviewerDisplayName}
                </Badge>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingSend(null)}
              disabled={isPendingSendInFlight}
            >
              Annulla
            </Button>
            <Button onClick={confirmPendingSend} disabled={isPendingSendInFlight}>
              {isPendingSendInFlight ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              {pendingSend?.kind === 'all' ? 'Manda tutte in revisione' : 'Manda in revisione'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stessa lista motivi/stessa UX del rigetto vero (QuestionEditContent, Select +
          "Altro" con testo libero — vedi @/lib/rejectReasons), riusata qui anche se la
          domanda non è mai stata creata per davvero: non c'è nessuno a cui la spiegazione è
          dovuta, ma è comunque un segnale utile su cosa non ha funzionato nella
          generazione — per questo la copy sotto parla di "migliorare", non di "motivare a
          qualcuno". Un solo dialog per riga singola e selezione (vedi pendingDiscard
          sopra), come pendingSend. */}
      <Dialog open={!!pendingDiscard} onOpenChange={(next) => !next && setPendingDiscard(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              {pendingDiscard?.kind === 'selection' && pendingDiscard.ids.length > 1
                ? `Scarta ${pendingDiscard.ids.length} domande`
                : 'Scarta domanda'}
            </DialogTitle>
            <DialogDescription>
              Seleziona il motivo: ci aiuta a capire come migliorare la creazione delle domande.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            <Label htmlFor="discard-reason">Motivazione</Label>
            <Select value={discardReason} onValueChange={setDiscardReason}>
              <SelectTrigger id="discard-reason">
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

            {isDiscardCustomReason && (
              <div className="flex flex-col gap-1.5">
                <Input
                  value={discardCustomText}
                  onChange={(e) =>
                    setDiscardCustomText(e.target.value.slice(0, REJECT_CUSTOM_TEXT_MAX))
                  }
                  placeholder="Descrivi brevemente il motivo"
                  maxLength={REJECT_CUSTOM_TEXT_MAX}
                />
                <p
                  className={cn(
                    'text-right text-xs text-muted-foreground',
                    discardCustomText.length >= REJECT_CUSTOM_TEXT_MAX && 'text-destructive'
                  )}
                >
                  {discardCustomText.length}/{REJECT_CUSTOM_TEXT_MAX}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDiscard(null)}>
              Annulla
            </Button>
            <Button variant="destructive" onClick={confirmDiscard} disabled={!canConfirmDiscard}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Scarta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CTA "Modifica" per riga (solo isReviewerSelf, vedi sopra) — z-[60], sopra lo z-50
          di questo step: si sovrappone, non lo sostituisce, così chiuderla torna esattamente
          al riepilogo così com'era. onSaveAndApprove persiste per davvero (create+approve,
          vedi saveAndApproveDraft sopra) — "Salva e Approva" lì chiude l'editor da sé a esito
          riuscito (onClose o, se c'era una modifica, dopo il motivo facoltativo), quindi qui
          non serve chiudere anche da fuori. */}
      {editingDraftId && (
        <QuestionDraftEditContent
          draft={drafts.find((d) => d.id === editingDraftId)!}
          materiaName={materiaName}
          argomentoName={argomentoName}
          sottoArgomentoName={sottoArgomentoName}
          subjectId={subjectId}
          topicId={topicId}
          sottoArgomentoId={sottoArgomentoId}
          onClose={() => setEditingDraftId(null)}
          onSaveAndApprove={(patch, wasModified) =>
            saveAndApproveDraft(editingDraftId, patch, wasModified)
          }
        />
      )}
    </div>
  );
}
