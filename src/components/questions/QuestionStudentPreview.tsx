import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { renderLatexWithImages } from '@/components/rich-editor/latex-utils';
import type { Alternative, AlternativeStyle, QuestionType } from '@/lib/types/questions';

interface QuestionStudentPreviewProps {
  questionText: string;
  type: QuestionType;
  alternatives: Alternative[];
  alternativeStyle: AlternativeStyle;
  completionAnswer: string;
  questionImages?: string[];
  explanationText?: string;
  explanationImages?: string[];
}

function getOrdinalLabel(index: number, style: AlternativeStyle): string {
  if (style === 'alpha') return String.fromCharCode(65 + index);
  return String(index + 1);
}

export function QuestionStudentPreview({
  questionText,
  type,
  alternatives,
  alternativeStyle,
  completionAnswer,
  questionImages = [],
  explanationText = '',
  explanationImages = [],
}: QuestionStudentPreviewProps) {
  const availableImages = useMemo(
    () => questionImages.map((url, idx) => ({ id: `image${idx + 1}`, url })),
    [questionImages]
  );

  const availableExplanationImages = useMemo(
    () => explanationImages.map((url, idx) => ({ id: `image${idx + 1}`, url })),
    [explanationImages]
  );

  const hasExplanation = explanationText.trim() || explanationImages.length > 0;

  return (
    <div className="space-y-3">
      <QuestionTextPreview text={questionText} images={availableImages} />
      {type === 'MULTIPLE_CHOICE' ? (
        <div className="space-y-2">
          {alternatives.map((alt, idx) => (
            <AlternativePreview
              key={alt.id}
              alternative={alt}
              ordinalLabel={getOrdinalLabel(idx, alternativeStyle)}
              images={availableImages}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border p-3 text-sm italic text-muted-foreground">
          {completionAnswer || '______'}
        </div>
      )}

      {hasExplanation && (
        <div className="border-t pt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Correzione commentata
          </p>
          <div className="rounded-md border p-3">
            <QuestionTextPreview text={explanationText} images={availableExplanationImages} />
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionTextPreview({
  text,
  images,
}: {
  text: string;
  images: Array<{ id: string; url: string }>;
}) {
  const html = useMemo(() => renderLatexWithImages(text, images), [text, images]);

  return (
    <div
      className={cn('text-sm leading-relaxed', !text && 'text-muted-foreground')}
      dangerouslySetInnerHTML={{
        __html: text ? html : 'Inizia a scrivere il testo della domanda...',
      }}
    />
  );
}

function AlternativePreview({
  alternative,
  ordinalLabel,
  images,
}: {
  alternative: Alternative;
  ordinalLabel: string;
  images: Array<{ id: string; url: string }>;
}) {
  const html = useMemo(
    () => renderLatexWithImages(alternative.text, images),
    [alternative.text, images]
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-3 text-sm',
        alternative.isCorrect
          ? 'border-emerald-600 dark:border-emerald-500'
          : 'border-border'
      )}
    >
      <div className="flex items-start gap-2">
        <span className="shrink-0 font-medium text-muted-foreground">{ordinalLabel}.</span>
        <div
          className={cn('flex-1', !alternative.text && 'text-muted-foreground')}
          dangerouslySetInnerHTML={{
            __html: alternative.text ? html : `Alternativa ${ordinalLabel}`,
          }}
        />
      </div>
      {alternative.image && (
        <img
          src={alternative.imageViewUrl ?? alternative.image}
          alt={`alternativa ${ordinalLabel}`}
          className="max-h-32 w-auto rounded object-contain"
        />
      )}
    </div>
  );
}
