import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Check, CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { questionImagesService } from '@/lib/services/questionImages';
import type { Question, QuestionListItem } from '@/lib/types/questions';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '@/lib/types/questions';
import { renderLatexWithImages } from '@/components/rich-editor/latex-utils';
import { findPassageForQuestionText } from './questionBanks';
import { buildQualityChecks, parseExplanation } from './questionQualityChecks';

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
  // "Vedi il passaggio" — stesso bottone/dialog del post-generazione, ma qui non c'è un
  // testo di passaggio salvato per le domande reali (draft.passage esiste solo in memoria
  // durante la generazione, mai persistito): il dialog lo dice onestamente invece di
  // inventare una citazione.
  const [showPassageDialog, setShowPassageDialog] = useState(false);

  useEffect(() => {
    if (!question) {
      setFullQuestion(null);
      setQuestionViewUrls([]);
      setAltViewUrls({});
      setExplanationViewUrls([]);
      setShowPassageDialog(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setQuestionViewUrls([]);
    setAltViewUrls({});
    setExplanationViewUrls([]);
    setShowPassageDialog(false);

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
          const altViewUrlList = allViewUrls.slice(
            qStorageUrls.length,
            qStorageUrls.length + altStorageUrls.length
          );
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
      .catch(() => {
        if (!cancelled) setFullQuestion(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [question?.id, client]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const questionText = fullQuestion?.questionText ?? question?.questionText ?? '';
  const alternatives = fullQuestion?.alternatives ?? [];
  const completionAnswer = fullQuestion?.completionAnswer ?? question?.completionAnswer ?? '';
  const { explanation: explanationText, source } = parseExplanation(
    fullQuestion?.explanationText ?? ''
  );
  // "Vedi il passaggio" — il passaggio non è mai salvato sul backend, ma le domande
  // generate da QuestionGenerationStep hanno testo identico a un template lì
  // dentro: recuperando quello si mostra lo stesso passaggio "simulato" della generazione,
  // invece di inventarne uno nuovo. undefined per le domande del catalogo reale o quelle
  // il cui testo è stato modificato a mano dopo la generazione.
  const simulatedPassage = findPassageForQuestionText(questionText);

  const availableImages = useMemo(
    () => questionViewUrls.map((url, idx) => ({ id: `image${idx + 1}`, url })),
    [questionViewUrls]
  );

  const availableExplanationImages = useMemo(
    () => explanationViewUrls.map((url, idx) => ({ id: `image${idx + 1}`, url })),
    [explanationViewUrls]
  );

  // Etichetta "Risposta corretta: X" sopra la spiegazione — stessa lettera con cui
  // l'alternativa corretta è già evidenziata sotto, non un dato indipendente.
  const correctIndex = alternatives.findIndex((a) => a.isCorrect);
  const correctAnswerLabel =
    question?.type === 'MULTIPLE_CHOICE'
      ? correctIndex >= 0
        ? String.fromCharCode(65 + correctIndex)
        : undefined
      : completionAnswer || undefined;

  const qualityChecks =
    question && !isLoading
      ? buildQualityChecks({
          type: question.type,
          questionText,
          subjectId: question.subjectId,
          topicId: question.topicId,
          alternatives,
          completionAnswer,
          explanationText,
          source,
        })
      : null;

  return (
    <Dialog open={!!question} onOpenChange={handleOpenChange}>
      <DialogContent className="min-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('questions.viewDialog.title')}</DialogTitle>
        </DialogHeader>

        {question && (
          <div className="space-y-4">
            {/* Metadata badges — fuori dalla card, come lo stato/titolo della riga nel
                dialog post-generazione. */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{QUESTION_TYPE_LABELS[question.type]}</Badge>
              <Badge variant="outline">{DIFFICULTY_LABELS[question.difficulty]}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{question.id}</span>
            </div>

            {/* Stesso contenitore del dialog post-generazione: un'unica card tenue che
                raggruppa testo, risposte e correzione — un solo divider (border-t) prima
                della correzione, non uno per sezione. */}
            <div className="space-y-5 rounded-lg bg-muted/50 p-5">
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {t('questions.viewDialog.questionText')}
                </p>
                <RenderedText
                  value={questionText}
                  images={availableImages}
                  className="prose prose-sm dark:prose-invert max-w-none text-sm"
                />
              </div>

              {question.type === 'MULTIPLE_CHOICE' ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-muted-foreground">
                    {t('questions.viewDialog.alternatives')}
                  </p>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      {t('questions.viewDialog.loading')}
                    </p>
                  ) : alternatives.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t('questions.viewDialog.noAlternatives')}
                    </p>
                  ) : (
                    alternatives.map((alt, idx) => (
                      <div
                        key={alt.id}
                        className={cn(
                          'flex items-center gap-3 rounded-md border px-3 py-2 text-sm',
                          alt.isCorrect
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'border-border bg-background'
                        )}
                      >
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center',
                            !alt.isCorrect && 'invisible'
                          )}
                        >
                          <Check className="size-3.5" />
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
                              className="h-auto max-w-xs rounded"
                            />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {t('questions.viewDialog.correctAnswer')}
                  </p>
                  {isLoading ? (
                    <p className="text-sm text-muted-foreground">
                      {t('questions.viewDialog.loading')}
                    </p>
                  ) : completionAnswer ? (
                    <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                      {completionAnswer}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {t('questions.viewDialog.noAnswer')}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5 border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  {t('questions.viewDialog.explanationText')}
                </p>
                {isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    {t('questions.viewDialog.loading')}
                  </p>
                ) : (
                  <>
                    {correctAnswerLabel && (
                      <p className="text-sm font-semibold">
                        {t('questions.viewDialog.correctAnswerLine', {
                          answer: correctAnswerLabel,
                        })}
                      </p>
                    )}
                    {explanationText ? (
                      <>
                        <RenderedText
                          value={explanationText}
                          images={availableExplanationImages}
                          className="prose prose-sm dark:prose-invert max-w-none text-sm"
                        />
                        {explanationViewUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Immagine spiegazione ${idx + 1}`}
                            className="mt-2 h-auto max-w-full rounded"
                          />
                        ))}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {t('questions.viewDialog.noExplanation')}
                      </p>
                    )}
                    {/* 5 controlli di qualità — in teoria ogni domanda dovrebbe superarli
                        tutti. Dopo la correzione commentata, prima della fonte. */}
                    {qualityChecks && (
                      <div className="space-y-3 border-t pt-4">
                        <p className="text-xs text-muted-foreground">Controlli di qualità</p>
                        <div className="space-y-3">
                          {qualityChecks.map((check) => (
                            <div key={check.title} className="flex items-start gap-2.5">
                              {check.passed ? (
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-400" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{check.title}</p>
                                <p className="text-xs text-muted-foreground">{check.subtitle}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {source && (
                      <div className="space-y-2 pt-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <BookOpen className="size-3.5" />
                          Fonte
                        </p>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-semibold">Manuale:</span> {source.manuale}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Capitolo:</span> {source.capitolo}
                          </p>
                          <p className="text-sm">
                            <span className="font-semibold">Pagina:</span> {source.pagina}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => setShowPassageDialog(true)}
                        >
                          <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                          Vedi il passaggio
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

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

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                {t('common.close')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Stesso dialog "Fonte" del post-generazione, stesso formato di citazione compatto
          nella descrizione. Qui però non c'è un passaggio salvato da mostrare (vedi nota
          sopra) — il corpo lo dice onestamente invece di inventare una citazione. */}
      <Dialog open={showPassageDialog} onOpenChange={setShowPassageDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Fonte</DialogTitle>
            {source && (
              <DialogDescription>
                {source.manuale}
                {source.capitolo && ` — ${source.capitolo}`} · p. {source.pagina}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="rounded-lg bg-muted/50 p-5">
            {simulatedPassage ? (
              <p className="text-sm leading-relaxed">{simulatedPassage}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nessun passaggio salvato per questa domanda.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
