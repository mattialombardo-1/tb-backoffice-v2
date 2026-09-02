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
  value: DifficultyLevel;
  onChange: (value: DifficultyLevel) => void;
  disabled?: boolean;
  required?: boolean;
}

const LEVELS = Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[];

export function DifficultySelector({ value, onChange, disabled, required = false }: DifficultySelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>
        {t('questions.difficultyLabel')}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(v) => onChange(v as DifficultyLevel)}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LEVELS.map((l) => (
            <SelectItem key={l} value={l}>
              {DIFFICULTY_LABELS[l]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
