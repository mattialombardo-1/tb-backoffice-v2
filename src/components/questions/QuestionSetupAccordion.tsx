import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, type LucideIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { cn, slugify } from '@/lib/utils';
import { useCapabilities } from '@/lib/auth';
import { useReviewerList } from '@/lib/hooks/useReviewerList';
import {
  MateriaField,
  ArgomentoField,
  SottoArgomentoField,
  type FixedMateriaOption,
} from './HierarchySelector';
import { QuestionGenerationStep } from './QuestionGenerationStep';
import type { useHierarchy } from '@/lib/hooks/useHierarchy';
import { QUESTION_TYPE_LABELS, type QuestionType } from '@/lib/types/questions';

type HierarchyState = ReturnType<typeof useHierarchy>;

/**
 * Titolo del gruppo, visibile anche a sezione chiusa. Il riepilogo di cosa è
 * stato scelto dentro non vive più qui — è una riga di tag cliccabili resa a
 * parte, fuori dal bottone dell'AccordionTrigger (vedi FieldTags): così ogni
 * tag può avere il proprio hover e il proprio click senza annidare bottoni
 * dentro il bottone del trigger.
 */
function GroupTrigger({
  title,
  stepNumber,
  done,
  description,
  badge,
}: {
  title: string;
  /** Posizione dello step (1-3) — mostrato nel cerchio al posto della vecchia
   *  icona decorativa: comunica "step N" meglio di un'icona di categoria. */
  stepNumber: number;
  /** Step già compilato — cerchio pieno; outline altrimenti. Ogni sezione è
   *  sempre apribile in qualunque ordine, "done" è solo un riepilogo visivo. */
  done: boolean;
  description?: string;
  /** Marcatore accanto al titolo, mostrato solo a sezione chiusa (i chiamanti lo
   *  passano già condizionato su `openSection`) — l'asterisco rosso di obbligatorio
   *  o "(facoltativo)" in corsivo. */
  badge?: ReactNode;
}) {
  return (
    <span className="block">
      <span className="flex items-center gap-2.5">
        {/* Stesso trattamento "numero dentro un cerchio" dello StepIndicator in
            QuestionsAddToCollectionDialog.tsx: pieno quando lo step è già
            completato, outline colorato altrimenti. */}
        <span
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
            done
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-primary text-primary'
          )}
        >
          {stepNumber}
        </span>
        {/* Titolo sempre in text-foreground, anche a step chiuso — coerente col resto
            del backoffice, dove i titoli non si smorzano mai. */}
        <span className="text-base font-semibold text-foreground">
          {title}
          {badge}
        </span>
      </span>
      {description && (
        <span className="mt-2 ml-[34px] block text-sm leading-tight font-normal text-muted-foreground">
          {description}
        </span>
      )}
    </span>
  );
}

// Marcatori per GroupTrigger — passati solo a sezione chiusa (i chiamanti li
// condizionano su `openSection`, vedi sotto): a sezione aperta i singoli campi
// mostrano già il proprio asterisco/etichetta, ripeterlo sarebbe ridondante.
const REQUIRED_BADGE = <span className="ml-1 text-destructive">*</span>;

/** Una voce del riepilogo a sezione chiusa: testo + cosa succede al click. */
interface FieldTagItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}

// Grayscale, non l'accento blu: sono un riepilogo di cosa hai scelto, non uno
// stato semantico — un colore acceso avrebbe attirato lo sguardo più del form
// stesso e rischiato di essere letto come categoria (es. "chimica = blu?").
const FIELD_TAG_CLASSNAME =
  'cursor-pointer border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground';

// Wrapper della riga di tag, sibling dell'AccordionTrigger (non dentro: vedi
// FieldTags). -mt-4 annulla il padding-bottom del trigger (py-4, 16px) così
// resta solo il mt-2 di FieldTags (8px) — lo stesso spacing titolo↔sottotitolo
// usato quando lo step chiuso mostra la description invece dei tag (la
// description vive dentro il trigger, quindi non sconta quel padding).
const FIELD_TAGS_WRAPPER_CLASSNAME = '-mt-4 px-6 pb-4';

// Sfondo dell'header di ogni step — copre sia il trigger che, a step chiuso,
// la riga di tag sotto di esso: sono la stessa "zona header". Pieno solo sullo
// step aperto (il peso visivo resta lì); gli altri restano muted — un filo di
// sfondo all'hover basta a segnalare che l'intera riga è comunque cliccabile.
function accordionHeaderClassName(active: boolean) {
  return cn('transition-colors', active ? 'bg-muted/50' : 'hover:bg-muted/40');
}

/**
 * Riepilogo a sezione chiusa come riga di tag cliccabili — blu neutro, non lo
 * stesso verde/rosso/giallo usato per gli stati delle domande nel riepilogo
 * post-generazione (qui non è uno stato, è solo "cosa hai scelto"). Ogni tag è
 * un bottone vero (non annidato nel trigger dell'accordion): al click apre la
 * sezione e, quando ha senso, anche il menu a tendina di quel campo specifico.
 * Reso come sibling dell'AccordionTrigger, non al suo interno.
 */
function FieldTags({ items }: { items: FieldTagItem[] }) {
  return (
    <div className="mt-2 ml-[34px] flex flex-wrap gap-1.5">
      {items.map(({ label, icon: ItemIcon, onClick }) => (
        <Badge
          key={label}
          asChild
          variant="outline"
          className={cn('font-semibold', FIELD_TAG_CLASSNAME)}
        >
          <button type="button" onClick={onClick}>
            {ItemIcon && <ItemIcon className="size-3" />}
            {label}
          </button>
        </Badge>
      ))}
    </div>
  );
}

