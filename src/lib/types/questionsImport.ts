import type { DifficultyLevel, QuestionLanguage, QuestionType } from './questions';

/**
 * A single alternative parsed from a CSV `opzione_N` column.
 * `order` is the 1-based column index (opzione_1 → 1) so the "corretta" index maps directly.
 */
export interface ParsedAlternative {
  text: string;
  isCorrect: boolean;
  order: number;
  /** Optional image URL for this alternative. */
  image?: string;
}

/**
 * One question read from the CSV, enriched with client-side state:
 * - `reviewerId` is assigned in the preview UI (never in the CSV directly, aside from
 *   the optional `revisore_email` pre-fill which is resolved to an id).
 * - `rowErrors` holds blocking validation errors; a row with errors cannot be imported.
 * - `isUpdate` is true when the CSV provided an `id` (update instead of create).
 */
export interface ParsedQuestionRow {
  /** 1-based CSV data row number (excludes the header), for error messages. */
  rowNumber: number;
  /** Present → update existing question; absent → create new. */
  id: string | null;
  isUpdate: boolean;
  subjectId: string;
  topicId: string;
  sottoArgomentoId: string | null;
  type: QuestionType;
  difficulty: DifficultyLevel;
  language: QuestionLanguage;
  questionText: string;
  explanationText: string;
  /** Image URLs for the question body (from `immagini_domanda`, `|`-separated). */
  questionImages: string[];
  /** Image URLs for the explanation (from `immagini_spiegazione`, `|`-separated). */
  explanationImages: string[];
  alternatives: ParsedAlternative[];
  completionAnswer: string;
  /** Raw `revisore_email` cell (pre-assignment hint), if any. */
  reviewerEmail: string | null;
  /** Reviewer assigned client-side. Import is blocked until every row has one. */
  reviewerId: string | null;
  /** Blocking validation errors for this row (empty → valid). */
  rowErrors: string[];
}

export interface ParseQuestionsCsvResult {
  rows: ParsedQuestionRow[];
  /** File-level errors (missing required columns, empty file, unreadable). Block the whole import. */
  errors: string[];
}

/** Domain-level item sent to the backend bulk endpoint (mapped to backend shape in the service). */
export interface BulkImportItem {
  id: string | null;
  subjectId: string;
  topicId: string;
  sottoArgomentoId: string | null;
  type: QuestionType;
  difficulty: DifficultyLevel;
  language: QuestionLanguage;
  questionText: string;
  explanationText: string;
  questionImages: string[];
  explanationImages: string[];
  alternatives: ParsedAlternative[];
  completionAnswer: string;
  reviewerId: string;
}

export interface BulkImportPayload {
  items: BulkImportItem[];
}

/** Max items per atomic bulk import (server rejects more with 400). */
export const MAX_BULK_ITEMS = 500;

export type BulkJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** 202 response from `POST /questions/bulk` — the job has been queued. */
export interface BulkJobStart {
  jobId: string;
  total: number;
  status: BulkJobStatus;
  statusUrl: string;
}

export interface BulkJobItemResult {
  index: number;
  action: 'created' | 'updated';
  questionId: string;
}

/** `GET /questions/bulk/{jobId}` — job state (polled until terminal). */
export interface BulkJob {
  jobId: string;
  status: BulkJobStatus;
  total: number;
  /** Present on COMPLETED, one entry per item in submission order. */
  results?: BulkJobItemResult[];
  /** Present on FAILED. */
  error?: string;
  /** Index of the item that caused the failure (-1 if not attributable). */
  failedIndex?: number;
  createdBy?: string;
  brandId?: string;
  createdAt?: string;
  updatedAt?: string;
}
