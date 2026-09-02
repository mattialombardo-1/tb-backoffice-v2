// Splits question/explanation HTML into an ordered list of renderable blocks
// (text, native table, image) shared by the DOCX and PDF generators.
//
// Handles three concerns the flat inline parser can't:
//   1. LaTeX array/tabular environments ($\begin{array}…\end{array}$) → native
//      tables (Word's SVG renderer paints rasterised arrays as black blocks).
//   2. HTML <table> → native tables (the PDF generator previously dropped them).
//   3. Image placeholders (&&image1&&): when present, each image is placed at its
//      token position; when ABSENT, all images are rendered FIRST, text below.

export interface TableBlock {
  kind: 'table';
  rows: string[][];
  headerFirstRow: boolean;
}
export type ContentBlock =
  | { kind: 'text'; html: string }
  | TableBlock
  | { kind: 'image'; url: string };

/** Decodes HTML entities (&amp; &lt; &nbsp; …) to their literal characters. */
function decodeEntities(s: string): string {
  const el = document.createElement('textarea');
  el.innerHTML = s;
  return el.value;
}

/** Cleans a single LaTeX array cell into plain display text. */
function cleanLatexCell(s: string): string {
  return s
    .replace(/\\hline/g, '')
    .replace(/\\(?:text|mathrm|mathbf|textbf|textit)\s*\{([^}]*)\}/g, '$1')
    .replace(/\\%/g, '%')
    .replace(/\\&/g, '&')
    .replace(/\\\$/g, '$')
    .replace(/\\[,;: ]/g, ' ')
    .replace(/~/g, ' ')
    .replace(/[{}$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses a `\begin{array}…\end{array}` (or tabular) LaTeX snippet into rows of
 * plain-text cells. Returns null if no array environment is found.
 */
export function parseLatexArray(latex: string): string[][] | null {
  // Entities such as the cell separator `&` are usually stored as `&amp;`.
  const m = decodeEntities(latex).match(
    /\\begin\{(array|tabular)\}(?:\s*\{[^}]*\})?([\s\S]*?)\\end\{\1\}/
  );
  if (!m) return null;
  const AMP = '@@AMP@@';
  const rows = m[2]
    .split(/\\\\/)
    .map((r) => r.replace(/\\hline/g, '').trim())
    .filter((r) => r.length > 0)
    .map((r) =>
      // Protect escaped ampersands (\&) before splitting on column separators.
      r
        .replace(/\\&/g, AMP)
        .split('&')
        .map((c) => cleanLatexCell(c.split(AMP).join('\\&')))
    );
  return rows.length ? rows : null;
}

/** Parses an HTML `<table>` into rows of plain-text cells. */
export function htmlTableToRows(tableHtml: string): { rows: string[][]; headerFirstRow: boolean } {
  const doc = new DOMParser().parseFromString(`<body>${tableHtml}</body>`, 'text/html');
  const trs = Array.from(doc.querySelectorAll('tr'));
  const rows = trs.map((tr) =>
    Array.from(tr.querySelectorAll('td, th')).map(
      (c) => c.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    )
  );
  const headerFirstRow =
    trs.length > 0 &&
    Array.from(trs[0].querySelectorAll('td, th')).every((c) => c.tagName === 'TH');
  return { rows: rows.filter((r) => r.length > 0), headerFirstRow };
}

// Matches, in one pass: an HTML table, a LaTeX array-math segment, or an image
// placeholder. The array's `&` separators and the placeholder's `&&` may be
// HTML-encoded (`&amp;`), so ampersands are matched in either form.
const BLOCK_RE =
  /(<table[\s\S]*?<\/table>)|(\$[^$]*?\\begin\{(?:array|tabular)\}[\s\S]*?\\end\{(?:array|tabular)\}[^$]*?\$)|((?:&amp;|&){2}\s*image\s*(\d+)\s*(?:&amp;|&){2})/gi;

/**
 * Builds the ordered block list for a piece of content plus its images.
 *
 * - Image placeholders (`&&imageN&&`) place `images[N-1]` inline at that spot.
 * - With NO placeholder present, every image is emitted BEFORE the text.
 * - Any image not referenced by a placeholder is appended at the end.
 */
export function buildContentBlocks(html: string, images: string[] = []): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const used = new Set<number>();
  let hasPlaceholder = false;
  let last = 0;
  let m: RegExpExecArray | null;

  const pushText = (t: string) => {
    if (t && t.replace(/<[^>]*>/g, '').trim()) blocks.push({ kind: 'text', html: t });
  };

  BLOCK_RE.lastIndex = 0;
  while ((m = BLOCK_RE.exec(html)) !== null) {
    pushText(html.slice(last, m.index));
    last = m.index + m[0].length;

    if (m[1]) {
      const { rows, headerFirstRow } = htmlTableToRows(m[1]);
      if (rows.length) blocks.push({ kind: 'table', rows, headerFirstRow });
    } else if (m[2]) {
      const rows = parseLatexArray(m[2]);
      if (rows) blocks.push({ kind: 'table', rows, headerFirstRow: true });
      else blocks.push({ kind: 'text', html: m[2] }); // fall back to inline math
    } else if (m[3]) {
      hasPlaceholder = true;
      const idx = parseInt(m[4], 10) - 1;
      if (images[idx]) {
        blocks.push({ kind: 'image', url: images[idx] });
        used.add(idx);
      }
    }
  }
  pushText(html.slice(last));

  if (!hasPlaceholder && images.length) {
    // No placeholder → images first, then the text/table blocks.
    return [...images.map((url) => ({ kind: 'image', url }) as ContentBlock), ...blocks];
  }
  // Placeholders present → keep positions, append any unreferenced images.
  const leftover = images.filter((_, i) => !used.has(i));
  return [...blocks, ...leftover.map((url) => ({ kind: 'image', url }) as ContentBlock)];
}