// Stesso copy di TYPE_DESCRIPTIONS in QuestionTypeSelector.tsx — duplicato, non importato:
// esportarlo da lì farebbe fallire il lint di react-refresh (un file di componente può
// esportare solo componenti). Riga di aiuto sotto il toggle compatto di Tipo di domanda
// qui sotto, stesso copy della card originale ma fuori dal bottone.
const TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Lo studente sceglie tra più alternative',
  COMPLETION: 'Lo studente scrive la risposta',
};

/** Un numero di risposte possibile; solo quelli `enabled` sono selezionabili. */
interface AnswerCountOption {
  count: string;
  enabled?: boolean;
}

// Tutte e quattro selezionabili: i template in questionBanks.ts hanno già 5
// alternative ciascuno (slice(0, answerCount) in QuestionGenerationStep), quindi
// 3 e 4 funzionano esattamente come 2 e 5 — nessun contenuto mancante da coprire
// prima. `enabled` resta nel tipo per un'eventuale futura variazione per materia.
const ANSWER_COUNT_OPTIONS: AnswerCountOption[] = [
  { count: '2', enabled: true },
  { count: '3', enabled: true },
  { count: '4', enabled: true },
  { count: '5', enabled: true },
];

/**
 * Quante alternative deve avere la domanda — visibile solo per "Risposta
 * chiusa". Nessuna preselezione: "2" e "5" sono le due opzioni abilitate
 * per Chimica, entrambe da scegliere esplicitamente.
 */
function AnswerCountField({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    // flex-1 su ogni pillola, non più size-9 fisso: il gruppo riempie tutta la
    // larghezza che il genitore gli lascia (vedi il flex-1 sul wrapper in
    // QuestionSetupAccordion) invece di restare 4 quadretti piccoli ammassati a
    // sinistra — i margini della card restano quelli che sono, cresce solo lo
    // spazio già assegnato a questa colonna.
    <RadioGroup value={value} onValueChange={onChange} disabled={disabled} className="flex gap-1.5">
      {ANSWER_COUNT_OPTIONS.map(({ count, enabled }) => (
        <label
          key={count}
          htmlFor={`answer-count-${count}`}
          className={cn(
            'flex h-9 flex-1 cursor-pointer items-center justify-center rounded-md border text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
            value === count ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50',
            !enabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
          )}
        >
          {/* Sui numeri il pallino è puro rumore — vedi QuestionTypeSelector
              per lo stesso trattamento (sr-only, non hidden). */}
          <RadioGroupItem
            value={count}
            id={`answer-count-${count}`}
            disabled={!enabled}
            className="sr-only"
          />
          {count}
        </label>
      ))}
    </RadioGroup>
  );
}

// Proposta di design: lista fissa per la sezione Materia — solo "Chimica" è
// selezionabile, le altre sono segnaposto in attesa di essere abilitate.
const MATERIA_OPTIONS: FixedMateriaOption[] = [
  { label: 'Chimica', enabled: true },
  { label: 'Biologia Semestre Filtro' },
  { label: 'Biologia' },
  { label: 'Fisica' },
  { label: 'Malattie Infettive e Microbiologia' },
];

// Proposta di design: lista fissa e ricercabile per la sezione Argomento —
// tutte selezionabili.
const ARGOMENTO_OPTIONS: string[] = [
  'La materia e le grandezze chimiche',
  "La struttura dell'atomo",
  'Tavola periodica e proprietà periodiche',
  'Legami chimici',
  'Nomenclatura e formule',
  'Reazioni e stechiometria',
  'Stati di aggregazione',
  'Soluzioni',
  'Termodinamica chimica',
  'Equilibrio chimico',
  'Acidi, basi e pH',
  'Ossidoriduzione ed elettrochimica',
  'Altro',
];

