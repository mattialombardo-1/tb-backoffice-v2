import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { DifficultyLevel } from '@/lib/types/questions';
import { DIFFICULTY_LABELS } from '@/lib/types/questions';

interface DifficultySelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  /** Omit the built-in label — use when an outer section (e.g. an accordion) already names this field. */
  hideLabel?: boolean;
  /**
   * Design-exploration override: show exactly this list of labels instead of the
   * real difficulty scale (`DIFFICULTY_LABELS`, used app-wide for filters and badges).
   */
  fixedOptions?: string[];
  /** Apre/chiude il menu da fuori — es. click sul tag di riepilogo a sezione chiusa. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const LEVELS = Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[];

export function DifficultySelector({
  value,
  onChange,
  disabled,
  required = false,
  hideLabel = false,
  fixedOptions,
  open,
  onOpenChange,
}: DifficultySelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      {!hideLabel && (
        <Label>
          {t('questions.difficultyLabel')}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        open={open}
        onOpenChange={onOpenChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleziona difficoltà" />
        </SelectTrigger>
        <SelectContent>
          {fixedOptions
            ? fixedOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))
            : LEVELS.map((l) => (
                <SelectItem key={l} value={l}>
                  {DIFFICULTY_LABELS[l]}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>
    </div>
  );
}
