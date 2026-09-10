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
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {TYPES.map((type) => (
          <label
            key={type}
            htmlFor={`question-type-${type}`}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
              value === type ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem value={type} id={`question-type-${type}`} className="mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-sm leading-none font-medium">{QUESTION_TYPE_LABELS[type]}</p>
              <p className="text-xs text-muted-foreground">{TYPE_DESCRIPTIONS[type]}</p>
            </div>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
