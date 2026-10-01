/**
 * Registro in memoria (sopravvive alla navigazione dentro la SPA, non a un refresh —
 * stesso limite di seenBatchMembers in useReviewBatches) di quale "generazione" ha
 * prodotto ogni domanda, e da quale entry point. Il backend reale (anche mock) non ha
 * un campo libero sulla domanda dove salvare questa informazione —
 * additionalProperties: false — quindi l'unica strada è tenerla lato client.
 *
 * Serve a garantire due regole:
 * 1. ogni generazione bulk (ogni "Crea Bozze" → "Manda in revisione" da
 *    QuestionGenerationStep) forma un batch a sé in "Domande da revisionare", anche
 *    quando materia, argomento e data coincidono con una generazione precedente — cosa
 *    che il solo raggruppamento per attributi (vedi useReviewBatches) non può
 *    garantire, perché due generazioni distinte con gli stessi attributi sarebbero
 *    altrimenti indistinguibili;
 * 2. una domanda creata una per volta (QuestionCreateManualPage) non diventa MAI parte
 *    di un gruppo, nemmeno per coincidenza di materia + argomento + giorno con un'altra
 *    domanda singola o con un batch bulk — `kind` è il dato esplicito che toglie
 *    useReviewBatches dal doverlo indovinare dal conteggio o dagli attributi.
 *
 * Dopo un refresh questa mappa è vuota: useReviewBatches torna a raggruppare per
 * attributi (materia + argomento + data, soglia minima 2 — il "meglio possibile" senza
 * un'origine nota, stesso limite di prima).
 */
export type GenerationKind = 'group' | 'single';

const questionToGeneration = new Map<string, { generationId: string; kind: GenerationKind }>();

/** Nuovo id di generazione — uno per ogni volta che si apre il riepilogo post-generazione
 *  (QuestionGenerationStep viene rimontato a ogni "Crea Bozze": vedi il suo useState), o
 *  per ogni domanda creata una per volta (QuestionCreateManualPage: un id a sé a ogni
 *  invio, mai condiviso — è lui a garantire che non si raggruppi mai con nient'altro). */
export function createGenerationId(): string {
  return crypto.randomUUID();
}

/** Registra a quale generazione appartiene una domanda, e da quale entry point —
 *  'group' da QuestionGenerationStep (il flusso bulk), 'single' da
 *  QuestionCreateManualPage (una domanda alla volta). Va chiamata con l'id reale
 *  restituito dalla creazione, non con l'id locale del draft. */
export function recordGeneratedQuestion(
  questionId: string,
  generationId: string,
  kind: GenerationKind
): void {
  questionToGeneration.set(questionId, { generationId, kind });
}

/** `undefined` se la domanda non è stata generata in questa sessione (creata prima di un
 *  refresh, o non tramite uno di questi due flussi) — il chiamante ricade sul
 *  raggruppamento per attributi. */
export function getGeneration(
  questionId: string
): { generationId: string; kind: GenerationKind } | undefined {
  return questionToGeneration.get(questionId);
}
