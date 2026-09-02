import Papa from 'papaparse';
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  type DifficultyLevel,
  type QuestionLanguage,
  type QuestionType,
} from '@/lib/types/questions';
import type {
  ParseQuestionsCsvResult,
  ParsedAlternative,
  ParsedQuestionRow,
} from '@/lib/types/questionsImport';

/** Columns that must be present in the CSV header (case-insensitive). */
const REQUIRED_COLUMNS = [
  'materia_id',
  'argomento_id',
  'tipologia',
  'difficolta',
  'lingua',
  'testo',
  'spiegazione',
] as const;

// Matches AlternativesList.tsx's MAX_ALTERNATIVES — the question editor allows
// up to 15 alternatives, so an exported/re-imported CSV must round-trip that many.
const MAX_OPTIONS = 15;

const DIFFICULTY_VALUES = Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[];
const LANGUAGE_VALUES = Object.keys(LANGUAGE_LABELS) as QuestionLanguage[];

type RawRow = Record<string, string>;

const normalizeHeader = (h: string) => h.trim().toLowerCase();

const cell = (row: RawRow, key: string): string => (row[key] ?? '').trim();

/** Case-insensitive resolve of a raw value against a set of allowed enum values. */
function resolveEnum<T extends string>(raw: string, allowed: T[]): T | null {
  const lower = raw.trim().toLowerCase();
  return allowed.find((v) => v.toLowerCase() === lower) ?? null;
}

function resolveType(raw: string): QuestionType | null {
  const lower = raw.trim().toLowerCase();
  if (lower === 'multiple_choice') return 'MULTIPLE_CHOICE';
  if (lower === 'completion') return 'COMPLETION';
  return null;
}

const URL_RE = /^https?:\/\/\S+$/i;

/** Splits a `|`-separated cell into image URLs, pushing a rowError for malformed entries. */
function parseImageUrls(raw: string, label: string, rowErrors: string[]): string[] {
  const urls = raw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
  urls.forEach((u) => {
    if (!URL_RE.test(u)) rowErrors.push(`${label}: "${u}" non è un URL valido`);
  });
  return urls;
}

/**
 * Parses a raw CSV string (comma- or semicolon-separated) into question rows.
 * Header/file problems land in `errors` (block the whole import); per-row problems
 * land in each row's `rowErrors` (block that row only).
 */
export function parseQuestionsCsv(text: string): ParseQuestionsCsvResult {
  const parsed = Papa.parse<RawRow>(text, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: normalizeHeader,
  });

  const fields = (parsed.meta.fields ?? []).map(normalizeHeader);

  const missing = REQUIRED_COLUMNS.filter((c) => !fields.includes(c));
  if (missing.length > 0) {
    return {
      rows: [],
      errors: [`Colonne obbligatorie mancanti: ${missing.join(', ')}`],
    };
  }

  const dataRows = parsed.data.filter((r) => Object.values(r).some((v) => (v ?? '').trim() !== ''));
  if (dataRows.length === 0) {
    return { rows: [], errors: ['Il CSV non contiene righe di dati.'] };
  }

  const optionColumns = fields
    .filter((f) => /^opzione_\d+$/.test(f))
    .map((f) => ({ column: f, index: Number(f.split('_')[1]) }))
    .filter((o) => o.index >= 1 && o.index <= MAX_OPTIONS)
    .sort((a, b) => a.index - b.index);

  const rows: ParsedQuestionRow[] = dataRows.map((raw, i) => {
    const rowNumber = i + 1;
    const rowErrors: string[] = [];

    const id = cell(raw, 'id') || null;
    const subjectId = cell(raw, 'materia_id');
    const topicId = cell(raw, 'argomento_id');
    const sottoArgomentoId = cell(raw, 'sotto_argomento_id') || null;
    const questionText = cell(raw, 'testo');
    const explanationText = cell(raw, 'spiegazione');
    const reviewerEmail = cell(raw, 'revisore_email') || null;
    const questionImages = parseImageUrls(
      cell(raw, 'immagini_domanda'),
      'immagini_domanda',
      rowErrors
    );
    const explanationImages = parseImageUrls(
      cell(raw, 'immagini_spiegazione'),
      'immagini_spiegazione',
      rowErrors
    );

    if (!subjectId) rowErrors.push('materia_id mancante');
    if (!topicId) rowErrors.push('argomento_id mancante');
    if (!questionText) rowErrors.push('testo mancante');
    if (!explanationText) rowErrors.push('spiegazione mancante');

    const type = resolveType(cell(raw, 'tipologia'));
    if (!type) rowErrors.push('tipologia non valida (attesi: MULTIPLE_CHOICE | COMPLETION)');

    const difficulty = resolveEnum(cell(raw, 'difficolta'), DIFFICULTY_VALUES);
    if (!difficulty) {
      rowErrors.push(`difficolta non valida (valori: ${DIFFICULTY_VALUES.join(', ')})`);
    }

    const language = resolveEnum(cell(raw, 'lingua'), LANGUAGE_VALUES);
    if (!language) {
      rowErrors.push(`lingua non valida (valori: ${LANGUAGE_VALUES.join(', ')})`);
    }

    // Type-specific validation
    let alternatives: ParsedAlternative[] = [];
    let completionAnswer = '';

    if (type === 'MULTIPLE_CHOICE') {
      const correttaRaw = cell(raw, 'corretta');
      const correttaNum = Number(correttaRaw);
      const filled = optionColumns
        .map((o) => ({
          order: o.index,
          text: cell(raw, o.column),
          image:
            parseImageUrls(
              cell(raw, `immagine_opzione_${o.index}`),
              `immagine_opzione_${o.index}`,
              rowErrors
            )[0] || undefined,
        }))
        // An option counts as present if it has text or an image.
        .filter((o) => o.text !== '' || o.image);

      if (filled.length < 2) {
        rowErrors.push('servono almeno 2 opzioni per una domanda a risposta chiusa');
      }
      if (!correttaRaw || !Number.isInteger(correttaNum)) {
        rowErrors.push('corretta deve essere il numero dell’opzione corretta');
      } else if (!filled.some((o) => o.order === correttaNum)) {
        rowErrors.push(`corretta=${correttaRaw} non corrisponde a nessuna opzione valorizzata`);
      }

      alternatives = filled.map((o) => ({
        text: o.text,
        order: o.order,
        isCorrect: o.order === correttaNum,
        ...(o.image ? { image: o.image } : {}),
      }));
    } else if (type === 'COMPLETION') {
      completionAnswer = cell(raw, 'risposta');
      if (!completionAnswer) rowErrors.push('risposta mancante per domanda di completamento');
    }

    return {
      rowNumber,
      id,
      isUpdate: !!id,
      subjectId,
      topicId,
      sottoArgomentoId,
      type: type ?? 'MULTIPLE_CHOICE',
      difficulty: difficulty ?? 'non_ancora_valutata',
      language: language ?? 'IT-it',
      questionText,
      explanationText,
      questionImages,
      explanationImages,
      alternatives,
      completionAnswer,
      reviewerEmail,
      reviewerId: null,
      rowErrors,
    };
  });

  return { rows, errors: [] };
}
