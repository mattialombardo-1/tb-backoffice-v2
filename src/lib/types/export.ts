export interface ExportAlternative {
  text: string;
  image?: string;
  correct: boolean;
}

export interface ExportQuestion {
  questionId: string;
  type: 'MULTIPLE_CHOICE' | 'COMPLETION';
  subjectName?: string | null;
  topicName?: string | null;
  questionText: string;
  explanationText: string;
  alternatives: ExportAlternative[];
  questionImages: string[];
  explanationImages: string[];
}

export interface ExportSection {
  name?: string;
  questions: ExportQuestion[];
}

export interface ExportCollection {
  _id: string;
  name: string;
  type: string;
  status: string;
  sections: ExportSection[];
}

export interface ExportResponse {
  collections: ExportCollection[];
  total: number;
}

export type ExportFormat = 'docx' | 'pdf';
export type ExportMode = 'without-explanation' | 'with-explanation';

/** How answer alternatives are labelled in the exported document. */
export type AnswerIndexStyle = 'letter' | 'numeric' | 'none';

/** Default color for titles/section headers in exported documents. */
export const DEFAULT_HEADER_COLOR = '#1D4ED8';

/** Default answer-index style — letters (A, B, C…), matching legacy behaviour. */
export const DEFAULT_ANSWER_INDEX: AnswerIndexStyle = 'letter';

/** Options shared by the DOCX and PDF generators. */
export interface ExportOptions {
  mode: ExportMode;
  headerColor?: string;
  /** Insert a subject heading (and page break) whenever the subject changes. */
  splitBySubject?: boolean;
  /** Insert a topic heading whenever the topic changes. Cumulable with splitBySubject. */
  splitByTopic?: boolean;
  /** Marker used before each alternative. Defaults to letters. */
  answerIndex?: AnswerIndexStyle;
}

const ANSWER_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

/**
 * Returns the prefix rendered before an alternative's text (including the
 * trailing `) `), or an empty string when the index style is 'none'.
 */
export function answerPrefix(index: number, style: AnswerIndexStyle): string {
  if (style === 'none') return '';
  if (style === 'numeric') return `${index + 1}) `;
  return `${ANSWER_LETTERS[index] ?? String(index + 1)}) `;
}
