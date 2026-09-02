/**
 * Column order for the downloadable import template. Kept in sync with the
 * columns understood by `parseQuestionsCsv`. Required columns are marked in the
 * import UI / plan; the rest are optional.
 */
export const TEMPLATE_COLUMNS = [
  'id',
  'materia_id',
  'argomento_id',
  'sotto_argomento_id',
  'tipologia',
  'difficolta',
  'lingua',
  'testo',
  'spiegazione',
  'immagini_domanda',
  'immagini_spiegazione',
  'opzione_1',
  'opzione_2',
  'opzione_3',
  'opzione_4',
  'opzione_5',
  'immagine_opzione_1',
  'immagine_opzione_2',
  'immagine_opzione_3',
  'immagine_opzione_4',
  'immagine_opzione_5',
  'corretta',
  'risposta',
  'revisore_email',
] as const;

type TemplateColumn = (typeof TEMPLATE_COLUMNS)[number];

// Two example rows so the shape (multiple choice vs completion, the `|` image
// separator, and the &&imageN&& placeholders) is self-explanatory. IDs are
// obvious placeholders to replace.
//
// Images work exactly like question create/edit: put the URLs (in order) in the
// image column, then reference each with `&&imageN&&` inside the text. The
// placeholder index is 1-based and scoped to that field's own image list — e.g.
// `&&image1&&` in `spiegazione` = first URL of `immagini_spiegazione`.
const EXAMPLE_ROWS: Array<Partial<Record<TemplateColumn, string>>> = [
  {
    materia_id: 'ID_MATERIA',
    argomento_id: 'ID_ARGOMENTO',
    tipologia: 'MULTIPLE_CHOICE',
    difficolta: 'medio',
    lingua: 'IT-it',
    testo: 'Osserva le immagini &&image1&& e &&image2&&. Quale alternativa è corretta?',
    spiegazione: 'Come mostrato in &&image1&&, la risposta corretta è la seconda.',
    immagini_domanda: 'https://esempio.it/domanda-1.png|https://esempio.it/domanda-2.png',
    immagini_spiegazione: 'https://esempio.it/spiegazione-1.png',
    opzione_1: 'Prima opzione',
    opzione_2: 'Seconda opzione (corretta)',
    opzione_3: 'Terza opzione',
    corretta: '2',
  },
  {
    materia_id: 'ID_MATERIA',
    argomento_id: 'ID_ARGOMENTO',
    tipologia: 'COMPLETION',
    difficolta: 'facile',
    lingua: 'IT-it',
    testo: 'Completa la frase: la capitale d’Italia è ___',
    spiegazione: 'Nozione di base',
    risposta: 'Roma',
  },
];

const escapeCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;

/** Builds a comma-separated CSV template (header + example rows), fully quoted. */
export function buildQuestionsCsvTemplate(): string {
  const header = TEMPLATE_COLUMNS.map(escapeCsv).join(',');
  const rows = EXAMPLE_ROWS.map((row) =>
    TEMPLATE_COLUMNS.map((col) => escapeCsv(row[col] ?? '')).join(',')
  );
  return [header, ...rows].join('\n');
}
