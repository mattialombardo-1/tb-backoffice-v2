import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react';
import { Minus, Plus, type LucideIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

// Le due colonne della griglia difficoltà × tipo, sempre nello stesso ordine di
// QUESTION_TYPE_LABELS — usato sia per la griglia che per i totali per tipo (vedi
// typeTotal/typeBreakdownLabel più sotto).
const QUESTION_TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

// Numero di risposte per le domande "Risposta chiusa" — non più un'unica scelta per
// tutto il batch (le 4 pillole di prima), ma uno stepper per riga della griglia: ogni
// livello di difficoltà ha il proprio numero di alternative. Range fisso, non legato a
// MAX_TOTAL_QUANTITY (quello limita quante domande, questo quante risposte ciascuna).
const ANSWER_COUNT_MIN = 2;
const ANSWER_COUNT_MAX = 5;
const ANSWER_COUNT_DEFAULT = '4';

/** Stepper compatto +/- riusato sia per la quantità di domande sia per il numero di
 *  risposte nella griglia di Composizione — min/maxDisabled arrivano già calcolati dal
 *  chiamante (range diversi: la quantità dipende dal totale del batch, il numero di
 *  risposte da ANSWER_COUNT_MIN/MAX fissi), lo stepper stesso non conosce il range. */
function NumberStepper({
  value,
  onChange,
  onStep,
  disabled = false,
  minDisabled,
  maxDisabled,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  onStep: (delta: 1 | -1) => void;
  disabled?: boolean;
  minDisabled: boolean;
  maxDisabled: boolean;
  ariaLabel: string;
}) {
  return (
    // Pillola arrotondata con sfondo (bg-muted) invece dei soli bottoni ghost affiancati —
    // reference fornita da Mattia: due cerchi pieni (variant="secondary" + rounded-full)
    // per meno/più, il numero in mezzo senza sfondo proprio. rounded-full (non rounded-2xl)
    // per angoli sempre pieni indipendentemente dall'altezza. Scala ridotta (h-6, p-1,
    // gap-1) rispetto al primo tentativo (h-8, p-2, gap-2): quella misura restava fedele
    // al reference isolato, ma dentro la griglia — tre per riga, tre righe — risultava
    // sproporzionata rispetto al resto della card.
    <div className="flex items-center gap-1 rounded-full bg-muted p-1">
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-6 w-6 shrink-0 rounded-full"
        disabled={disabled || minDisabled}
        onClick={() => onStep(-1)}
        aria-label={`Riduci ${ariaLabel}`}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        inputMode="numeric"
        disabled={disabled}
        aria-label={ariaLabel}
        className="h-6 w-5 appearance-none border-none bg-transparent p-0 text-center text-sm font-semibold text-foreground tabular-nums shadow-none focus-visible:ring-0"
      />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="h-6 w-6 shrink-0 rounded-full"
        disabled={disabled || maxDisabled}
        onClick={() => onStep(1)}
        aria-label={`Aumenta ${ariaLabel}`}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

// Stessa lista di manuali "pronti" del picker in AddQuestionDialog.tsx — duplicata, non
// importata: esportarla da lì farebbe fallire il lint di react-refresh (un file di
// componente può esportare solo componenti, stesso vincolo già documentato per
// TYPE_DESCRIPTIONS in QuestionTypeSelector.tsx).
const READY_MANUALE_TITLES = [
  'Chimica',
  'Dermatologia e Chirurgia plastica',
  'Endocrinologia',
  'Igiene e Medicina preventiva e Statistica sanitaria',
  "Malattie dell'apparato digerente",
  'Malattie infettive e tropicali',
  'Medicina Legale',
  'Neurologia e Neurochirurgia',
  'Oncologia',
  'Otorinolaringoiatria',
  'Psichiatria',
  'Reumatologia e Immunologia',
];

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

// Tetto sul totale del batch (somma di tutte le celle difficoltà × tipo), non più sulla
// singola Quantità — stesso limite di prima, spalmato sulla griglia invece che su tre
// input.
const MAX_TOTAL_QUANTITY = 20;

// Pavimento sul totale — un "gruppo" da una sola domanda non è un gruppo (vedi
// composizioneAllFilled più sotto e canGenerate in QuestionCreatePage, che la rispecchia):
// forzava useReviewBatches a scegliere tra farlo sparire in "Domande singole" o mostrare una
// card di gruppo con una domanda sola, nessuna delle due corretta per com'è nata.
const MIN_TOTAL_QUANTITY = 2;

// Disattivato su richiesta di Mattia (29/09/2026) per ENTRAMBE le transizioni: con la
// griglia di Composizione bastava valorizzare anche una sola cella per soddisfare
// composizioneAllFilled, chiudendo la sezione a metà interazione mentre si stava ancora
// confrontando quantità su più righe. Riattivato (02/10/2026) solo per Classificazione →
// Composizione: lì "tutti i campi compilati" è inequivocabile (Manuale, Materia, Argomento,
// Sotto-argomento se previsto — vedi classificazioneAllFilled), non un conteggio sommato
// cella per cella come in Composizione. Composizione → Gestisci revisione resta manuale:
// il problema che l'aveva fatta disattivare è ancora lì, non risolto da questa riattivazione
// parziale.

interface QuestionSetupAccordionProps {
  hierarchy: HierarchyState;
  disabled?: boolean;
  /** Sola andata: QuestionSetupAccordion possiede la griglia difficoltà × tipo (vedi
   *  `quantities` più sotto) e riporta solo il totale a QuestionCreatePage, che lo usa
   *  per "Crea Domanda" — non c'è un valore da ricevere indietro, la griglia non è
   *  ricostruibile da un totale singolo. */
  onQuantityChange: (value: string) => void;
  /** Obbligatorio per procedere — risolto qui (te stesso o un altro revisore scelto),
   *  ma controllato da QuestionCreatePage insieme agli altri campi che sbloccano "Crea Domanda". */
  reviewerId: string | null;
  onReviewerIdChange: (value: string | null) => void;
  /** Modale di riepilogo post-generazione — aperta/chiusa da QuestionCreatePage. */
  summaryOpen: boolean;
  onExitSummary: () => void;
  /** Obbligatorio — primo campo di Classificazione, Materia/Argomento/Sotto-argomento
   *  restano disabilitati finché non è scelto (vedi disabled su MateriaField più sotto,
   *  Argomento e Sotto-argomento si disabilitano da soli finché Materia non ha un
   *  valore). Risolto qui, ma controllato da QuestionCreatePage insieme agli altri
   *  campi che sbloccano "Crea Domanda" — stesso pattern di reviewerId sopra. */
  manualeTitle: string;
  onManualeTitleChange: (value: string) => void;
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
  onQuantityChange,
  reviewerId,
  onReviewerIdChange,
  summaryOpen,
  onExitSummary,
  manualeTitle,
  onManualeTitleChange,
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

  // Manuale — primo campo di Classificazione, a sinistra di Materia, ora obbligatorio
  // (manualeTitle/onManualeTitleChange sono prop, non più stato locale — vedi il
  // commento sulle props in cima al file). Non fa parte dell'hierarchy hook (i manuali
  // sono libri, non legati alla gerarchia Materia/Argomento, vedi il commento su
  // MANUALE_TITLES in AddQuestionDialog). READY_MANUALE_TITLES: stessa lista di manuali
  // "pronti" mostrata nel picker — un manuale scelto qui deve essere uno di quelli su
  // cui il sistema AI è già attivo.
  const manualeOptions = READY_MANUALE_TITLES.map((title) => ({
    value: `__fixed__${slugify(title)}`,
    label: title,
  }));
  const manualeValue = manualeTitle
    ? (manualeOptions.find((o) => o.label === manualeTitle)?.value ?? null)
    : null;

  // Griglia difficoltà × tipo — sostituisce le tre quantità per livello (un solo tipo
  // valido per l'intero batch): ora ogni cella (livello, tipo) ha la propria quantità,
  // così una batteria può mischiare "3 chiuse + 2 aperte" nella stessa difficoltà. Ogni
  // cella parte da "0" (non vuota): sono stepper, non campi di testo, quindi mostrano
  // sempre un numero esplicito fin da subito. Il totale (somma di tutte le celle) risale
  // a QuestionCreatePage tramite onQuantityChange, stesso canale di prima.
  const [quantities, setQuantities] = useState<
    Record<DifficultyBucket, Record<QuestionType, string>>
  >({
    facile: { MULTIPLE_CHOICE: '0', COMPLETION: '0' },
    media: { MULTIPLE_CHOICE: '0', COMPLETION: '0' },
    difficile: { MULTIPLE_CHOICE: '0', COMPLETION: '0' },
  });
  const bucketTotal = (bucket: DifficultyBucket) =>
    QUESTION_TYPES.reduce((sum, t) => sum + (Number(quantities[bucket][t]) || 0), 0);
  const typeTotal = (t: QuestionType) =>
    DIFFICULTY_BUCKETS.reduce((sum, { key }) => sum + (Number(quantities[key][t]) || 0), 0);
  const totalQuantity = DIFFICULTY_BUCKETS.reduce((sum, { key }) => sum + bucketTotal(key), 0);

  /** Aggiorna la quantità di una cella (livello, tipo) — il totale complessivo resta
   *  sempre ≤ MAX_TOTAL_QUANTITY: il valore digitato viene tagliato se sforerebbe il
   *  tetto, tenendo conto di quanto già impostato sulle altre celle. */
  const handleQuantityChange = (bucket: DifficultyBucket, qType: QuestionType, raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 3);
    const otherTotal = totalQuantity - (Number(quantities[bucket][qType]) || 0);
    const next =
      digits === '' ? '' : String(Math.min(Number(digits), MAX_TOTAL_QUANTITY - otherTotal));
    const nextQuantities = {
      ...quantities,
      [bucket]: { ...quantities[bucket], [qType]: next },
    };
    setQuantities(nextQuantities);
    const nextTotal = DIFFICULTY_BUCKETS.reduce(
      (sum, { key }) =>
        sum + QUESTION_TYPES.reduce((s, t) => s + (Number(nextQuantities[key][t]) || 0), 0),
      0
    );
    onQuantityChange(nextTotal > 0 ? String(nextTotal) : '');
  };

  /** Stepper +/- sopra handleQuantityChange: riusa lo stesso clamp (non si supera
   *  MAX_TOTAL_QUANTITY sul totale) e non si scende mai sotto 0. */
  const stepQuantity = (bucket: DifficultyBucket, qType: QuestionType, delta: 1 | -1) => {
    const current = Number(quantities[bucket][qType]) || 0;
    handleQuantityChange(bucket, qType, String(Math.max(0, current + delta)));
  };

  // Numero di risposte per "Risposta chiusa", uno per livello di difficoltà (non più
  // un'unica scelta per tutto il batch) — parte già da ANSWER_COUNT_DEFAULT ("4"), non
  // vuoto: è uno stepper con range fisso [2, 5], non c'è un valore "non ancora scelto"
  // da rappresentare, sempre un numero esplicito fin da subito (stesso trattamento
  // degli stepper di quantità). Non risale a QuestionCreatePage: a differenza del vecchio
  // campo unico, non blocca più "Crea Domanda" — un valore valido c'è sempre.
  const [answerCounts, setAnswerCounts] = useState<Record<DifficultyBucket, string>>({
    facile: ANSWER_COUNT_DEFAULT,
    media: ANSWER_COUNT_DEFAULT,
    difficile: ANSWER_COUNT_DEFAULT,
  });
  const handleAnswerCountChange = (bucket: DifficultyBucket, raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 1);
    const next =
      digits === ''
        ? ''
        : String(Math.min(Math.max(Number(digits), ANSWER_COUNT_MIN), ANSWER_COUNT_MAX));
    setAnswerCounts((prev) => ({ ...prev, [bucket]: next }));
  };
  const stepAnswerCount = (bucket: DifficultyBucket, delta: 1 | -1) => {
    const current = Number(answerCounts[bucket]) || ANSWER_COUNT_MIN;
    const next = Math.min(Math.max(current + delta, ANSWER_COUNT_MIN), ANSWER_COUNT_MAX);
    setAnswerCounts((prev) => ({ ...prev, [bucket]: String(next) }));
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

  // Le proposte di default ("Assegna a me" in Gestisci revisione) si applicano solo
  // alla prima apertura della sezione che le contiene — mai prima, nemmeno se
  // l'utente non la apre affatto: aprire il form non deve già dare per scelto
  // qualcosa che non ha ancora visto. openedRef segna quali sezioni sono già state
  // aperte almeno una volta, per applicare il default una sola volta e non
  // sovrascrivere una scelta fatta nel frattempo. Composizione non ha più un
  // default da applicare qui: con la griglia non c'è un "tipo" unico da
  // preselezionare, solo celle che partono già da un numero esplicito (0).
  const openedRef = useRef<Set<string>>(new Set(['classificazione']));
  useEffect(() => {
    if (!openSection || openedRef.current.has(openSection)) return;
    openedRef.current.add(openSection);

    if (openSection === 'gestisci-revisione' && reviewerChoice === '') {
      setReviewerChoice('me');
    }
  }, [openSection, reviewerChoice]);

  const currentSubtopics = hierarchy.selection.topicName
    ? (SOTTOARGOMENTO_OPTIONS[hierarchy.selection.topicName] ?? [])
    : [];
  const sottoArgomentoLabel = currentSubtopics.find(
    (s) => `__fixed__${slugify(s)}` === hierarchy.selection.sottoArgomentoId
  );

  // Tutti i campi di Classificazione, ora tutti obbligatori — Manuale compreso (prima
  // era l'unico facoltativo, da cui il vecchio commento su "criterio diverso da quello
  // che sblocca Crea Domanda": non vale più, sono la stessa cosa). Sotto-argomento conta
  // solo se l'argomento scelto ne ha davvero (es. "Altro" non ne ha — vedi
  // SOTTOARGOMENTO_OPTIONS): altrimenti non c'è nessun campo in più da aspettare.
  const classificazioneAllFilled =
    manualeTitle !== '' &&
    hierarchy.selection.subjectId != null &&
    hierarchy.selection.topicId != null &&
    (currentSubtopics.length === 0 || hierarchy.selection.sottoArgomentoId != null);
  // Non serve più controllare che ogni cella abbia un valore "esplicito" (prima:
  // quantities[key] !== '', per distinguere un campo mai toccato da uno zero voluto) —
  // con gli stepper ogni cella è sempre un numero visibile fin dall'inizio (parte da
  // "0", vedi sopra). Niente più controllo sul numero di risposte: anche quello è ormai
  // uno stepper con un default sempre valido (4), non un campo che può restare "non
  // ancora scelto". Il totale deve però raggiungere MIN_TOTAL_QUANTITY, non bastare che
  // sia positivo: un gruppo da 1 sola domanda non è un gruppo (vedi il commento lì).
  const composizioneAllFilled = totalQuantity >= MIN_TOTAL_QUANTITY;

  // Chiude Classificazione e apre Composizione da sola, appena i suoi campi sono tutti
  // compilati — vedi il commento sopra MIN_TOTAL_QUANTITY per perché solo questa
  // transizione, non anche Composizione → Gestisci revisione. Un ref booleano semplice
  // (non più un Set di sezioni, inutile ora che ce n'è una sola da guardare): scatta una
  // sola volta per apertura di questo step — se l'utente torna indietro a correggere
  // qualcosa in Classificazione dopo essere avanzato, non si richiude di scatto sotto di
  // lui alla prossima modifica.
  const classificazioneAutoAdvancedRef = useRef(false);
  useEffect(() => {
    if (classificazioneAutoAdvancedRef.current) return;
    if (openSection !== 'classificazione' || !classificazioneAllFilled) return;
    classificazioneAutoAdvancedRef.current = true;
    setOpenSection('composizione');
  }, [openSection, classificazioneAllFilled]);

  const classificazioneTagItems: FieldTagItem[] = [
    manualeTitle
      ? {
          label: manualeTitle,
          onClick: () => openFieldDropdown('classificazione', 'manuale'),
        }
      : null,
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

  // Un tag "5 facili · 5 medie · 10 difficili" (totale per livello, a prescindere dal
  // tipo) e uno "12 Risposta chiusa · 8 Completamento" (totale per tipo, a prescindere
  // dal livello) — due riepiloghi della stessa griglia, non due scelte indipendenti.
  // Solo i valori > 0 compaiono in ciascuno.
  const quantityBreakdownLabel = DIFFICULTY_BUCKETS.filter(({ key }) => bucketTotal(key) > 0)
    .map(({ key, label }) => `${bucketTotal(key)} ${label.toLowerCase()}`)
    .join(' · ');
  const typeBreakdownLabel = QUESTION_TYPES.filter((t) => typeTotal(t) > 0)
    .map((t) => `${typeTotal(t)} ${QUESTION_TYPE_LABELS[t].toLowerCase()}`)
    .join(' · ');

  // Niente più un terzo tag "X risposte": col numero di risposte ormai per livello
  // (vedi answerCounts sopra) non c'è più un valore unico da riassumere in un tag solo
  // — quelli restano visibili nella griglia stessa, a sezione aperta.
  const composizioneTagItems: FieldTagItem[] = [
    quantityBreakdownLabel
      ? { label: quantityBreakdownLabel, onClick: () => openFieldDropdown('composizione', null) }
      : null,
    typeBreakdownLabel
      ? { label: typeBreakdownLabel, onClick: () => openFieldDropdown('composizione', null) }
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
          aperto sta sul background normale della card.
          Larghezza fissa esplicita (w-[600px]), non w-fit: w-fit sembrava la scelta
          giusta per evitare di reinseguire un max-w a mano, ma calcola la larghezza
          intrinseca su TUTTE le sezioni insieme, non solo su quella aperta — in un
          contenitore a larghezza intrinseca un flex-wrap (la riga di tag di
          Classificazione/Gestisci revisione a sezione chiusa) viene misurato come se
          la riga fosse infinita, quindi non va mai a capo lì: bastava un
          materia+argomento+sottoargomento lunghi per allargare la card intera.
          600px è la larghezza naturale della griglia di Composizione (~530px) più il
          padding della card — il contenuto (tag, valori dei combobox, ecc.) va a capo
          o si stringe dentro questa larghezza, la card non cresce mai per inseguirlo. */}
      <Card className="w-[600px] overflow-hidden py-0 shadow-md">
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
                  done={classificazioneAllFilled}
                  badge={
                    openSection === 'classificazione' || classificazioneAllFilled
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
            <AccordionContent className="flex flex-col gap-3 px-6 pt-4 pb-5">
              {/* Ordine richiesto: Manuale e Materia sulla prima riga, Argomento e
                  Sottoargomento sulla seconda — l'auto-flow del grid a 2 colonne fa il resto,
                  non serve più il col-span-2 che prima dava a Sotto-argomento una riga tutta
                  sua. */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <Label>
                    Manuale
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <SearchableCombobox
                    value={manualeValue}
                    onChange={(v) => {
                      onManualeTitleChange(
                        v ? (manualeOptions.find((o) => o.value === v)?.label ?? '') : ''
                      );
                    }}
                    options={manualeOptions}
                    placeholder="Seleziona manuale"
                    searchPlaceholder="Cerca manuale..."
                    emptyMessage="Nessun manuale trovato."
                    disabled={disabled}
                    open={autoOpenField === 'manuale' || undefined}
                    onOpenChange={(v) => {
                      if (!v) setAutoOpenField(null);
                    }}
                  />
                </div>
                {/* Materia (e a cascata Argomento/Sotto-argomento, che si disabilitano da
                    soli finché rispettivamente Materia/Argomento non hanno un valore — vedi
                    HierarchySelector) restano bloccati finché non c'è un Manuale: è il primo
                    campo da compilare, non uno dei tanti. */}
                <MateriaField
                  hierarchy={hierarchy}
                  disabled={disabled || !manualeTitle}
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
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="composizione">
            <div className={accordionHeaderClassName(openSection === 'composizione')}>
              <AccordionTrigger className="rounded-none px-6 py-4 hover:no-underline">
                <GroupTrigger
                  title="Composizione"
                  stepNumber={2}
                  done={composizioneAllFilled}
                  badge={
                    openSection === 'composizione' || composizioneAllFilled
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
            <AccordionContent className="flex flex-col gap-3 px-6 pt-4 pb-5">
              <div className="flex flex-col gap-3">
                <Label>
                  Quantità di domande per difficoltà e tipo
                  <span className="ml-0.5 text-destructive">*</span>
                </Label>
                {/* Griglia difficoltà (righe) × 3 colonne fisse: quantità "Risposta chiusa",
                    numero di risposte, quantità "Completamento" — non più generata dal loop
                    su QUESTION_TYPES (il numero di risposte non è un tipo di domanda, è un
                    attributo solo di "Risposta chiusa"), colonne esplicite così ognuna ha
                    la propria label leggibile invece di stare nascosta dentro un divider.
                    Un Fragment per riga (non un div): resta un unico CSS grid, non una
                    tabella annidata — ogni cella è un figlio diretto del grid container,
                    l'auto-flow riga per riga fa il resto. */}
                {/* w-full, non più w-fit: senza, la tabella restava più stretta della card
                    (fissa, vedi il commento sulla Card più sotto) — lasciando un margine
                    destro vuoto, incoerente con Classificazione e Gestisci revisione che
                    riempiono tutta la larghezza disponibile. Le prime tre colonne restano
                    max-content (non hanno lo stesso contenuto — due stepper vs uno — 1fr le
                    forzerebbe alla stessa larghezza), solo l'ultima ("Completamento") è 1fr:
                    assorbe lo spazio residuo, portando il bordo destro della tabella a filo
                    con quello della card invece di lasciarlo a metà. */}
                <div className="w-full overflow-hidden rounded-md border">
                  <div
                    className="grid"
                    style={{ gridTemplateColumns: 'auto max-content max-content 1fr' }}
                  >
                    <div className="flex items-center border-r border-b bg-muted/40 px-6 py-2.5 text-xs font-semibold text-foreground">
                      Difficoltà
                    </div>
                    {/* Niente border-r tra questa e "Numero di risposte", e padding interno
                        ridotto (pr-3/pl-3 sul lato che si tocca, invece di px-6 su entrambi) —
                        sono lo stesso raggruppamento: la quantità di domande "Risposta chiusa"
                        e quante risposte hanno, non due colonne indipendenti come
                        "Completamento". */}
                    <div className="flex items-center justify-center border-b bg-muted/40 py-2.5 pr-3 pl-6 text-center text-xs font-semibold text-foreground">
                      Domande a
                      <br />
                      risposta chiusa
                    </div>
                    {/* flex items-center: da sola questa cella è una riga sola, ma condivide
                        l'altezza di riga con le due vicine (che vanno a capo su due righe) —
                        senza centratura verticale il suo testo resterebbe ancorato in alto
                        invece che centrato rispetto a loro. */}
                    <div className="flex items-center justify-center border-r border-b bg-muted/40 py-2.5 pr-6 pl-3 text-center text-xs font-semibold text-foreground">
                      Numero di risposte
                    </div>
                    <div className="flex items-center justify-center border-b bg-muted/40 px-6 py-2.5 text-center text-xs font-semibold text-foreground">
                      Domande a
                      <br />
                      completamento
                    </div>
                    {DIFFICULTY_BUCKETS.map(({ key, label }, rowIndex) => {
                      const isLastRow = rowIndex === DIFFICULTY_BUCKETS.length - 1;
                      const rowBorder = !isLastRow && 'border-b';
                      return (
                        <Fragment key={key}>
                          <div
                            className={cn(
                              'flex items-center border-r px-6 py-2.5 text-xs font-semibold text-foreground',
                              rowBorder
                            )}
                          >
                            {label}
                          </div>
                          <div
                            className={cn(
                              'flex items-center justify-center py-2.5 pr-3 pl-6',
                              rowBorder
                            )}
                          >
                            <NumberStepper
                              value={quantities[key].MULTIPLE_CHOICE}
                              onChange={(v) => handleQuantityChange(key, 'MULTIPLE_CHOICE', v)}
                              onStep={(delta) => stepQuantity(key, 'MULTIPLE_CHOICE', delta)}
                              disabled={disabled}
                              minDisabled={Number(quantities[key].MULTIPLE_CHOICE) <= 0}
                              maxDisabled={totalQuantity >= MAX_TOTAL_QUANTITY}
                              ariaLabel={`Risposta chiusa ${label}`}
                            />
                          </div>
                          <div
                            className={cn(
                              'flex items-center justify-center border-r py-2.5 pr-6 pl-3',
                              rowBorder
                            )}
                          >
                            <NumberStepper
                              value={answerCounts[key]}
                              onChange={(v) => handleAnswerCountChange(key, v)}
                              onStep={(delta) => stepAnswerCount(key, delta)}
                              disabled={disabled}
                              minDisabled={Number(answerCounts[key]) <= ANSWER_COUNT_MIN}
                              maxDisabled={Number(answerCounts[key]) >= ANSWER_COUNT_MAX}
                              ariaLabel={`Numero di risposte ${label}`}
                            />
                          </div>
                          <div
                            className={cn(
                              'flex items-center justify-center px-6 py-2.5',
                              rowBorder
                            )}
                          >
                            <NumberStepper
                              value={quantities[key].COMPLETION}
                              onChange={(v) => handleQuantityChange(key, 'COMPLETION', v)}
                              onStep={(delta) => stepQuantity(key, 'COMPLETION', delta)}
                              disabled={disabled}
                              minDisabled={Number(quantities[key].COMPLETION) <= 0}
                              maxDisabled={totalQuantity >= MAX_TOTAL_QUANTITY}
                              ariaLabel={`Completamento ${label}`}
                            />
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {totalQuantity} domande in totale · minimo {MIN_TOTAL_QUANTITY}, fino a{' '}
                  {MAX_TOTAL_QUANTITY} per volta.
                </p>
                {/* Solo sotto soglia (1), non a 0: a 0 "minimo 2" nella riga sopra basta già —
                    qui serve solo a spiegare perché "Crea Domanda" resta bloccato quando
                    sembrerebbe già pronto (una cella valorizzata, totale positivo). */}
                {totalQuantity > 0 && totalQuantity < MIN_TOTAL_QUANTITY && (
                  <p className="text-xs text-destructive">
                    Servono almeno {MIN_TOTAL_QUANTITY} domande per generare un gruppo.
                  </p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Obbligatorio come Materia/Argomento/Composizione, ma precompilato su
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
            <AccordionContent className="flex flex-col gap-3 px-6 pt-4 pb-5">
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
          quantityByDifficultyAndType={{
            facile: {
              MULTIPLE_CHOICE: Number(quantities.facile.MULTIPLE_CHOICE) || 0,
              COMPLETION: Number(quantities.facile.COMPLETION) || 0,
            },
            media: {
              MULTIPLE_CHOICE: Number(quantities.media.MULTIPLE_CHOICE) || 0,
              COMPLETION: Number(quantities.media.COMPLETION) || 0,
            },
            difficile: {
              MULTIPLE_CHOICE: Number(quantities.difficile.MULTIPLE_CHOICE) || 0,
              COMPLETION: Number(quantities.difficile.COMPLETION) || 0,
            },
          }}
          answerCountByDifficulty={{
            facile: Number(answerCounts.facile) || Number(ANSWER_COUNT_DEFAULT),
            media: Number(answerCounts.media) || Number(ANSWER_COUNT_DEFAULT),
            difficile: Number(answerCounts.difficile) || Number(ANSWER_COUNT_DEFAULT),
          }}
          reviewerId={reviewerId}
          reviewerLabel={gestisciRevisioneLabel || undefined}
          manualeTitle={manualeTitle}
        />
      )}
    </div>
  );
}
