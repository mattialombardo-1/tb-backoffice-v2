import { Card, CardContent } from '@/components/ui/card';
import { BatchColumnHeader, BatchQuestionRow } from './MyReviewsBatchGroup';
import type { ReviewBatchQuestion } from '@/lib/hooks/useReviewBatches';

/**
 * Tab "Domande singole" di MyReviewsPage — domande sotto MIN_BATCH_SIZE (useReviewBatches,
 * campo `unbatched`), quindi senza nulla da raggruppare: niente accordion, niente Esito/Stato
 * di batch (sono proprietà di una generazione, non di una domanda isolata — vedi la
 * discussione in design/notes), solo la stessa intestazione/riga già usata dentro un batch
 * aperto. `startIndex` continua la numerazione da dove l'ha lasciata la pagina precedente
 * (posizione nell'elenco filtrato, non nella pagina) invece di ripartire da 1 ogni pagina.
 */
export function MyReviewsSingleList({
  questions,
  startIndex,
  selectionMode,
  selectedIds,
  onToggleQuestion,
}: {
  questions: ReviewBatchQuestion[];
  startIndex: number;
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleQuestion: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <BatchColumnHeader selectionMode={selectionMode} />
        {questions.map((q, i) => (
          <div key={q.id} className="border-b last:border-b-0">
            <BatchQuestionRow
              question={q}
              index={startIndex + i}
              selectionMode={selectionMode}
              selected={selectedIds.has(q.id)}
              onToggleSelected={() => onToggleQuestion(q.id)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