// Proposta di design: sottoargomenti fissi, filtrati per argomento scelto —
// solo quelli del gruppo pertinente sono mostrati, non l'elenco completo.
// "Altro" non compare nella mappa: nessun sottoargomento per quell'argomento.
const SOTTOARGOMENTO_OPTIONS: Record<string, string[]> = {
  'La materia e le grandezze chimiche': [
    'Stati della materia',
    'Sostanze pure e miscele',
    'Elementi e composti',
    'Grandezze intensive ed estensive',
    'Densità',
    'Unità SI',
    'Notazione scientifica',
    'Errori e cifre significative',
    'Trasformazioni fisiche e chimiche',
  ],
  "La struttura dell'atomo": [
    'Particelle subatomiche',
    'Numero atomico e di massa',
    'Isotopi',
    'Modelli atomici',
    'Numeri quantici',
    'Orbitali',
    'Configurazione elettronica',
    'Regola di Hund',
    'Ioni e configurazione',
  ],
  'Tavola periodica e proprietà periodiche': [
    'Gruppi e periodi',
    'Metalli e non metalli',
    'Raggio atomico',
    'Energia di ionizzazione',
    'Affinità elettronica',
    'Elettronegatività',
    'Numeri di ossidazione',
    'Gas nobili',
    'Metalli alcalini',
  ],
  'Legami chimici': [
    "Regola dell'ottetto",
    'Legame ionico',
    'Legame covalente',
    'Polarità del legame',
    'Formule di Lewis',
    'VSEPR',
    'Ibridazione',
    'Legame metallico',
    'Forze intermolecolari',
  ],
  'Nomenclatura e formule': [
    'Ossidi',
    'Anidridi',
    'Idrossidi',
    'Acidi binari',
    'Ossiacidi',
    'Sali neutri',
    'Sali acidi',
    "Sali d'ammonio",
    'Permanganati e dicromati',
  ],
  'Reazioni e stechiometria': [
    'Mole',
    'Numero di Avogadro',
    'Massa molare',
    'Unità di massa atomica',
    'Calcolo delle moli',
    'Numero di particelle',
    'Bilanciamento',
    'Reagente limitante',
    'Resa percentuale',
  ],
  'Stati di aggregazione': [
    'Teoria cinetica',
    'Legge di Boyle',
    'Legge di Charles',
    'Equazione di stato',
    'Volume molare',
    'Transizioni di fase',
    'Diagramma di fase',
    'Pressione di vapore',
    'Gas reali',
  ],
  Soluzioni: [
    'Soluto e solvente',
    'Solubilità',
    'Molarità',
    'Molalità',
    'Frazione molare',
    'Diluizioni',
    'Proprietà colligative',
    'Pressione osmotica',
    'Elettroliti',
  ],
  'Termodinamica chimica': [
    'Sistemi e funzioni di stato',
    'Primo principio',
    'Entalpia',
    'Legge di Hess',
    'Entropia',
    'Secondo principio',
    'Energia libera di Gibbs',
    'Energia di Helmholtz',
    'Spontaneità e temperatura',
  ],
  'Equilibrio chimico': [
    'Equilibrio dinamico',
    'Costante Kc',
    'Kp e Kc',
    'Quoziente di reazione',
    'Le Chatelier',
    'Effetto della temperatura',
    'Catalizzatori ed equilibrio',
    'Equilibri eterogenei',
    'Principio di Le Chatelier e inerti',
  ],
  'Acidi, basi e pH': [
    'Arrhenius',
    'Brønsted-Lowry',
    'Lewis',
    'pH',
    "Prodotto ionico dell'acqua",
    'Acidi forti e deboli',
    'Costante Ka',
    'Idrolisi',
    'Soluzioni tampone',
  ],
  'Ossidoriduzione ed elettrochimica': [
    'Ossidoriduzione',
    'Numero di ossidazione',
    'Bilanciamento ionico-elettronico',
    'Pila galvanica',
    'Potenziali standard',
    'Equazione di Nernst',
    'Elettrolisi',
    'Leggi di Faraday',
    'Serie dei potenziali',
  ],
};

/** Uno dei tre livelli — sostituisce il vecchio dropdown Difficoltà a valore
 *  unico per tutto il batch: ora ogni livello ha la propria quantità. */
type DifficultyBucket = 'facile' | 'media' | 'difficile';

// Proposta di design: solo questi tre — non più "Qualsiasi", "Medio-Facile" o
// "Medio-Difficile" del vecchio dropdown: con una quantità dedicata per livello
// non hanno più un posto ovvio (vedi design/decisioni).
const DIFFICULTY_BUCKETS: { key: DifficultyBucket; label: string }[] = [
  { key: 'facile', label: 'Facile' },
  { key: 'media', label: 'Media' },
  { key: 'difficile', label: 'Difficile' },
];

// Tetto sul totale del batch (somma dei tre livelli), non più sulla singola
// Quantità — stesso limite di prima, spalmato su tre input invece di uno.
const MAX_TOTAL_QUANTITY = 20;

// Proposta di design: "Risposta chiusa" è il caso più frequente in produzione — parte
// già selezionata invece di lasciare Tipo di domanda vuoto. Applicato solo alla prima
// apertura di "Composizione", non prima (vedi openedRef più sotto). Le quantità per
// livello invece partono sempre vuote: non c'è una ripartizione di default sensata da
// proporre, tocca sempre scegliere esplicitamente quante per livello.
const DEFAULT_TYPE: QuestionType = 'MULTIPLE_CHOICE';

// "L'altra" sezione a cui passare quando quella aperta si chiude da sola a
// tutti i campi compilati — non è un percorso bloccato (ogni sezione resta
// comunque sempre apribile a mano), è solo l'ordine "naturale" di lettura.
// L'ultima (gestisci-revisione) non ha un successivo: si chiude e basta.
const NEXT_SECTION: Record<string, string> = {
  classificazione: 'composizione',
  composizione: 'gestisci-revisione',
};

interface QuestionSetupAccordionProps {
  hierarchy: HierarchyState;
  disabled?: boolean;
  /** Obbligatorio per procedere — controllato da QuestionCreatePage insieme a Materia/Argomento. */
  type: QuestionType | '';
  onTypeChange: (value: QuestionType) => void;
  /** Sola andata: QuestionSetupAccordion possiede le tre quantità per livello (vedi
   *  `quantities` più sotto) e riporta solo il totale a QuestionCreatePage, che lo usa
   *  per "Crea Domanda" — non c'è un valore da ricevere indietro, la ripartizione non è
   *  ricostruibile da un totale singolo. */
  onQuantityChange: (value: string) => void;
  /** Obbligatorio per procedere quando type === 'MULTIPLE_CHOICE' (per
   *  'COMPLETION' il campo non esiste nemmeno, vedi sotto) — sola andata,
   *  stesso motivo di onQuantityChange: QuestionCreatePage lo usa solo per
   *  sapere se "Crea Domanda" può sbloccarsi. */
  onAnswerCountChange: (value: string) => void;
  /** Obbligatorio per procedere — risolto qui (te stesso o un altro revisore scelto),
   *  ma controllato da QuestionCreatePage insieme agli altri campi che sbloccano "Crea Domanda". */
  reviewerId: string | null;
  onReviewerIdChange: (value: string | null) => void;
  /** Modale di riepilogo post-generazione — aperta/chiusa da QuestionCreatePage. */
  summaryOpen: boolean;
  onExitSummary: () => void;
  /** Manuale scelto in AddQuestionDialog, se il flusso parte da lì — passato pari pari a
   *  QuestionGenerationStep, vedi manualeTitle lì. */
  manualeTitle?: string;
}

