import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import type { QuestionType } from '@/lib/types/questions';
import { QUESTION_TYPE_LABELS } from '@/lib/types/questions';

interface QuestionTypeSelectorProps {
  value: QuestionType;
  onChange: (value: QuestionType) => void;
  disabled?: boolean;
}

const TYPES = Object.keys(QUESTION_TYPE_LABELS) as QuestionType[];

export function QuestionTypeSelector({ value, onChange, disabled }: QuestionTypeSelectorProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Label>{t('questions.typeLabel')}</Label>
      <Tabs value={value} onValueChange={(v) => onChange(v as QuestionType)}>
        <TabsList className="w-full">
          {TYPES.map((t) => (
            <TabsTrigger key={t} value={t} disabled={disabled} className="flex-1">
              {QUESTION_TYPE_LABELS[t]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
