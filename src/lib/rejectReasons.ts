/**
 * Motivi di rigetto — un dropdown fisso più "Altro" con testo libero, così chi ha
 * generato/scritto la domanda ha un feedback concreto su cosa correggere. Condiviso tra il
 * rigetto singolo (QuestionEditContent) e quello bulk (MyReviewsBulkRejectDialog): stessa
 * lista, stessa UX, una sola motivazione ogni volta (anche nel bulk — condivisa per tutta
 * la selezione, non una a domanda).
 */
export const REJECT_REASONS = [
  'Errore scientifico o risposta errata',
  'Domanda ambigua o incompleta',
  'Spiegazione insufficiente o incoerente',
  'Duplicata o troppo simile a una domanda esistente',
  'Fuori programma o classificata in modo errato',
  'Altro',
] as const;

export const REJECT_CUSTOM_REASON = 'Altro';
export const REJECT_CUSTOM_TEXT_MAX = 125;
