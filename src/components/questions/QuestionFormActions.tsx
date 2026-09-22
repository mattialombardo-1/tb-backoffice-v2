import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Send } from 'lucide-react';

interface QuestionFormActionsProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  isSaving: boolean;
  isReadOnly: boolean;
  canSaveDraft: boolean;
  hasValidationErrors: boolean;
}

export function QuestionFormActions({
  onSaveDraft,
  onSubmit,
  isSaving,
  isReadOnly,
  canSaveDraft,
  hasValidationErrors,
}: QuestionFormActionsProps) {
  const { t } = useTranslation();

  if (isReadOnly) return null;

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" onClick={onSaveDraft} disabled={isSaving || !canSaveDraft}>
        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
        <Save />
        {t('questions.formActions.saveDraft')}
      </Button>
      <div className="flex items-center gap-1.5">
        <Button onClick={onSubmit} disabled={isSaving || hasValidationErrors}>
          <Send />
          {t('questions.formActions.saveQuestion')}
        </Button>
      </div>
    </div>
  );
}
