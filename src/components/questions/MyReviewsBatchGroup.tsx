import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, Eye, Layers, ScanEye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReviewBatch, ReviewBatchQuestion } from '@/lib/hooks/useReviewBatches';
import { QuestionsViewDialog } from './QuestionsViewDialog';

// Stessi colori di STATUS_CONFIG in QuestionsListTable.tsx (TO_REVIEW/ACTIVE) — il conteggio
// qui riflette lo stesso stato, quindi la stessa palette in tutto il backoffice.
const PENDING_TAG_CLASSNAME =
  'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300';
const REVIEWED_TAG_CLASSNAME =
  'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

function BatchQuestionRow({ question, index }: { question: ReviewBatchQuestion; index: number }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reviewed = question.reviewedInSession;
  const preview = question.questionText.replace(/<[^>]+>/g, '').slice(0, 100);
  // Riusa QuestionsViewDialog (già usato in QuestionsListPage) — recupera la domanda
  // per intero dal backend e mostra davvero tutte le informazioni, non solo quello che
  // già vediamo troncato in riga.
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 px-5 py-3 transition-colors',
        reviewed ? 'opacity-50' : 'hover:bg-accent/30'
      )}
    >
      <div className="min-w-0">
        <p className={cn('truncate text-sm font-medium', reviewed && 'line-through')}>
          <span className="mr-1.5 text-muted-foreground">{index}.</span>
          {preview || <span className="text-muted-foreground italic">{t('myReviews.noText')}</span>}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{question.argomentoName}</p>
      </div>
      {reviewed ? (
        <span className="shrink-0 text-xs text-muted-foreground">Revisionata</span>
      ) : (
        <div className="flex shrink-0 items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="h-4 w-4" />
            Anteprima
          </Button>
          <Button
            size="sm"
            className="shrink-0 gap-1.5"
            onClick={() =>
              navigate({
                to: '/questions/$questionId',
                params: { questionId: question.id },
                search: { review: true },
              })
            }
          >
            <ScanEye className="h-4 w-4" />
            {t('myReviews.review')}
          </Button>
          <QuestionsViewDialog
            question={previewOpen ? question : null}
            onClose={() => setPreviewOpen(false)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Proposta di design — un batch di domande generate insieme (stessa materia, stesso giorno),
 * mostrato come blocco a sé sopra il "listone" piatto delle revisioni singole. Dentro, le
 * domande ancora da revisionare stanno in evidenza in alto; quelle già revisionate in questa
 * sessione scendono in fondo, attenuate. Il blocco sparisce da solo quando non resta più
 * nulla da revisionare — nessuna azione manuale di chiusura.
 */
export function MyReviewsBatchGroup({ batch }: { batch: ReviewBatch }) {
  const [open, setOpen] = useState(false);

  // Ordine e numerazione stabili sulla data di creazione (= ordine di generazione), non
  // sull'ordine restituito dal server — così un numero resta lo stesso anche quando la
  // domanda scende da "da revisionare" a "già revisionate", e le righe appaiono in ordine.
  const byCreatedAt = (a: ReviewBatchQuestion, b: ReviewBatchQuestion) =>
    a.createdAt.localeCompare(b.createdAt);
  const numberById = new Map(
    [...batch.pending, ...batch.reviewed].sort(byCreatedAt).map((q, i) => [q.id, i + 1])
  );
  const sortedPending = [...batch.pending].sort(byCreatedAt);
  const sortedReviewed = [...batch.reviewed].sort(byCreatedAt);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/30"
      >
        <div className="flex items-center gap-3">
          <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">
                {batch.materiaName} · {batch.dateLabel}
              </p>
              <Badge variant="outline" className="font-normal text-muted-foreground">
                {batch.pending.length + batch.reviewed.length} domande
              </Badge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="outline" className={PENDING_TAG_CLASSNAME}>
                {batch.pending.length} da revisionare
              </Badge>
              <Badge variant="outline" className={REVIEWED_TAG_CLASSNAME}>
                {batch.reviewed.length} già revisionate
              </Badge>
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <CardContent className="border-t p-0">
          {sortedPending.map((q) => (
            <div key={q.id} className="border-b last:border-b-0">
              <BatchQuestionRow question={q} index={numberById.get(q.id) ?? 0} />
            </div>
          ))}
          {sortedReviewed.map((q) => (
            <div key={q.id} className="border-b last:border-b-0">
              <BatchQuestionRow question={q} index={numberById.get(q.id) ?? 0} />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
