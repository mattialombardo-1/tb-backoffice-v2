const QUESTION_ID_COLUMN = 'questionId';

/** Thrown when the CSV has no `questionId` header column. */
export class CsvMissingColumnError extends Error {
  readonly column: string;
  constructor(column: string) {
    super(`Malformed CSV: missing "${column}" column`);
    this.name = 'CsvMissingColumnError';
    this.column = column;
  }
}

/**
 * Parses a CSV and extracts the ordered list of question IDs from its
 * `questionId` column (case-insensitive header match). Any other columns are
 * ignored. Quoted fields (which may contain commas/newlines) are handled.
 *
 * - Values are trimmed; empty cells are dropped.
 * - Duplicates are removed while preserving first-seen order.
 *
 * @throws {CsvMissingColumnError} if the `questionId` column is absent.
 */
export function parseIdsCsv(text: string): string[] {
  const records = parseCsvRecords(text);
  if (records.length === 0) throw new CsvMissingColumnError(QUESTION_ID_COLUMN);

  const header = records[0].map((h) => h.trim().toLowerCase());
  const colIdx = header.indexOf(QUESTION_ID_COLUMN.toLowerCase());
  if (colIdx === -1) throw new CsvMissingColumnError(QUESTION_ID_COLUMN);

  const seen = new Set<string>();
  const ids: string[] = [];
  for (let r = 1; r < records.length; r++) {
    const id = (records[r][colIdx] ?? '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

/** Standard CSV parser handling quoted fields, escaped quotes (""), and CRLF/LF. */
function parseCsvRecords(text: string): string[][] {
  const records: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      // Consume \r\n as a single break.
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      records.push(row);
      row = [];
    } else {
      field += c;
    }
  }

  // Flush trailing field/row (file without final newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    records.push(row);
  }

  // Drop fully-empty records (e.g. trailing blank line).
  return records.filter((r) => r.some((cell) => cell.trim() !== ''));
}
