import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichContentEditor } from '@/components/rich-editor';
import type { DifficultyLevel } from '@/lib/types/questions';
import { DifficultySelector } from './DifficultySelector';
import { QuestionTypeSelector } from './QuestionTypeSelector';
import { AlternativesList } from './AlternativesList';
import { QuestionImagesManager } from './QuestionImagesManager';
import type { useQuestionForm } from '@/lib/hooks/useQuestionForm';

type FormState = ReturnType<typeof useQuestionForm>;

interface QuestionContentEditorProps {
  form: FormState;
}

export function QuestionContentEditor({ form }: QuestionContentEditorProps) {
  const { t } = useTranslation();
  const disabled = form.isReadOnly;
  const hasSpaces = form.completionAnswer.includes(' ');

  const availableImages = useMemo(
    () =>
      form.questionImageEntries.map((entry, idx) => ({
        id: `image${idx + 1}`,
        url: entry.viewUrl,
      })),
    [form.questionImageEntries]
  );

  const availableExplanationImages = useMemo(
    () =>
      form.explanationImageEntries.map((entry, idx) => ({
        id: `image${idx + 1}`,
        url: entry.viewUrl,
      })),
    [form.explanationImageEntries]
  );

  return (
    <div className="space-y-6">
      <DifficultySelector
        value={form.difficulty}
        onChange={(v) => form.setDifficulty(v as DifficultyLevel)}
        disabled={disabled}
        required
      />

      <Separator />

      <QuestionImagesManager
        entries={form.questionImageEntries}
        onAddImage={form.addQuestionImage}
        onRemoveImage={form.removeQuestionImage}
        disabled={disabled}
      />

      <Separator />

      <RichContentEditor
        mode="full"
        label={t('questions.editor.textLabel')}
        required
        value={form.questionText}
        onChange={form.setQuestionText}
        placeholder={t('questions.editor.textPlaceholder')}
        disabled={disabled}
        minRows={5}
        availableImages={availableImages}
      />

      <Separator />

      <QuestionTypeSelector
        value={form.type}
        onChange={form.setType}
        disabled={disabled}
        required
      />

      {form.type === 'MULTIPLE_CHOICE' ? (
        <AlternativesList
          alternatives={form.alternatives}
          onChange={form.setAlternatives}
          altStyle={form.alternativeStyle}
          onAltStyleChange={form.setAlternativeStyle}
          disabled={disabled}
          availableImages={availableImages}
        />
      ) : (
        <div className="space-y-3">
          <Label htmlFor="completion-answer">
            {t('questions.editor.correctAnswer')}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="completion-answer"
            value={form.completionAnswer}
            onChange={(e) => form.setCompletionAnswer(e.target.value.replace(/\s/g, ''))}
            placeholder={t('questions.editor.correctAnswerPlaceholder')}
            disabled={disabled}
          />
          {hasSpaces && (
            <p className="text-sm text-destructive">{t('questions.editor.noSpaces')}</p>
          )}
          <p className="text-xs text-muted-foreground">{t('questions.editor.noSpacesHint')}</p>
        </div>
      )}

      <Separator />

      <QuestionImagesManager
        entries={form.explanationImageEntries}
        onAddImage={form.addExplanationImage}
        onRemoveImage={form.removeExplanationImage}
        disabled={disabled}
        label="Immagini della spiegazione"
      />

      <RichContentEditor
        mode="full"
        label={t('questions.editor.explanationLabel')}
        value={form.explanationText}
        onChange={form.setExplanationText}
        placeholder={t('questions.editor.explanationPlaceholder')}
        disabled={disabled}
        minRows={4}
        availableImages={availableExplanationImages}
      />
    </div>
  );
}
