import { useMemo } from 'react';
import type { QuestionListItem } from '@/lib/types/questions';
import { useMyReviews } from './useMyReviews';

export interface ReviewBatchQuestion extends QuestionListItem {
  /** true = revisionata in questa sessione (non più TO_REVIEW sul server, ma la teniamo
   *  visibile — attenuata, in fondo — finché il batch non è completamente svuotato). */
  reviewedInSession: boolean;
}

export interface ReviewBatch {
  key: string;
  subjectId: string;
  materiaName: string;
  dateLabel: string;
  pending: ReviewBatchQuestion[];
  reviewed: ReviewBatchQuestion[];
}

// Proposta di design: un batch "vero" ha più di una domanda — un singolo invio isolato non
// è una generazione, resta nella lista piatta sotto.
const MIN_BATCH_SIZE = 2;

// Proposta di design — memoria di sessione (sopravvive alla navigazione dentro la SPA, non
// a un refresh, come il resto del prototipo). L'endpoint reale (/questions/my-reviews)
// restituisce solo le domande ancora TO_REVIEW: appena una viene approvata sparisce dalla
// risposta. Questa mappa ricorda, per ogni batch, tutte le domande viste "da revisionare"
// in questa visita, così quelle appena approvate restano un attimo visibili invece di
// sparire di scatto — e il batch si toglie da solo quando non ne resta più nessuna da fare.
const seenBatchMembers = new Map<string, Map<string, QuestionListItem>>();

function dateKey(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT');
}

function makeBatchKey(subjectId: string, dKey: string): string {
  return `${subjectId}::${dKey}`;
}

/**
 * Wrapper su `useMyReviews` che raggruppa le domande "da revisionare" per materia + data di
 * creazione (una generazione riguarda sempre una sola materia, quindi basta questo — vedi
 * design/CLAUDE.md per il resto del ragionamento), con lo split tra quelle ancora da
 * revisionare e quelle già revisionate in questa sessione.
 */
export function useReviewBatches() {
  const { questions, ...rest } = useMyReviews();

  const batches = useMemo(() => {
    const liveIds = new Set(questions.map((q) => q.id));
    const meta = new Map<string, { subjectId: string; materiaName: string; dateLabel: string }>();

    for (const q of questions) {
      const dKey = dateKey(q.createdAt);
      const key = makeBatchKey(q.subjectId, dKey);
      if (!seenBatchMembers.has(key)) seenBatchMembers.set(key, new Map());
      seenBatchMembers.get(key)!.set(q.id, q);
      if (!meta.has(key))
        meta.set(key, { subjectId: q.subjectId, materiaName: q.materiaName, dateLabel: dKey });
    }

    const result: ReviewBatch[] = [];
    for (const [key, members] of seenBatchMembers) {
      const pending: ReviewBatchQuestion[] = [];
      const reviewed: ReviewBatchQuestion[] = [];
      for (const [id, q] of members) {
        if (liveIds.has(id)) {
          pending.push({ ...q, reviewedInSession: false });
        } else {
          reviewed.push({ ...q, reviewedInSession: true });
        }
      }
      // Niente più da revisionare → il batch è chiuso, non lo mostriamo più.
      if (pending.length === 0) continue;

      const info = meta.get(key) ?? {
        subjectId: pending[0].subjectId,
        materiaName: pending[0].materiaName,
        dateLabel: dateKey(pending[0].createdAt),
      };
      result.push({ key, ...info, pending, reviewed });
    }

    return result
      .filter((b) => b.pending.length + b.reviewed.length >= MIN_BATCH_SIZE)
      .sort((a, b) => b.pending.length - a.pending.length);
  }, [questions]);

  const batchedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const b of batches) {
      for (const q of b.pending) ids.add(q.id);
    }
    return ids;
  }, [batches]);

  const unbatched = useMemo(
    () => questions.filter((q) => !batchedIds.has(q.id)),
    [questions, batchedIds]
  );

  return { batches, unbatched, ...rest };
}
