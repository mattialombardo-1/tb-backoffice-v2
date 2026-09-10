import { useEffect, useRef, useState, type ReactNode } from 'react';
import { FileText, ListPlus, Paperclip, SlidersHorizontal, Tags, UserCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { DifficultySelector } from './DifficultySelector';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { QuestionNotesField } from './QuestionNotesField';
import { QuestionAttachmentsField } from './QuestionAttachmentsField';
import { QuestionGenerationSummaryDialog } from './QuestionGenerationSummaryDialog';
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
  icon: Icon,
  description,
  badge,
}: {
  title: string;
  icon: LucideIcon;
  description?: string;
  /** Marcatore accanto al titolo, mostrato solo a sezione chiusa (i chiamanti lo
   *  passano già condizionato su `openSection`) — l'asterisco rosso di obbligatorio
   *  o "(facoltativo)" in corsivo. */
  badge?: ReactNode;
}) {
  return (
    <span className="block">
      <span className="flex items-center gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <span className="text-base font-semibold text-foreground">
          {title}
          {badge}
        </span>
      </span>
      {description && (
        <span className="mt-2 ml-[38px] block text-sm leading-tight font-normal text-muted-foreground">
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
const OPTIONAL_BADGE = (
  <span className="ml-1 text-xs font-normal text-muted-foreground italic">(facoltativo)</span>
);

/** Una voce del riepilogo a sezione chiusa: testo + cosa succede al click. */
interface FieldTagItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}

const FIELD_TAG_CLASSNAME =
  'cursor-pointer border-sky-500 bg-sky-100 text-sky-700 hover:bg-sky-200 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-900';

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
    <div className="mt-2 ml-[38px] flex flex-wrap gap-1.5">
      {items.map(({ label, icon: ItemIcon, onClick }) => (
        <Badge
          key={label}
          asChild
          variant="outline"
          className={cn('font-normal', FIELD_TAG_CLASSNAME)}
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

/** Un numero di risposte possibile; solo quelli `enabled` sono selezionabili. */
interface AnswerCountOption {
  count: string;
  enabled?: boolean;
}

// Proposta di design: per Chimica il numero di risposte è fisso a 5 — le altre
// opzioni restano visibili (altri formati/materie potranno averne 3 o 4) ma
// disattivate.
const ANSWER_COUNT_OPTIONS: AnswerCountOption[] = [
  { count: '3' },
  { count: '4' },
  { count: '5', enabled: true },
];

/**
 * Quante alternative deve avere la domanda — visibile solo per "Risposta
 * chiusa". "5" preselezionato e bloccato, come richiesto per Chimica.
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
    <RadioGroup
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      className="grid grid-cols-3 gap-3"
    >
      {ANSWER_COUNT_OPTIONS.map(({ count, enabled }) => (
        <label
          key={count}
          htmlFor={`answer-count-${count}`}
          className={cn(
            'flex cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm font-medium transition-colors',
            value === count ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50',
            !enabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
          )}
        >
          <RadioGroupItem value={count} id={`answer-count-${count}`} disabled={!enabled} />
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

// Proposta di design: lista fissa per la sezione Difficoltà — parametro di
// generazione, non la scala di valutazione reale (DIFFICULTY_LABELS), usata
// altrove in tutto il backoffice per filtri e badge sulle domande esistenti.
const DIFFICULTA_OPTIONS: string[] = [
  'Qualsiasi',
  'Facile',
  'Medio-Facile',
  'Media',
  'Medio-Difficile',
  'Difficile',
];

interface QuestionSetupAccordionProps {
  hierarchy: HierarchyState;
  disabled?: boolean;
  /** Obbligatorio per procedere — controllato da QuestionCreatePage insieme a Materia/Argomento. */
  type: QuestionType | '';
  onTypeChange: (value: QuestionType) => void;
  /** Obbligatorio per procedere — controllato da QuestionCreatePage insieme a Materia/Argomento. */
  quantity: string;
  onQuantityChange: (value: string) => void;
  /** Obbligatorio per procedere — risolto qui (te stesso o un altro revisore scelto),
   *  ma controllato da QuestionCreatePage insieme agli altri campi che sbloccano "Crea Bozze". */
  reviewerId: string | null;
  onReviewerIdChange: (value: string | null) => void;
  /** Modale di riepilogo post-generazione — aperta/chiusa da QuestionCreatePage. */
  summaryOpen: boolean;
  onExitSummary: () => void;
}

/**
 * Proposta di design, ispirata al layout della reference: ogni macro sezione
 * (Classificazione, Composizione, Opzioni aggiuntive) è un unico accordion —
 * niente più un accordion per singolo campo. Una volta aperta una sezione, i
 * suoi campi sono tutti visibili insieme, affiancati a due colonne.
 * Le tre fisarmoniche condividono lo stesso stato: resta aperta una sola
 * sezione alla volta su tutto il form.
 */
export function QuestionSetupAccordion({
  hierarchy,
  disabled = false,
  type,
  onTypeChange,
  quantity,
  onQuantityChange,
  reviewerId,
  onReviewerIdChange,
  summaryOpen,
  onExitSummary,
}: QuestionSetupAccordionProps) {
  const [openSection, setOpenSection] = useState('');

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
      // Un bottone fuori dagli accordion (es. "Resetta form", "Crea Bozze") ha già il
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

  // Parametro di generazione, scollegato da form.difficulty (la scala reale delle
  // domande già esistenti): qui l'utente sceglie fra le opzioni di DIFFICULTA_OPTIONS.
  // Facoltativo — niente asterisco, niente controllo sulla CTA.
  const [difficulty, setDifficulty] = useState('');

  // Numero di risposte per "Risposta chiusa" — 5 è il default reale.
  const [answerCount, setAnswerCount] = useState('5');

  // Note libere e facoltative per la generazione.
  const [notes, setNotes] = useState('');

  // Nome del file allegato — nessun upload vero, solo per simulare l'effetto.
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Chi revisiona le domande generate — obbligatorio, nessun default implicito: l'utente
  // deve sempre scegliere esplicitamente tra sé stesso e un altro revisore (vedi
  // "Gestisci revisione" più sotto). Il valore risolto (reviewerId) è controllato da
  // QuestionCreatePage insieme agli altri campi che sbloccano "Crea Bozze".
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

  const handleReviewerChoiceChange = (choice: 'me' | 'other') => {
    setReviewerChoice(choice);
    if (choice === 'me') {
      onReviewerIdChange(meId);
    } else {
      onReviewerIdChange(otherReviewerId);
    }
  };

  const handleOtherReviewerChange = (id: string | null) => {
    setOtherReviewerId(id);
    onReviewerIdChange(id);
  };

  const currentSubtopics = hierarchy.selection.topicName
    ? (SOTTOARGOMENTO_OPTIONS[hierarchy.selection.topicName] ?? [])
    : [];
  const sottoArgomentoLabel = currentSubtopics.find(
    (s) => `__fixed__${slugify(s)}` === hierarchy.selection.sottoArgomentoId
  );

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

  const composizioneTagItems: FieldTagItem[] = [
    difficulty
      ? { label: difficulty, onClick: () => openFieldDropdown('composizione', 'difficolta') }
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
    quantity
      ? { label: `${quantity} domande`, onClick: () => openFieldDropdown('composizione', null) }
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

  // Anteprima nota: 30 caratteri + ".." (32 in totale) — solo per il tag a
  // sezione chiusa, non per il campo Note vero e proprio.
  const notesPreview = notes.trim()
    ? notes.trim().length > 30
      ? `${notes.trim().slice(0, 30)}..`
      : notes.trim()
    : undefined;

  const opzioniAggiuntiveTagsRaw: (FieldTagItem | null)[] = [
    notesPreview
      ? {
          label: notesPreview,
          icon: FileText,
          onClick: () => openFieldDropdown('opzioni-aggiuntive', null),
        }
      : null,
    attachedFileName
      ? {
          label: attachedFileName,
          icon: Paperclip,
          onClick: () => openFieldDropdown('opzioni-aggiuntive', null),
        }
      : null,
  ];
  const opzioniAggiuntiveTagItems = opzioniAggiuntiveTagsRaw.filter(
    (v): v is FieldTagItem => v !== null
  );

  return (
    <div ref={accordionsRef} className="space-y-8">
      <Card className="shadow-md">
        <CardContent className="py-4">
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="w-full"
          >
            <AccordionItem value="classificazione" className="border-b-0">
              <AccordionTrigger className="py-0 hover:no-underline">
                <GroupTrigger
                  title="Classificazione"
                  icon={Tags}
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
                <FieldTags items={classificazioneTagItems} />
              )}
              <AccordionContent className="pt-3.5 pb-0">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  <div className="sm:col-span-2">
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
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="py-4">
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="w-full"
          >
            <AccordionItem value="composizione" className="border-b-0">
              <AccordionTrigger className="py-0 hover:no-underline">
                <GroupTrigger
                  title="Composizione"
                  icon={SlidersHorizontal}
                  badge={
                    openSection === 'composizione' ||
                    (type !== '' && quantity !== '' && Number(quantity) > 0)
                      ? undefined
                      : REQUIRED_BADGE
                  }
                  description={
                    openSection === 'composizione' || composizioneTagItems.length > 0
                      ? undefined
                      : 'Difficoltà, quantità e tipo di risposta delle domande da generare'
                  }
                />
              </AccordionTrigger>
              {openSection !== 'composizione' && composizioneTagItems.length > 0 && (
                <FieldTags items={composizioneTagItems} />
              )}
              <AccordionContent className="space-y-4 pt-3.5 pb-0">
                <DifficultySelector
                  value={difficulty}
                  onChange={setDifficulty}
                  disabled={disabled}
                  fixedOptions={DIFFICULTA_OPTIONS}
                  open={autoOpenField === 'difficolta' || undefined}
                  onOpenChange={(v) => {
                    if (!v) setAutoOpenField(null);
                  }}
                />

                <div className="flex flex-col gap-3">
                  <Label htmlFor="quantita-domande">
                    Quantità di domande
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <Input
                    id="quantita-domande"
                    value={quantity}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
                      onQuantityChange(digits === '' ? '' : String(Math.min(100, Number(digits))));
                    }}
                    inputMode="numeric"
                    placeholder="Es. 20"
                    disabled={disabled}
                    className="w-24 appearance-none bg-transparent ring-offset-transparent focus:outline-none"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  />
                  <p className="text-xs text-muted-foreground">Fino a 100 per volta.</p>
                </div>

                {/* Ultimo campo del gruppo, come richiesto. */}
                <QuestionTypeSelector
                  value={type}
                  onChange={onTypeChange}
                  disabled={disabled}
                  required
                />

                {type === 'MULTIPLE_CHOICE' && (
                  <div className="flex flex-col gap-3">
                    <Label>Numero di risposte</Label>
                    <AnswerCountField
                      value={answerCount}
                      onChange={setAnswerCount}
                      disabled={disabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Per Chimica il numero di risposte è fissato a 5.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* "Opzioni aggiuntive" è lei stessa il trigger — stesso pattern di
          "Gestisci revisione" nella reference. */}
      <Card className="shadow-md">
        <CardContent className="py-4">
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="w-full"
          >
            <AccordionItem value="opzioni-aggiuntive" className="border-b-0">
              <AccordionTrigger className="py-0 hover:no-underline">
                <GroupTrigger
                  title="Opzioni aggiuntive"
                  icon={ListPlus}
                  badge={openSection === 'opzioni-aggiuntive' ? undefined : OPTIONAL_BADGE}
                  description={
                    openSection === 'opzioni-aggiuntive' || opzioniAggiuntiveTagItems.length > 0
                      ? undefined
                      : 'Note e allegati facoltativi per la generazione'
                  }
                />
              </AccordionTrigger>
              {openSection !== 'opzioni-aggiuntive' && opzioniAggiuntiveTagItems.length > 0 && (
                <FieldTags items={opzioniAggiuntiveTagItems} />
              )}
              <AccordionContent className="flex flex-col gap-3.5 pt-3.5 pb-0">
                <QuestionNotesField value={notes} onChange={setNotes} disabled={disabled} />
                <QuestionAttachmentsField
                  fileName={attachedFileName}
                  onFileNameChange={setAttachedFileName}
                  disabled={disabled}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Obbligatorio come Materia/Argomento/Tipo/Quantità — niente default implicito:
          l'utente sceglie sempre esplicitamente tra sé stesso e un altro revisore, così
          non capita per sbaglio di assegnarsi domande senza saperlo. */}
      <Card className="shadow-md">
        <CardContent className="py-4">
          <Accordion
            type="single"
            collapsible
            value={openSection}
            onValueChange={setOpenSection}
            className="w-full"
          >
            <AccordionItem value="gestisci-revisione" className="border-b-0">
              <AccordionTrigger className="py-0 hover:no-underline">
                <GroupTrigger
                  title="Gestisci revisione"
                  icon={UserCheck}
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
                <FieldTags items={gestisciRevisioneTagItems} />
              )}
              <AccordionContent className="flex flex-col gap-3.5 pt-3.5 pb-0">
                <div className="flex flex-col gap-3">
                  <Label>
                    Chi revisiona queste domande?
                    <span className="ml-0.5 text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={reviewerChoice}
                    onValueChange={(v) => handleReviewerChoiceChange(v as 'me' | 'other')}
                    disabled={disabled}
                    className="grid grid-cols-1 gap-3 sm:grid-cols-2"
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
        </CardContent>
      </Card>

      <QuestionGenerationSummaryDialog
        open={summaryOpen}
        onExit={onExitSummary}
        subjectId={hierarchy.selection.subjectId ?? ''}
        materiaName={hierarchy.selection.subjectName ?? undefined}
        topicId={hierarchy.selection.topicId ?? ''}
        argomentoName={hierarchy.selection.topicName ?? undefined}
        sottoArgomentoId={hierarchy.selection.sottoArgomentoId ?? ''}
        sottoArgomentoName={sottoArgomentoLabel}
        difficultyLabel={difficulty || undefined}
        typeLabel={type ? QUESTION_TYPE_LABELS[type] : ''}
        isMultipleChoice={type === 'MULTIPLE_CHOICE'}
        quantity={Number(quantity) || 0}
        answerCount={Number(answerCount) || 5}
        reviewerId={reviewerId}
        notesLabel={notesPreview}
        attachmentLabel={attachedFileName ?? undefined}
        reviewerLabel={gestisciRevisioneLabel || undefined}
      />
    </div>
  );
}
