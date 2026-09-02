import type { QuestionAssociations, QuestionListItem } from '@/lib/types/questions';
import { buildExportColumns, buildExportRow } from './questionExportColumns';

export interface GenerateQuestionsExportOptions {
  associationsById?: Map<string, QuestionAssociations>;
  resolveImageUrl?: (original: string) => string;
}

/**
 * Builds a CSV string from an ordered list of questions, using the exact same
 * column names/order as the import template (see questionExportColumns.ts) so
 * the file can be analysed, edited, and re-imported without reorganizing it.
 * The row order matches the input array order (selection order / imported-CSV
 * order). Fields are escaped by wrapping in double quotes and doubling any
 * embedded double quotes.
 */
export function generateQuestionsCsv(
  data: QuestionListItem[],
  opts: GenerateQuestionsExportOptions = {}
): string {
  const maxAlternatives = data.reduce((max, q) => Math.max(max, q.alternatives.length), 0);
  const columns = buildExportColumns(maxAlternatives);
  const resolveImageUrl = opts.resolveImageUrl ?? ((u: string) => u);

  const escape = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;
  const rows = data.map((q) => {
    const row = buildExportRow(q, columns, {
      associations: opts.associationsById?.get(q.id),
      resolveImageUrl,
    });
    return columns.map((c) => escape(row[c] ?? '')).join(',');
  });

  return [columns.map(escape).join(','), ...rows].join('\n');
}