/**
 * Proposta di design, ispirata al layout della reference: ogni macro sezione
 * (Classificazione, Composizione, Gestisci revisione) è un unico accordion —
 * niente più un accordion per singolo campo. Una volta aperta una sezione, i
 * suoi campi sono tutti visibili insieme, affiancati a due colonne.
 * Le tre fisarmoniche condividono lo stesso stato (resta aperta una sola
 * sezione alla volta), ma ognuna è sempre apribile in qualunque ordine —
 * niente percorso bloccato: l'utente salta liberamente da una all'altra.
 */
export function QuestionSetupAccordion({
  hierarchy,
  disabled = false,
  type,
  onTypeChange,
  onQuantityChange,
  onAnswerCountChange,
  reviewerId,
  onReviewerIdChange,
  summaryOpen,
  onExitSummary,
  manualeTitle,
}: QuestionSetupAccordionProps) {
  // Primo step aperto di default all'atterraggio sul form — le altre due
  // restano comunque apribili subito, non c'è un ordine da rispettare.
  const [openSection, setOpenSection] = useState('classificazione');

  // Click fuori dalle card (sfondo della schermata) con una sezione aperta →
  // la richiude. Esclude i menu a tendina Radix (Select/Combobox), portati
  // fuori da questo div nel DOM: senza l'esclusione, scegliere un'opzione
  // chiuderebbe l'intera sezione invece di limitarsi a valorizzare il campo.
  const accordionsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openSection) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target;
      if (!(target instanceof Node)) return;
      if (accordionsRef.current?.contains(target)) return;
      if (target instanceof Element && target.closest('[data-radix-popper-content-wrapper]')) {
        return;
      }
      // Un bottone fuori dagli accordion (es. "Resetta form", "Crea Domanda") ha già il
      // proprio onClick — chiudere qui su pointerdown sposterebbe il layout PRIMA che
      // il click si risolva, "rubando" il click al bottone (l'evento click finale può
      // non colpire più l'elemento, spostato dal ridisegno). Lo lasciamo gestire da sé.
      if (target instanceof Element && target.closest('button')) {
        return;
      }
      setOpenSection('');
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [openSection]);

  // Quale campo (dentro la sezione appena aperta da un tag) deve aprire da sé
  // anche il proprio menu a tendina — null quando non c'è nessuna richiesta in
  // sospeso. Il campo stesso lo azzera chiamando onOpenChange(false) quando si
  // chiude, così non riapre a ogni render.
  const [autoOpenField, setAutoOpenField] = useState<string | null>(null);

  /** Click su un tag di riepilogo: apre la sezione e, se il campo è un menu a
   *  tendina (non un radio/testo libero), anche quel menu specifico. */
  const openFieldDropdown = (section: string, field: string | null) => {
    setOpenSection(section);
    setAutoOpenField(field);
  };

  // Le tre quantità per livello sostituiscono il vecchio dropdown Difficoltà (valore
  // unico per tutto il batch) + singola Quantità — partono da "0" (non più vuote):
  // sono stepper, non campi di testo, quindi mostrano sempre un numero esplicito fin
  // da subito, non c'è più uno stato "non ancora toccato" da distinguere da uno zero
  // esplicito. Il totale (somma dei tre) risale a QuestionCreatePage tramite
  // onQuantityChange, stesso canale di prima.
  const [quantities, setQuantities] = useState<Record<DifficultyBucket, string>>({
    facile: '0',
    media: '0',
    difficile: '0',
  });
  const totalQuantity = DIFFICULTY_BUCKETS.reduce(
    (sum, { key }) => sum + (Number(quantities[key]) || 0),
    0
  );

  /** Aggiorna la quantità di un livello — il totale complessivo resta sempre ≤
   *  MAX_TOTAL_QUANTITY: il valore digitato viene tagliato se sforerebbe il tetto,
   *  tenendo conto di quanto già impostato sugli altri due livelli. */
  const handleQuantityChange = (bucket: DifficultyBucket, raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 3);
    const otherTotal = DIFFICULTY_BUCKETS.filter(({ key }) => key !== bucket).reduce(
      (sum, { key }) => sum + (Number(quantities[key]) || 0),
      0
    );
    const next =
      digits === '' ? '' : String(Math.min(Number(digits), MAX_TOTAL_QUANTITY - otherTotal));
    const nextQuantities = { ...quantities, [bucket]: next };
    setQuantities(nextQuantities);
    const nextTotal = DIFFICULTY_BUCKETS.reduce(
      (sum, { key }) => sum + (Number(nextQuantities[key]) || 0),
      0
    );
    onQuantityChange(nextTotal > 0 ? String(nextTotal) : '');
  };

  /** Stepper +/- sopra handleQuantityChange: riusa lo stesso clamp (non si supera
   *  MAX_TOTAL_QUANTITY sul totale) e non si scende mai sotto 0. */
  const stepQuantity = (bucket: DifficultyBucket, delta: 1 | -1) => {
    const current = Number(quantities[bucket]) || 0;
    handleQuantityChange(bucket, String(Math.max(0, current + delta)));
  };

  // Numero di risposte per "Risposta chiusa" — nessun default: parte senza nulla
  // selezionato, tocca sempre scegliere esplicitamente tra le opzioni abilitate.
  const [answerCount, setAnswerCount] = useState('');
  const handleAnswerCountChange = (value: string) => {
    setAnswerCount(value);
    onAnswerCountChange(value);
  };

  // Chi revisiona le domande generate — di default "Assegna a me" (siamo nella
  // casistica di creazione con AI, la scelta più frequente), con possibilità di
  // sceglierne un altro. Parte vuoto, non già su "me": il default si applica solo
  // alla prima apertura di "Gestisci revisione" (vedi l'effect più sotto), non
  // appena atterrati sul form — altrimenti risulterebbe già scelto qualcosa che
  // l'utente non ha ancora visto. Il valore risolto (reviewerId) è controllato da
  // QuestionCreatePage insieme agli altri campi che sbloccano "Crea Domanda".
  const [reviewerChoice, setReviewerChoice] = useState<'me' | 'other' | ''>('');
  const [otherReviewerId, setOtherReviewerId] = useState<string | null>(null);
  const { me } = useCapabilities();
  const { reviewers, isLoading: isLoadingReviewers } = useReviewerList();
  const meId = me?.user._id ?? null;
  const meName = [me?.user.name, me?.user.surname].filter(Boolean).join(' ') || 'te';
  const currentUserEmail = me?.user.email;
  const reviewerOptions = reviewers
    .filter((r) => !currentUserEmail || r.email?.toLowerCase() !== currentUserEmail.toLowerCase())
    .map((r) => ({
      value: r._id,
      label: [r.name, r.surname].filter(Boolean).join(' ') + (r.email ? ` — ${r.email}` : ''),
    }));
  const selectedOtherReviewer = reviewers.find((r) => r._id === otherReviewerId);

  // meId arriva da useCapabilities in modo asincrono — è null al primo render e si
  // valorizza dopo. Finché la scelta resta "me" (default o esplicita), il revisore
  // risolto segue meId non appena è pronto, senza bisogno che l'utente tocchi nulla.
  useEffect(() => {
    if (reviewerChoice === 'me') {
      onReviewerIdChange(meId);
    }
  }, [reviewerChoice, meId, onReviewerIdChange]);

  const handleReviewerChoiceChange = (choice: 'me' | 'other') => {
    setReviewerChoice(choice);
    onReviewerIdChange(choice === 'me' ? meId : otherReviewerId);
  };

  const handleOtherReviewerChange = (id: string | null) => {
    setOtherReviewerId(id);
    onReviewerIdChange(id);
  };

  // Le proposte di default (Tipo/Quantità in Composizione, "Assegna a me" in
  // Gestisci revisione) si applicano solo alla prima apertura della sezione che
  // le contiene — mai prima, nemmeno se l'utente non la apre affatto: aprire il
  // form non deve già dare per scelto qualcosa che non ha ancora visto. openedRef
  // segna quali sezioni sono già state aperte almeno una volta, per applicare il
  // default una sola volta e non sovrascrivere una scelta fatta nel frattempo.
  const openedRef = useRef<Set<string>>(new Set(['classificazione']));
  useEffect(() => {
    if (!openSection || openedRef.current.has(openSection)) return;
    openedRef.current.add(openSection);

    if (openSection === 'composizione' && type === '') {
      onTypeChange(DEFAULT_TYPE);
    }
    if (openSection === 'gestisci-revisione' && reviewerChoice === '') {
      setReviewerChoice('me');
    }
  }, [openSection, type, onTypeChange, reviewerChoice]);

  const currentSubtopics = hierarchy.selection.topicName
    ? (SOTTOARGOMENTO_OPTIONS[hierarchy.selection.topicName] ?? [])
    : [];
  const sottoArgomentoLabel = currentSubtopics.find(
    (s) => `__fixed__${slugify(s)}` === hierarchy.selection.sottoArgomentoId
  );

  // "Tutti i campi" di una sezione, facoltativi compresi — criterio diverso da
  // quello che sblocca "Crea Domanda" (solo gli obbligatori, vedi canGenerate in
  // QuestionCreatePage): questo decide solo quando una sezione si chiude da sola
  // per passare all'altra. Sotto-argomento conta solo se l'argomento scelto ne
  // ha davvero (es. "Altro" non ne ha — vedi SOTTOARGOMENTO_OPTIONS): altrimenti
  // non c'è nessun campo in più da aspettare.
  const classificazioneAllFilled =
    hierarchy.selection.subjectId != null &&
    hierarchy.selection.topicId != null &&
    (currentSubtopics.length === 0 || hierarchy.selection.sottoArgomentoId != null);
  // Non serve più controllare che tutti e tre i livelli abbiano un valore "esplicito"
  // (prima: quantities[key] !== '', per distinguere un campo mai toccato da uno zero
  // voluto) — con gli stepper ogni livello è sempre un numero visibile fin dall'inizio
  // (parte da "0", vedi sopra), quindi basta il totale positivo.
  const composizioneAllFilled =
    totalQuantity > 0 && type !== '' && (type !== 'MULTIPLE_CHOICE' || answerCount !== '');

  // Chiude la sezione aperta e apre la prossima solo quando TUTTI i suoi campi sono
  // compilati (facoltativi compresi). autoAdvancedRef evita di richiuderla di nuovo
  // se l'utente la riapre solo per rivederla, magari già completa.
  // Solo classificazione e composizione, non gestisci-revisione: quella non ha un
  // NEXT_SECTION (è l'ultima), e reviewerChoice si autocompila da solo appena si apre
  // ("me", vedi l'effect sopra) — se contasse anche lei qui, la sezione risulterebbe
  // "compilata" nello stesso istante in cui si apre, e questo effect la richiuderebbe
  // subito (NEXT_SECTION[...] ?? '' = tutte le sezioni chiuse) prima ancora che
  // l'utente veda "Assegna a me" già scelto per lui.
  const autoAdvancedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!openSection || autoAdvancedRef.current.has(openSection)) return;
    const allFilled =
      openSection === 'classificazione'
        ? classificazioneAllFilled
        : openSection === 'composizione'
          ? composizioneAllFilled
          : false;
    if (!allFilled) return;
    autoAdvancedRef.current.add(openSection);
    setOpenSection(NEXT_SECTION[openSection] ?? '');
  }, [openSection, classificazioneAllFilled, composizioneAllFilled]);

  const classificazioneTagItems: FieldTagItem[] = [
    hierarchy.selection.subjectName
      ? {
          label: hierarchy.selection.subjectName,
          onClick: () => openFieldDropdown('classificazione', 'materia'),
        }
      : null,
    hierarchy.selection.topicName
      ? {
          label: hierarchy.selection.topicName,
          onClick: () => openFieldDropdown('classificazione', 'argomento'),
        }
      : null,
    sottoArgomentoLabel
      ? {
          label: sottoArgomentoLabel,
          onClick: () => openFieldDropdown('classificazione', 'sottoargomento'),
        }
      : null,
  ].filter((v): v is FieldTagItem => v !== null);

  // Un solo tag "5 facili · 5 medie · 10 difficili" al posto dei due separati (Difficoltà
  // + Quantità) che sostituisce: sono la stessa informazione, un batch ripartito per
  // livello, non due scelte indipendenti. Solo i livelli valorizzati compaiono.
  const quantityBreakdownLabel = DIFFICULTY_BUCKETS.filter(({ key }) => Number(quantities[key]) > 0)
    .map(({ key, label }) => `${quantities[key]} ${label.toLowerCase()}`)
    .join(' · ');

  const composizioneTagItems: FieldTagItem[] = [
    quantityBreakdownLabel
      ? { label: quantityBreakdownLabel, onClick: () => openFieldDropdown('composizione', null) }
      : null,
    type
      ? {
          label: QUESTION_TYPE_LABELS[type],
          onClick: () => openFieldDropdown('composizione', null),
        }
      : null,
    type === 'MULTIPLE_CHOICE'
      ? { label: `${answerCount} risposte`, onClick: () => openFieldDropdown('composizione', null) }
      : null,
  ].filter((v): v is FieldTagItem => v !== null);

  const gestisciRevisioneLabel =
    reviewerChoice === 'me'
      ? `Assegnato a te (${meName})`
      : reviewerChoice === 'other' && selectedOtherReviewer
        ? `Assegnato a ${[selectedOtherReviewer.name, selectedOtherReviewer.surname].filter(Boolean).join(' ')}`
        : '';
  const gestisciRevisioneTagItems: FieldTagItem[] = gestisciRevisioneLabel
    ? [
        {
          label: gestisciRevisioneLabel,
          onClick: () => openFieldDropdown('gestisci-revisione', null),
        },
      ]
    : [];

  return (
    <div ref={accordionsRef} className="space-y-8">
      {/* Un'unica card con accordion interni — non più una card per step: si
          recupera spazio verticale e il "filo logico" fra gli step è più
          leggibile. Ogni header ha sfondo bg-muted/50 (si vede a colpo
          d'occhio dov'è il bottone, non solo sulla freccia — l'intero header
          è l'AccordionTrigger, senza wrapper a larghezza fissa), il contenuto
          aperto sta sul background normale della card. */}
      <Card className="overflow-hidden py-0 shadow-md">
        <Accordion
          type="single"
          collapsible
          value={openSection}
          onValueChange={setOpenSection}
          className="w-full"
        >
          <AccordionItem value="classificazione">
            <div className={accordionHeaderClassName(openSection === 'classificazione')}>
              <AccordionTrigger className="rounded-none px-6 py-4 hover:no-underline">
                <GroupTrigger
                  title="Classificazione"
                  stepNumber={1}
                  done={hierarchy.isComplete}
                  badge={
                    openSection === 'classificazione' || hierarchy.isComplete
                      ? undefined
                      : REQUIRED_BADGE
                  }
                  description={
                    openSection === 'classificazione' || classificazioneTagItems.length > 0
                      ? undefined
                      : 'Materia, argomento e sottoargomento della domanda'
                  }
                />
              </AccordionTrigger>
              {openSection !== 'classificazione' && classificazioneTagItems.length > 0 && (
                <div className={FIELD_TAGS_WRAPPER_CLASSNAME}>
                  <FieldTags items={classificazioneTagItems} />
                </div>
              )}
            </div>
            <AccordionContent className="flex flex-col gap-3.5 px-6 pt-4 pb-5">
              <div className="grid grid-cols-2 gap-4">
                <MateriaField
                  hierarchy={hierarchy}
                  disabled={disabled}
                  fixedOptions={MATERIA_OPTIONS}
                  open={autoOpenField === 'materia' || undefined}
                  onOpenChange={(v) => {
                    if (!v) setAutoOpenField(null);
                  }}
                />
                <ArgomentoField
                  hierarchy={hierarchy}
                  disabled={disabled}
                  fixedOptions={ARGOMENTO_OPTIONS}
                  open={autoOpenField === 'argomento' || undefined}
                  onOpenChange={(v) => {
                    if (!v) setAutoOpenField(null);
                  }}
                />
                <div className="col-span-2">
                  <SottoArgomentoField
                    hierarchy={hierarchy}
                    disabled={disabled}
                    fixedOptionsByArgomento={SOTTOARGOMENTO_OPTIONS}
                    open={autoOpenField === 'sottoargomento' || undefined}
                    onOpenChange={(v) => {
                      if (!v) setAutoOpenField(null);
                    }}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="composizione">
            <div className={accordionHeaderClassName(openSection === 'composizione')}>
              <AccordionTrigger className="rounded-none px-6 py-4 hover:no-underline">
                <GroupTrigger
                  title="Composizione"
                  stepNumber={2}
                  // type/quantities partono vuoti e si valorizzano solo alla prima apertura
                  // di questa sezione (vedi openedRef) — quindi non sono mai "già validi"
                  // prima che l'utente l'abbia aperta almeno una volta.
                  done={type !== '' && totalQuantity > 0}
                  badge={
                    openSection === 'composizione' || (type !== '' && totalQuantity > 0)
                      ? undefined
                      : REQUIRED_BADGE
                  }
                  description={
                    openSection === 'composizione' || composizioneTagItems.length > 0
                      ? undefined
                      : 'Quantità per livello di difficoltà e tipo di risposte delle domande da creare'
                  }
                />
              </AccordionTrigger>
              {openSection !== 'composizione' && composizioneTagItems.length > 0 && (
                <div className={FIELD_TAGS_WRAPPER_CLASSNAME}>
                  <FieldTags items={composizioneTagItems} />
                </div>
              )}
            </div>
            <AccordionContent className="flex flex-col gap-5 px-6 pt-4 pb-5">
              {/* Due colonne affiancate, ciascuna con esattamente 3 righe allineate:
                  etichetta principale, poi UNA riga di controlli (non due: le etichette
                  Facile/Media/Difficile stavano sopra gli stepper in una riga propria,
                  che Tipo di domanda non aveva — i controlli veri partivano ad altezze
                  diverse. Ora sono in linea, dentro la stessa riga del controllo), poi una
                  riga di aiuto della stessa altezza (il totale a sinistra, il copy del
                  tipo scelto a destra — lo stesso di QuestionTypeSelector, TYPE_DESCRIPTIONS,
                  qui sotto invece che dentro la card). */}
              {/* flex-wrap come rete di sicurezza: a 1440px reale le due colonne stanno
                  comode affiancate, ma se la finestra è più stretta Tipo di domanda va a
                  capo sotto Quantità invece di tagliarsi contro il bordo della card. */}
              <div className="flex flex-wrap items-start gap-x-10 gap-y-5">
                <div className="flex flex-col gap-3">
                  <Label>
                    Quantità e Difficoltà Domande
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  {/* Stepper, non più input di testo — sostituisce il vecchio dropdown
                      Difficoltà (un valore unico per tutto il batch) + il singolo campo
                      Quantità: ora è la somma dei tre a fare da quantità totale. */}
                  <div className="flex gap-5">
                    {DIFFICULTY_BUCKETS.map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex w-fit items-center gap-1.5 rounded-md border pl-2.5"
                      >
                        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
                        {/* Meno/numero/più più vicini tra loro (gap-0.5, non più lo
                            stesso gap-1.5 dell'etichetta): sono un unico controllo, il
                            numero digitabile — vedi Input sotto — è anche il bersaglio
                            visivo dei due bottoni, non ha senso staccarlo quanto
                            l'etichetta è staccata dal gruppo. */}
                        <div className="flex items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={disabled || Number(quantities[key]) <= 0}
                            onClick={() => stepQuantity(key, -1)}
                            aria-label={`Riduci quantità ${label.toLowerCase()}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          {/* Digitabile, non più un <span> di sola lettura — riusa
                              handleQuantityChange (stesso clamp/parsing già validato per
                              gli stepper) invece di un handler nuovo. */}
                          <Input
                            value={quantities[key]}
                            onChange={(e) => handleQuantityChange(key, e.target.value)}
                            inputMode="numeric"
                            disabled={disabled}
                            aria-label={`Quantità ${label.toLowerCase()}`}
                            className="h-9 w-8 appearance-none border-none bg-transparent p-0 text-center text-sm tabular-nums shadow-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0"
                            disabled={disabled || totalQuantity >= MAX_TOTAL_QUANTITY}
                            onClick={() => stepQuantity(key, 1)}
                            aria-label={`Aumenta quantità ${label.toLowerCase()}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {totalQuantity} domande in totale · fino a {MAX_TOTAL_QUANTITY} per volta.
                  </p>
                </div>

                {/* Toggle compatto al posto di QuestionTypeSelector (le due card con
                    descrizione, usate invece nel resto dell'app — QuestionContentEditor,
                    flusso manuale — che non tocco): qui deve stare accanto a Quantità su
                    una riga sola, non sotto in un blocco alto. Stessi QUESTION_TYPE_LABELS
                    e TYPE_DESCRIPTIONS di QuestionTypeSelector — il copy non è sparito,
                    vive sotto come riga di aiuto invece che dentro ogni bottone. */}
                <div className="flex flex-col gap-3">
                  <Label>
                    Tipo di domanda
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={type}
                    onValueChange={(next) => next && onTypeChange(next as QuestionType)}
                    disabled={disabled}
                    className="justify-start gap-2"
                  >
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                      <ToggleGroupItem
                        key={t}
                        value={t}
                        className="h-9 shrink-0 px-3 text-sm font-normal whitespace-nowrap data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:font-medium"
                      >
                        {QUESTION_TYPE_LABELS[t]}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                  <p className="text-xs text-muted-foreground">
                    {type !== '' ? TYPE_DESCRIPTIONS[type] : ' '}
                  </p>
                </div>

                {/* Terza colonna della stessa riga, non più sotto: compare solo per
                    "Risposta chiusa" (type === MULTIPLE_CHOICE), quindi non c'è sempre —
                    ma quando c'è sta sulla stessa linea orizzontale di Quantità e Tipo di
                    domanda, non su una riga propria sotto. */}
                {type === 'MULTIPLE_CHOICE' && (
                  // flex-1 min-w-0: prende tutto lo spazio che resta sulla riga dopo
                  // Quantità e Tipo di domanda (che restano a larghezza naturale, w-fit) —
                  // i radio dentro si allargano di conseguenza (vedi AnswerCountField),
                  // senza sforare i margini della card: min-w-0 evita che il flex item si
                  // rifiuti di restringersi sotto il proprio contenuto quando lo spazio è
                  // poco, cosa che altrimenti lo spingerebbe fuori a capo prima del dovuto.
                  <div className="flex min-w-0 flex-1 flex-col gap-3">
                    <Label>
                      Numero di risposte
                      <span className="ml-0.5 text-destructive">*</span>
                    </Label>
                    <AnswerCountField
                      value={answerCount}
                      onChange={handleAnswerCountChange}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Obbligatorio come Materia/Argomento/Tipo/Quantità, ma precompilato su
              "Assegna a me" — "Crea Domanda" in fondo al form si abilita nello stesso
              momento in cui reviewerId è valorizzato, dato che dipende dallo stesso
              valore. */}
          <AccordionItem value="gestisci-revisione">
            <div className={accordionHeaderClassName(openSection === 'gestisci-revisione')}>
              <AccordionTrigger className="rounded-none px-6 py-4 hover:no-underline">
                <GroupTrigger
                  title="Gestisci revisione"
                  stepNumber={3}
                  done={reviewerId !== null}
                  badge={
                    openSection === 'gestisci-revisione' || gestisciRevisioneLabel
                      ? undefined
                      : REQUIRED_BADGE
                  }
                  description={
                    openSection === 'gestisci-revisione' || gestisciRevisioneTagItems.length > 0
                      ? undefined
                      : 'Chi riceve le domande quando vengono mandate in revisione'
                  }
                />
              </AccordionTrigger>
              {openSection !== 'gestisci-revisione' && gestisciRevisioneTagItems.length > 0 && (
                <div className={FIELD_TAGS_WRAPPER_CLASSNAME}>
                  <FieldTags items={gestisciRevisioneTagItems} />
                </div>
              )}
            </div>
            <AccordionContent className="flex flex-col gap-3.5 px-6 pt-4 pb-5">
              <div className="flex flex-col gap-3">
                <Label>
                  Chi revisiona queste domande?
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                <RadioGroup
                  value={reviewerChoice}
                  onValueChange={(v) => handleReviewerChoiceChange(v as 'me' | 'other')}
                  disabled={disabled}
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="reviewer-me"
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                      reviewerChoice === 'me'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent/50',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <RadioGroupItem value="me" id="reviewer-me" className="mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-sm leading-none font-medium">Assegna a me</p>
                      <p className="text-xs text-muted-foreground">
                        Le bozze inviate in revisione finiscono nella tua coda.
                      </p>
                    </div>
                  </label>
                  <label
                    htmlFor="reviewer-other"
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                      reviewerChoice === 'other'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-accent/50',
                      disabled && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <RadioGroupItem value="other" id="reviewer-other" className="mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-sm leading-none font-medium">
                        Assegna a un altro revisore
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Scegli chi dovrà revisionarle.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>

              {reviewerChoice === 'other' && (
                <div className="flex flex-col gap-3">
                  <Label htmlFor="reviewer-other-select">Revisore</Label>
                  {isLoadingReviewers ? (
                    <p className="text-sm text-muted-foreground">Caricamento revisori…</p>
                  ) : (
                    <SearchableCombobox
                      value={otherReviewerId}
                      onChange={handleOtherReviewerChange}
                      options={reviewerOptions}
                      placeholder="Seleziona revisore"
                      searchPlaceholder="Cerca revisore..."
                      emptyMessage="Nessun revisore trovato."
                      disabled={disabled}
                    />
                  )}
                </div>
              )}

              {gestisciRevisioneLabel && (
                <p className="text-xs text-muted-foreground">
                  Le domande mandate in revisione verranno assegnate{' '}
                  {reviewerChoice === 'me'
                    ? `a te (${meName})`
                    : `a ${[selectedOtherReviewer?.name, selectedOtherReviewer?.surname].filter(Boolean).join(' ')}`}
                  .
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {summaryOpen && (
        <QuestionGenerationStep
          onExit={onExitSummary}
          subjectId={hierarchy.selection.subjectId ?? ''}
          materiaName={hierarchy.selection.subjectName ?? undefined}
          topicId={hierarchy.selection.topicId ?? ''}
          argomentoName={hierarchy.selection.topicName ?? undefined}
          sottoArgomentoId={hierarchy.selection.sottoArgomentoId ?? ''}
          sottoArgomentoName={sottoArgomentoLabel}
          typeLabel={type ? QUESTION_TYPE_LABELS[type] : ''}
          isMultipleChoice={type === 'MULTIPLE_CHOICE'}
          quantityByDifficulty={{
            facile: Number(quantities.facile) || 0,
            media: Number(quantities.media) || 0,
            difficile: Number(quantities.difficile) || 0,
          }}
          answerCount={Number(answerCount) || 5}
          reviewerId={reviewerId}
          reviewerLabel={gestisciRevisioneLabel || undefined}
          manualeTitle={manualeTitle}
        />
      )}
    </div>
  );
}
