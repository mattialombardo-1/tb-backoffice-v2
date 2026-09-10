import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface QuestionNotesFieldProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Proposta di design: tetto ragionevole per un campo di indicazioni brevi,
// non un editor di testo lungo. Regolabile se serve un numero diverso.
const NOTES_MAX_LENGTH = 300;

/**
 * Proposta di design — note libere e facoltative per la generazione, con
 * limite di caratteri segnalato da un contatore. Campo a sé, separato dagli
 * allegati (vedi QuestionAttachmentsField), pur restando entrambi dentro
 * "Opzioni aggiuntive".
 */
export function QuestionNotesField({ value, onChange, disabled = false }: QuestionNotesFieldProps) {
  const atLimit = value.length >= NOTES_MAX_LENGTH;

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="note-aggiuntive">
        Note aggiuntive
        <span className="ml-2 text-xs font-normal text-muted-foreground">(facoltativo)</span>
      </Label>
      <Textarea
        id="note-aggiuntive"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, NOTES_MAX_LENGTH))}
        placeholder="Aggiungi indicazioni extra"
        disabled={disabled}
        maxLength={NOTES_MAX_LENGTH}
        className="min-h-24 resize-none placeholder:italic"
      />
      <p className={cn('text-right text-xs text-muted-foreground', atLimit && 'text-destructive')}>
        {value.length}/{NOTES_MAX_LENGTH}
      </p>
    </div>
  );
}
