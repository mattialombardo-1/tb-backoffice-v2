import { format } from 'date-fns';
import type { QuestionAssociations, QuestionListItem } from '@/lib/types/questions';
import { TEMPLATE_COLUMNS } from '@/lib/csv/questionsCsvTemplate';

// The shipped import template only shows 5 opzione_N pairs, but the question
// editor (AlternativesList.tsx) allows up to 15 alternatives. Widening the
// block when needed avoids silently dropping alternatives 6+ on export.
const MIN_OPTION_SLOTS = 5;
const MAX_OPTION_SLOTS = 15;

const EXTRA_COLUMNS = ['data_inserimento', 'collezioni', 'pool'] as const;

/**
 * Column list for a question export file: the import template's columns
 * (id..revisore_email, same names/order — so the file can be re-imported
 * as-is), with the opzione_N/immagine_opzione_N block widened if any
 * exported question has more than 5 alternatives, plus informational
 * columns the import format has no equivalent for (creation date,
 * collection/pool membership).
 */
export function buildExportColumns(maxAlternatives: number): string[] {
  const optionSlots = Math.min(MAX_OPTION_SLOTS, Math.max(MIN_OPTION_SLOTS, maxAlternatives));
  const optionsStart = TEMPLATE_COLUMNS.indexOf('opzione_1');
  const optionsEnd = TEMPLATE_COLUMNS.indexOf('immagine_opzione_5') + 1;

  const before = TEMPLATE_COLUMNS.slice(0, optionsStart);
  const after = TEMPLATE_COLUMNS.slice(optionsEnd);
  const optionCols = Array.from({ length: optionSlots }, (_, i) => `opzione_${i + 1}`);
  const optionImageCols = Array.from(
    { length: optionSlots },
    (_, i) => `immagine_opzione_${i + 1}`
  );

  return [...before, ...optionCols, ...optionImageCols, ...after, ...EXTRA_COLUMNS];
}

export interface ExportRowContext {
  associations?: QuestionAssociations;
  /** Swaps a stored image reference (S3 key or URL) for a display URL. */
  resolveImageUrl: (original: string) => string;
}

/** Builds one export row (keyed by column name) for a single question. */
export function buildExportRow(
  q: QuestionListItem,
  columns: string[],
  ctx: ExportRowContext
): Record<string, string> {
  const sortedAlts = [...q.alternatives].sort((a, b) => a.order - b.order);
  const correctIndex = sortedAlts.findIndex((a) => a.isCorrect);

  const row: Record<string, string> = {
    id: q.id,
    materia_id: q.subjectId,
    argomento_id: q.topicId,
    sotto_argomento_id: q.sottoArgomentoId || '',
    tipologia: q.type,
    difficolta: q.difficulty,
    lingua: q.language,
    testo: q.questionText,
    spiegazione: q.explanationText,
    immagini_domanda: q.questionImages.map(ctx.resolveImageUrl).join('|'),
    immagini_spiegazione: q.explanationImages.map(ctx.resolveImageUrl).join('|'),
    corretta: q.type === 'MULTIPLE_CHOICE' && correctIndex >= 0 ? String(correctIndex + 1) : '',
    risposta: q.type === 'COMPLETION' ? q.completionAnswer : '',
    revisore_email: q.reviewerEmail ?? '',
    data_inserimento: format(new Date(q.createdAt), 'dd/MM/yyyy HH:mm'),
    collezioni: (ctx.associations?.collections ?? []).map((c) => c.name).join('|'),
    pool: (ctx.associations?.pools ?? []).map((p) => p.name).join('|'),
  };

  for (const col of columns) {
    if (col.startsWith('immagine_opzione_')) {
      const idx = Number(col.slice('immagine_opzione_'.length)) - 1;
      const img = sortedAlts[idx]?.image;
      row[col] = img ? ctx.resolveImageUrl(img) : '';
    } else if (col.startsWith('opzione_')) {
      const idx = Number(col.slice('opzione_'.length)) - 1;
      row[col] = sortedAlts[idx]?.text ?? '';
    }
  }

  return row;
}
