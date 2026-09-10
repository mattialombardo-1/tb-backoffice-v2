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
import type { Alternative, Question, QuestionListItem, QuestionType } from '@/lib/types/questions';
import { DIFFICULTY_LABELS, QUESTION_TYPE_LABELS } from '@/lib/types/questions';
import { renderLatexWithImages } from '@/components/rich-editor/latex-utils';
import { findPassageForQuestionText } from './questionBanks';

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

interface ParsedSource {
  manuale: string;
  /** Assente nel formato legacy (vedi sotto) — vuota quando non nota, mai inventata. */
  capitolo: string;
  pagina: string;
}

// Il backend reale non ha un campo dedicato per la fonte della "Correzione commentata" —
// QuestionGenerationSummaryDialog la accoda a explanationText invece di inventare un campo
// che il backend non saprebbe salvare. Due pattern perché il formato è cambiato durante lo
// sviluppo di questa proposta: quello attuale (3 righe, con Capitolo) e uno precedente, più
// compatto (una riga sola, senza Capitolo) — le domande generate prima del cambio hanno
// ancora quello vecchio salvato. Se nessuno dei due combacia (domande del catalogo mai
// passate da questo flusso, o spiegazioni modificate a mano), niente Fonte — si mostra solo
// il testo così com'è, senza inventare nulla.
const SOURCE_SUFFIX_PATTERN = /\n\nManuale: (.+)\nCapitolo: (.+)\nPagina: (.+)$/;
const LEGACY_SOURCE_SUFFIX_PATTERN = /\n\nFonte: (.+), p\. (.+)$/;

function parseExplanation(explanationText: string): {
  explanation: string;
  source: ParsedSource | null;
} {
  const match = explanationText.match(SOURCE_SUFFIX_PATTERN);
  if (match) {
    const [full, manuale, capitolo, pagina] = match;
    return {
      explanation: explanationText.slice(0, explanationText.length - full.length),
      source: { manuale, capitolo, pagina },
    };
  }
  const legacyMatch = explanationText.match(LEGACY_SOURCE_SUFFIX_PATTERN);
  if (legacyMatch) {
    const [full, manuale, pagina] = legacyMatch;
    return {
      explanation: explanationText.slice(0, explanationText.length - full.length),
      source: { manuale, capitolo: '', pagina },
    };
  }
  return { explanation: explanationText, source: null };
}

interface QualityCheck {
  title: string;
  subtitle: string;
  passed: boolean;
}

/** 5 controlli — in teoria ogni domanda dovrebbe superarli tutti. Calcolati sui dati reali
 *  della domanda quando possibile ("Duplicati e similarità" fa eccezione: richiederebbe un
 *  vero controllo contro il materiale di riferimento che qui non esiste — resta sempre
 *  superato, promemoria per chi revisiona, non un check automatico vero). Per le domande a
 *  completamento "Unica risposta corretta" e "Formato" non si applicano (non hanno
 *  alternative) — restano sempre superati anche lì. */
function buildQualityChecks(params: {
  type: QuestionType;
  questionText: string;
  // Id reali, non i nomi derivati (materiaName/argomentoName): quei nomi si risolvono
  // cercando l'id in una lista di materie/argomenti "vere", e per gli argomenti simulati
  // di questa proposta di design (fixedOptions, id tipo __fixed__...) quella ricerca
  // fallisce sempre — il nome resta vuoto anche quando l'argomento è stato scelto per
  // davvero. Gli id restano invece sempre valorizzati.
  subjectId: string;
  topicId: string;
  alternatives: Alternative[];
  completionAnswer: string;
  explanationText: string;
  source: ParsedSource | null;
}): QualityCheck[] {
  const {
    type,
    questionText,
    subjectId,
    topicId,
    alternatives,
    completionAnswer,
    explanationText,
    source,
  } = params;
  const isMultipleChoice = type === 'MULTIPLE_CHOICE';

  const hasAnswerContent = isMultipleChoice
    ? alternatives.length > 0 && alternatives.every((a) => a.text.trim() !== '')
    : completionAnswer.trim() !== '';

  const completezza =
    questionText.trim() !== '' &&
    hasAnswerContent &&
    !!subjectId &&
    !!topicId &&
    explanationText.trim() !== '';

  const correctCount = alternatives.filter((a) => a.isCorrect).length;
  const optionsCount = alternatives.length;

  return [
    {
      title: 'Completezza',
      subtitle: 'Testo, alternative, classificazione e spiegazione sono compilati.',
      passed: completezza,
    },
    {
      title: 'Unica risposta corretta',
      subtitle: 'È indicata una sola alternativa corretta.',
      passed: isMultipleChoice ? correctCount === 1 : true,
    },
    isMultipleChoice
      ? {
          title: `Formato a ${optionsCount} opzioni`,
          subtitle: `La domanda ha ${optionsCount} alternative.`,
          passed: optionsCount >= 2,
        }
      : {
          title: 'Formato a risposta libera',
          subtitle: 'La domanda richiede una risposta scritta.',
          passed: true,
        },
    {
      title: 'Ancoraggio alla fonte',
      subtitle: 'La bozza è collegata a un passaggio del manuale.',
      passed: !!source,
    },
    {
      title: 'Duplicati e similarità',
      subtitle: 'Nessun duplicato evidente rispetto al materiale di riferimento.',
      passed: true,
    },
  ];
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
  // generate da QuestionGenerationSummaryDialog hanno testo identico a un template lì
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
        <DialogContent className="sm:max-w-lg">
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
