import ExcelJS from 'exceljs';
import type { QuestionListItem } from '@/lib/types/questions';
import { buildExportColumns, buildExportRow } from './questionExportColumns';
import type { GenerateQuestionsExportOptions } from './generateQuestionsCsv';

/**
 * Builds an XLSX workbook from an ordered list of questions, using the exact
 * same column names/order as generateQuestionsCsv/the import template.
 */
export async function generateQuestionsXlsx(
  data: QuestionListItem[],
  opts: GenerateQuestionsExportOptions = {}
): Promise<Blob> {
  const maxAlternatives = data.reduce((max, q) => Math.max(max, q.alternatives.length), 0);
  const columns = buildExportColumns(maxAlternatives);
  const resolveImageUrl = opts.resolveImageUrl ?? ((u: string) => u);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Domande');
  sheet.addRow(columns);
  for (const q of data) {
    const row = buildExportRow(q, columns, {
      associations: opts.associationsById?.get(q.id),
      resolveImageUrl,
    });
    sheet.addRow(columns.map((c) => row[c] ?? ''));
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
