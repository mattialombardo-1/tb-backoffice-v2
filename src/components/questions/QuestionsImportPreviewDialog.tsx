import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, QUESTION_TYPE_LABELS } from '@/lib/types/questions';
import type { ParsedQuestionRow } from '@/lib/types/questionsImport';
import { renderLatexWithImages } from '@/components/rich-editor/latex-utils';

interface QuestionsImportPreviewDialogProps {
  row: ParsedQuestionRow | null;
  /** Resolved hierarchy names for display (fall back to the raw id when unknown). */
  materiaName?: string;
  argomentoName?: string;
  sottoArgomentoName?: string;
  onClose: () => void;
}

type ImageVar = { id: string; url: string };

/**
 * Renders text substituting `&&imageN&&` placeholders with the N-th image URL,
 * identical to the question create/edit/view behavior (`renderLatexWithImages`).
 */
function RenderedText({
  value,
  images,
  className,
}: {
  value: string;
  images: ImageVar[];
  className?: string;
}) {
  const html = useMemo(() => renderLatexWithImages(value, images), [value, images]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Maps an ordered list of image URLs to placeholder ids (image1, image2, …). */
function toImageVars(urls: string[]): ImageVar[] {
  return urls.map((url, i) => ({ id: `image${i + 1}`, url }));
}

export function QuestionsImportPreviewDialog({
  row,
  materiaName,
  argomentoName,
  sottoArgomentoName,
  onClose,
}: QuestionsImportPreviewDialogProps) {
  const questionImages = useMemo(() => toImageVars(row?.questionImages ?? []), [row]);
  const explanationImages = useMemo(() => toImageVars(row?.explanationImages ?? []), [row]);

  return (
    <Dialog open={!!row} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="min-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Anteprima domanda (riga {row?.rowNumber})</DialogTitle>
        </DialogHeader>

        {row && (
          <div className="space-y-4">
            {/* Metadata badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline">{QUESTION_TYPE_LABELS[row.type]}</Badge>
              <Badge variant="outline">{DIFFICULTY_LABELS[row.difficulty]}</Badge>
              <Badge variant="outline">{LANGUAGE_LABELS[row.language]}</Badge>
              {row.isUpdate ? (
                <Badge variant="secondary">Aggiorna · {row.id}</Badge>
              ) : (
                <Badge variant="secondary">Nuova</Badge>
              )}
            </div>

            {/* Hierarchy */}
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Materia</span>
              <span className="font-medium">{materiaName ?? row.subjectId}</span>
              <span className="text-muted-foreground">Argomento</span>
              <span className="font-medium">{argomentoName ?? row.topicId}</span>
              {row.sottoArgomentoId && (
                <>
                  <span className="text-muted-foreground">Sotto-argomento</span>
                  <span className="font-medium">{sottoArgomentoName ?? row.sottoArgomentoId}</span>
                </>
              )}
            </div>

            <Separator />

            {/* Question text */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Testo domanda</p>
              <RenderedText
                value={row.questionText}
                images={questionImages}
                className="text-sm prose prose-sm dark:prose-invert max-w-none"
              />
            </div>

            <Separator />

            {/* Alternatives */}
            {row.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Alternative</p>
                {row.alternatives.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nessuna alternativa.</p>
                ) : (
                  <div className="space-y-1.5">
                    {row.alternatives.map((alt, idx) => (
                      <div
                        key={alt.order}
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
                              images={questionImages}
                              className="prose prose-sm dark:prose-invert max-w-none"
                            />
                          )}
                          {alt.image && (
                            <img
                              src={alt.image}
                              alt={`Immagine alternativa ${String.fromCharCode(65 + idx)}`}
                              className="max-h-32 w-auto rounded border object-contain"
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
            {row.type === 'COMPLETION' && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Risposta corretta</p>
                {row.completionAnswer ? (
                  <p className="text-sm rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-2">
                    {row.completionAnswer}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Nessuna risposta.</p>
                )}
              </div>
            )}

            <Separator />

            {/* Explanation */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Spiegazione</p>
              {row.explanationText ? (
                <RenderedText
                  value={row.explanationText}
                  images={explanationImages}
                  className="text-sm prose prose-sm dark:prose-invert max-w-none"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Nessuna spiegazione.</p>
              )}
            </div>

            {row.rowErrors.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">Errori di validazione</p>
                  <ul className="list-disc pl-5 text-sm text-destructive">
                    {row.rowErrors.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <Separator />

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Chiudi
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
