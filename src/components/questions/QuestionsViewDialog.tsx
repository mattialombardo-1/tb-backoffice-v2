import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { questionImagesService } from '@/lib/services/questionImages';
import type { Question, QuestionListItem } from '@/lib/types/questions';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '@/lib/types/questions';
import { renderLatexWithImages } from '@/components/rich-editor/latex-utils';

interface QuestionsViewDialogProps {
  question: QuestionListItem | null;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface RenderedTextProps {
  value: string;
  images: Array<{ id: string; url: string }>;
  className?: string;
}

function RenderedText({ value, images, className }: RenderedTextProps) {
  const html = useMemo(() => renderLatexWithImages(value, images), [value, images]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function QuestionsViewDialog({ question, onClose }: QuestionsViewDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const [fullQuestion, setFullQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionViewUrls, setQuestionViewUrls] = useState<string[]>([]);
  const [altViewUrls, setAltViewUrls] = useState<Record<number, string>>({});
  const [explanationViewUrls, setExplanationViewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!question) {
      setFullQuestion(null);
      setQuestionViewUrls([]);
      setAltViewUrls({});
      setExplanationViewUrls([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setQuestionViewUrls([]);
    setAltViewUrls({});
    setExplanationViewUrls([]);

    questionsService
      .get(client, question.id)
      .then(async (q) => {
        if (cancelled) return;
        setFullQuestion(q);

        // Fetch presigned view URLs for question images, alt images, and explanation images
        const qStorageUrls = q.questionImages ?? [];
        const altStorageUrls = (q.alternatives ?? [])
          .map((a) => a.image)
          .filter((img): img is string => !!img);
        const exStorageUrls = q.explanationImages ?? [];
        const allStorageUrls = [...qStorageUrls, ...altStorageUrls, ...exStorageUrls];

        if (allStorageUrls.length === 0) return;

        try {
          const allViewUrls = await questionImagesService.getViewUrls(client, allStorageUrls);
          if (cancelled) return;

          const qViewUrls = allViewUrls.slice(0, qStorageUrls.length);
          const altViewUrlList = allViewUrls.slice(qStorageUrls.length, qStorageUrls.length + altStorageUrls.length);
          const exViewUrls = allViewUrls.slice(qStorageUrls.length + altStorageUrls.length);

          setQuestionViewUrls(qViewUrls);
          setExplanationViewUrls(exViewUrls);

          const altUrlMap: Record<number, string> = {};
          let altIdx = 0;
          (q.alternatives ?? []).forEach((a, i) => {
            if (a.image) altUrlMap[i] = altViewUrlList[altIdx++] ?? a.image;
          });
          setAltViewUrls(altUrlMap);
        } catch {
          // Graceful fallback — show storage URLs directly (likely broken in browser but better than nothing)
          setQuestionViewUrls(qStorageUrls);
        }
      })
      .catch(() => { if (!cancelled) setFullQuestion(null); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [question?.id, client]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const questionText = fullQuestion?.questionText ?? question?.questionText ?? '';
  const alternatives = fullQuestion?.alternatives ?? [];
  const completionAnswer = fullQuestion?.completionAnswer ?? question?.completionAnswer ?? '';
  const explanationText = fullQuestion?.explanationText ?? '';

  const availableImages = useMemo(
    () => questionViewUrls.map((url, idx) => ({ id: `image${idx + 1}`, url })),
    [questionViewUrls]
  );

  const availableExplanationImages = useMemo(
    () => explanationViewUrls.map((url, idx) => ({ id: `image${idx + 1}`, url })),
    [explanationViewUrls]
  );

  return (
    <Dialog open={!!question} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('questions.viewDialog.title')}</DialogTitle>
        </DialogHeader>

        {question && (
          <div className="space-y-4">
            {/* Metadata badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{QUESTION_TYPE_LABELS[question.type]}</Badge>
              <Badge variant="outline">{DIFFICULTY_LABELS[question.difficulty]}</Badge>
              <span className="text-xs text-muted-foreground font-mono">{question.id}</span>
            </div>

            <Separator />

            {/* Question text */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t('questions.viewDialog.questionText')}</p>
              <RenderedText
                value={questionText}
                images={availableImages}
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
              />
            </div>

            <Separator />

            {/* Alternatives */}
            {question.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t('questions.viewDialog.alternatives')}</p>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">{t('questions.viewDialog.loading')}</p>
                ) : alternatives.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('questions.viewDialog.noAlternatives')}</p>
                ) : (
                  <div className="space-y-1.5">
                    {alternatives.map((alt, idx) => (
                      <div
                        key={alt.id}
                        className={cn(
                          'flex items-start gap-2 rounded-md border px-3 py-2 text-sm',
                          alt.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'border-border'
                        )}
                      >
                        <span className="font-semibold shrink-0 mt-0.5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <div className="flex-1 space-y-1">
                          {alt.text && (
                            <RenderedText
                              value={alt.text}
                              images={availableImages}
                              className="prose prose-sm dark:prose-invert max-w-none"
                            />
                          )}
                          {altViewUrls[idx] && (
                            <img
                              src={altViewUrls[idx]}
                              alt={`Immagine alternativa ${String.fromCharCode(65 + idx)}`}
                              className="max-w-xs h-auto rounded"
                            />
                          )}
                        </div>
                        {alt.isCorrect && (
                          <span className="shrink-0 text-xs font-medium ml-1">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Completion answer */}
            {question.type === 'COMPLETION' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{t('questions.viewDialog.correctAnswer')}</p>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">{t('questions.viewDialog.loading')}</p>
                ) : completionAnswer ? (
                  <p className="text-sm rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-2">
                    {completionAnswer}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{t('questions.viewDialog.noAnswer')}</p>
                )}
              </div>
            )}

            <Separator />

            {/* Explanation */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t('questions.viewDialog.explanationText')}</p>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">{t('questions.viewDialog.loading')}</p>
              ) : explanationText ? (
                <>
                  <RenderedText
                    value={explanationText}
                    images={availableExplanationImages}
                    className="text-sm prose prose-sm dark:prose-invert max-w-none"
                  />
                  {explanationViewUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Immagine spiegazione ${idx + 1}`}
                      className="max-w-full h-auto rounded mt-2"
                    />
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t('questions.viewDialog.noExplanation')}</p>
              )}
            </div>

            <Separator />

            {/* Author and dates */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {question.authorEmail && (
                <>
                  <span className="text-muted-foreground">{t('questions.viewDialog.author')}</span>
                  <span className="font-medium">{question.authorEmail}</span>
                </>
              )}
              <span className="text-muted-foreground">{t('questions.viewDialog.updatedAt')}</span>
              <span>{formatDate(question.updatedAt)}</span>
              <span className="text-muted-foreground">{t('questions.viewDialog.createdAt')}</span>
              <span>{formatDate(question.createdAt)}</span>
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
