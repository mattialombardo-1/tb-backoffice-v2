/**
 * Registro in memoria (sopravvive alla navigazione dentro la SPA, non a un refresh —
 * stesso limite di seenBatchMembers in useReviewBatches) di quale "generazione" ha
 * prodotto ogni domanda. Il backend reale (anche mock) non ha un campo libero sulla
 * domanda dove salvare un id di generazione — additionalProperties: false — quindi
 * l'unica strada è tenerlo lato client.
 *
 * Serve a garantire la regola d'oro: ogni generazione (ogni "Crea Bozze" → "Manda in
 * revisione") forma un batch a sé in "Domande da revisionare", anche quando materia,
 * argomento e data coincidono con una generazione precedente — cosa che il solo
 * raggruppamento per attributi (vedi useReviewBatches) non può garantire, perché due
 * generazioni distinte con gli stessi attributi sarebbero altrimenti indistinguibili.
 *
 * Dopo un refresh questa mappa è vuota: useReviewBatches torna a raggruppare per
 * materia + argomento + data (il "meglio possibile" senza un id persistito).
 */
const questionToGenerationId = new Map<string, string>();

/** Nuovo id di generazione — uno per ogni volta che si apre il riepilogo post-generazione
 *  (QuestionGenerationStep viene rimontato a ogni "Crea Bozze": vedi il suo useState). */
export function createGenerationId(): string {
  return crypto.randomUUID();
}

/** Registra a quale generazione appartiene una domanda, appena creata per davvero sul
 *  backend (mock) — va chiamata con l'id reale restituito dalla creazione, non con
 *  l'id locale del draft. */
export function recordGeneratedQuestion(questionId: string, generationId: string): void {
  questionToGenerationId.set(questionId, generationId);
}

/** `undefined` se la domanda non è stata generata in questa sessione (creata prima di un
 *  refresh, o non tramite questo flusso) — il chiamante ricade sul raggruppamento per
 *  attributi. */
export function getGenerationId(questionId: string): string | undefined {
  return questionToGenerationId.get(questionId);
}
