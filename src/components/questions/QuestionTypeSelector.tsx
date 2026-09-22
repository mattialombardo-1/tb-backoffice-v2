import { useTranslation } from 'react-i18next';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { QuestionType } from '@/lib/types/questions';
import { QUESTION_TYPE_LABELS } from '@/lib/types/questions';

interface QuestionTypeSelectorProps {
  /** Stringa vuota = nessuna scelta ancora fatta (nessuna card selezionata). */
  value: QuestionType | '';
  onChange: (value: QuestionType) => void;
  disabled?: boolean;
  /** Omit the built-in label — use when an outer section (e.g. an accordion) already names this field. */
  hideLabel?: boolean;
  required?: boolean;
  /** Sposta il copy descrittivo di ogni card fuori dal box (sotto, non dentro) — usato da
   *  QuestionSetupAccordion per card più compatte. Default false: comportamento originale
   *  (descrizione dentro la card), invariato per chi già lo usa così (QuestionContentEditor,
   *  flusso manuale che non va ridisegnato). */
  descriptionOutside?: boolean;
}

const TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

// Proposta di design: card selezionabili al posto delle tab — stessa scelta,
// presentazione diversa (in sperimentazione).
const TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: 'Lo studente sceglie tra più alternative',
  COMPLETION: 'Lo studente scrive la risposta',
};

export function QuestionTypeSelector({
  value,
  onChange,
  disabled,
  hideLabel = false,
  required = false,
  descriptionOutside = false,
}: QuestionTypeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      {!hideLabel && (
        <Label>
          {t('questions.typeLabel')}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as QuestionType)}
        disabled={disabled}
        className="grid grid-cols-2 gap-3"
      >
        {TYPES.map((type) => (
          <label
            key={type}
            htmlFor={`question-type-${type}`}
            className={cn(
              'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
              // Centrato quando c'è solo il titolo dentro la card (descriptionOutside),
              // allineato in alto quando dentro c'è anche la descrizione multi-riga —
              // stesso comportamento originale per chi non usa descriptionOutside.
              descriptionOutside ? 'items-center' : 'items-start',
              value === type ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {/* Niente pallino visibile — carico cognitivo senza valore, lo
                stato selezionato è già leggibile da bordo e background della
                card. L'indicator resta nel DOM (sr-only, non `hidden`) così
                il radio è ancora un vero radio per tastiera/screen reader. */}
            <RadioGroupItem value={type} id={`question-type-${type}`} className="sr-only" />
            {descriptionOutside ? (
              <p className="text-sm leading-none font-medium">{QUESTION_TYPE_LABELS[type]}</p>
            ) : (
              <div className="space-y-0.5">
                <p className="text-sm leading-none font-medium">{QUESTION_TYPE_LABELS[type]}</p>
                <p className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
              </div>
            )}
          </label>
        ))}
      </RadioGroup>
      {/* Stesso ordine di TYPES della card sopra (grid-cols-2 allineata) — il copy
          descrittivo vive qui fuori dal box, non più dentro la card. */}
      {descriptionOutside && (
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((type) => (
            <p key={type} className="text-xs text-muted-foreground">
              {TYPE_DESCRIPTIONS[type]}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
