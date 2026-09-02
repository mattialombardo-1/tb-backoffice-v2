import { Document, Page, Text, View, Image, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import { createElement, type ReactElement } from 'react';
import {
  DEFAULT_HEADER_COLOR,
  answerPrefix,
  type ExportCollection,
  type ExportOptions,
} from '@/lib/types/export';
import { parseContent, type ContentNode } from './parseContent';
import { buildContentBlocks } from './contentBlocks';
import { latexToPngCached } from './latexToImage';

// Font files bundled via Vite — same origin, no CORS issues.
import BebasNeueRegular from '@fontsource/bebas-neue/files/bebas-neue-latin-400-normal.woff?url';
import OpenSansRegular from '@fontsource/open-sans/files/open-sans-latin-400-normal.woff?url';
import OpenSansBold from '@fontsource/open-sans/files/open-sans-latin-700-normal.woff?url';
import OpenSansItalic from '@fontsource/open-sans/files/open-sans-latin-400-italic.woff?url';
import OpenSansBoldItalic from '@fontsource/open-sans/files/open-sans-latin-700-italic.woff?url';

// ─── Font registration ────────────────────────────────────────────────────────

Font.register({ family: 'Bebas Neue', src: BebasNeueRegular });

Font.register({
  family: 'Open Sans',
  fonts: [
    { src: OpenSansRegular, fontWeight: 400 },
    { src: OpenSansBold, fontWeight: 700 },
    { src: OpenSansItalic, fontStyle: 'italic' },
    { src: OpenSansBoldItalic, fontWeight: 700, fontStyle: 'italic' },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ─── Image pre-fetching ───────────────────────────────────────────────────────
// react-pdf's internal image loader uses Node.js Buffer, which is not available
// in the browser.  We pre-fetch every image ourselves and pass a data URL
// instead — react-pdf handles data URLs without any Buffer dependency.

const imgCache = new Map<string, Promise<string | null>>();

function fetchAsDataUrl(url: string): Promise<string | null> {
  if (!url) return Promise.resolve(null);
  // Data URLs need no fetching.
  if (url.startsWith('data:')) return Promise.resolve(url);
  if (!imgCache.has(url)) {
    imgCache.set(url, (async () => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) return null;
        const blob = await res.blob();
        return await new Promise<string | null>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      } catch {
        return null;
      }
    })());
  }
  return imgCache.get(url)!;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const BLUE = '#1D4ED8';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#9CA3AF';

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 48,
    fontFamily: 'Open Sans',
    fontSize: 11,
    color: '#111827',
    lineHeight: 1.25,
  },
  // Fixed header on every page
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 48,
    right: 48,
    textAlign: 'right',
    fontSize: 8,
    color: LIGHT_GRAY,
  },
  collectionTitle: {
    fontFamily: 'Bebas Neue',
    fontSize: 20,
    color: BLUE,
    marginBottom: 4,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  subjectHeading: {
    fontFamily: 'Bebas Neue',
    fontSize: 17,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  topicHeading: {
    fontFamily: 'Bebas Neue',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  dividerBlue: {
    borderBottomWidth: 1,
    borderBottomColor: BLUE,
    marginBottom: 8,
  },
  dividerGray: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginVertical: 8,
  },
  collectionMeta: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#374151',
    marginTop: 12,
    marginBottom: 6,
  },
  questionRow: { flexDirection: 'row', marginTop: 8, marginBottom: 4 },
  questionNum: { fontWeight: 700, width: 24, flexShrink: 0, fontSize: 11 },
  questionBody: { flex: 1 },
  altRow: { flexDirection: 'row', marginLeft: 20, marginBottom: 2 },
  altLabel: { width: 20, flexShrink: 0, fontSize: 11 },
  altText: { flex: 1, fontSize: 11 },
  noExplanation: { color: GRAY, fontStyle: 'italic', fontSize: 11 },
  inlineMath: { maxHeight: 14 },
  blockImage: { maxWidth: 400, marginVertical: 6, marginLeft: 20 },
  // Native table (used for LaTeX arrays and HTML tables). Top/left borders on the
  // wrapper, right/bottom borders on each cell → collapsed 1px grid.
  tableWrap: {
    marginVertical: 6,
    marginLeft: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: '#9CA3AF',
  },
  tableRow: { flexDirection: 'row' },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 10,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#9CA3AF',
  },
  tableCellHeader: { fontWeight: 700, backgroundColor: '#E5E7EB' },
});

// ─── Node rendering ───────────────────────────────────────────────────────────

// PDF font size in pt — used to convert MathJax ex units to react-pdf points.
// latexToPngCached(latex, PDF_FONT_PT) returns width/height where
//   value = n_ex * PDF_FONT_PT * 0.44  →  directly usable as react-pdf points.
const PDF_FONT_PT = 11;

type ResolvedNode =
  | { kind: 'text'; text: string; bold?: boolean; newline?: never }
  | { kind: 'newline' }
  | { kind: 'png'; src: string; inline: boolean; w?: number; h?: number };

async function resolveNodes(nodes: ContentNode[]): Promise<ResolvedNode[]> {
  const out: ResolvedNode[] = [];
  for (const node of nodes) {
    if (node.type === 'newline') {
      out.push({ kind: 'newline' });
    } else if (node.type === 'text') {
      out.push({ kind: 'text', text: node.text, bold: node.bold });
    } else if (node.type === 'math') {
      const png = await latexToPngCached(node.latex, PDF_FONT_PT);
      if (png) {
        // w/h are in pt (because fontSize = PDF_FONT_PT).
        // Passing them explicitly prevents react-pdf from using raw canvas
        // pixel dimensions (which would be 2× too large due to SCALE=2).
        out.push({ kind: 'png', src: png.dataUrl, inline: true, w: png.width, h: png.height });
      } else {
        out.push({ kind: 'text', text: `$${node.latex}$` });
      }
    } else if (node.type === 'image') {
      const src = await fetchAsDataUrl(node.src);
      if (src) out.push({ kind: 'png', src, inline: false });
    }
  }
  return out;
}

// Groups resolved nodes into paragraph-level <Text> elements, with inline math
// PNGs nested as direct children (react-pdf embeds raster <Image> children of
// <Text> as inline glyphs — the same mechanism it uses for emoji — so they flow
// and wrap with the surrounding words instead of forcing a line break).
// Explicit newlines and block-level images (real <img> tags) end the current
// paragraph and start a new one.
type InlineNode = Extract<ResolvedNode, { kind: 'text' } | { kind: 'png' }>;

function isBlockImage(n: InlineNode): n is Extract<ResolvedNode, { kind: 'png' }> {
  return n.kind === 'png' && !n.inline;
}

function renderNodes(resolved: ResolvedNode[], textStyle?: object): ReactElement[] {
  const out: ReactElement[] = [];
  let line: InlineNode[] = [];
  let key = 0;

  const flushLine = () => {
    if (line.length === 0) return;
    const children = line.map((n, i) => {
      if (n.kind === 'png') {
        // Explicit pt dimensions — MathJax SVG ex → pt at PDF_FONT_PT.
        return createElement(Image, {
          key: i,
          src: n.src,
          style: n.w && n.h ? { width: n.w, height: n.h } : styles.inlineMath,
        });
      }
      return createElement(Text, { key: i, style: { fontWeight: n.bold ? 700 : 400 } }, n.text);
    });
    out.push(createElement(Text, { key: key++, style: { ...(textStyle ?? {}) } }, ...children));
    line = [];
  };

  for (const n of resolved) {
    if (n.kind === 'newline') {
      flushLine();
      continue;
    }
    if (isBlockImage(n)) {
      flushLine();
      out.push(createElement(Image, { key: key++, src: n.src, style: styles.blockImage }));
      continue;
    }
    line.push(n);
  }
  flushLine();

  return out;
}

// ─── Block rendering ──────────────────────────────────────────────────────────

function rowsToPdfTable(rows: string[][], headerFirstRow: boolean, key: string): ReactElement {
  return createElement(
    View,
    { key, style: styles.tableWrap },
    ...rows.map((cells, ri) =>
      createElement(
        View,
        { key: ri, style: styles.tableRow },
        ...cells.map((text, ci) =>
          createElement(
            Text,
            {
              key: ci,
              style:
                headerFirstRow && ri === 0
                  ? [styles.tableCell, styles.tableCellHeader]
                  : styles.tableCell,
            },
            text
          )
        )
      )
    )
  );
}

// Renders content blocks (text / native table / image). The question number goes
// on the first text block, or standalone before the first block when there is no
// text (image/table-only question).
async function blocksToPdf(
  blocks: ReturnType<typeof buildContentBlocks>,
  qNumber: string,
  keyBase: string
): Promise<ReactElement[]> {
  const out: ReactElement[] = [];
  const firstTextIdx = blocks.findIndex((b) => b.kind === 'text');

  if (firstTextIdx === -1 && blocks.length > 0) {
    out.push(createElement(Text, { key: `${keyBase}-num`, style: styles.questionNum }, qNumber));
  }

  for (let bi = 0; bi < blocks.length; bi++) {
    const b = blocks[bi];
    if (b.kind === 'text') {
      const nodes = renderNodes(await resolveNodes(parseContent(b.html)));
      if (bi === firstTextIdx) {
        out.push(
          createElement(
            View,
            { key: `${keyBase}-t${bi}`, style: styles.questionRow },
            createElement(Text, { style: styles.questionNum }, qNumber),
            createElement(View, { style: styles.questionBody }, ...nodes)
          )
        );
      } else {
        out.push(createElement(View, { key: `${keyBase}-t${bi}`, style: styles.questionBody }, ...nodes));
      }
    } else if (b.kind === 'table') {
      out.push(rowsToPdfTable(b.rows, b.headerFirstRow, `${keyBase}-tbl${bi}`));
    } else if (b.kind === 'image') {
      const src = await fetchAsDataUrl(b.url);
      if (src) out.push(createElement(Image, { key: `${keyBase}-img${bi}`, src, style: styles.blockImage }));
    }
  }
  return out;
}

// ─── Page builder ─────────────────────────────────────────────────────────────

async function buildPage(
  col: ExportCollection,
  options: Required<Pick<ExportOptions, 'mode' | 'headerColor' | 'splitBySubject' | 'splitByTopic' | 'answerIndex'>>,
): Promise<ReactElement> {
  const { mode, headerColor, splitBySubject, splitByTopic, answerIndex } = options;
  const children: ReactElement[] = [];

  // Fixed copyright header (repeats on every page)
  children.push(createElement(Text, {
    key: 'header',
    style: styles.pageHeader,
    fixed: true,
  } as object, '© Testbusters — tutti i diritti riservati'));

  // Collection title
  children.push(createElement(Text, { key: 'title', style: { ...styles.collectionTitle, color: headerColor } }, col.name));

  let qi = 1;
  let lastSubject: string | undefined;
  let lastTopic: string | undefined;

  for (const section of col.sections) {
    if (section.name) {
      children.push(createElement(Text, { key: `sec-${section.name}`, style: { ...styles.sectionTitle, color: headerColor } }, section.name));
    }

    for (const question of section.questions) {
      // "Dividi per materia": every time the subject changes from one
      // question to the next, force a new physical page with a heading.
      let brokeForSubject = false;
      if (splitBySubject && question.subjectName && question.subjectName !== lastSubject) {
        children.push(createElement(Text, {
          key: `subj-${qi}`,
          style: { ...styles.subjectHeading, color: headerColor },
          break: lastSubject !== undefined,
        } as object, question.subjectName));
        lastSubject = question.subjectName;
        // New subject → re-emit the topic heading for its first topic.
        lastTopic = undefined;
        brokeForSubject = true;
      }

      // "Dividi per argomento": cumulable with subject split. New page on topic
      // change, except right after a subject heading (already a fresh page).
      if (splitByTopic && question.topicName && question.topicName !== lastTopic) {
        children.push(createElement(Text, {
          key: `topic-${qi}`,
          style: { ...styles.topicHeading, color: headerColor },
          break: lastTopic !== undefined && !brokeForSubject,
        } as object, question.topicName));
        lastTopic = question.topicName;
      }

      if (mode === 'with-explanation') {
        // Pure answer key: "N. <correction text>" — no question text or alternatives.
        if (question.explanationText) {
          children.push(
            ...(await blocksToPdf(
              buildContentBlocks(question.explanationText, question.explanationImages ?? []),
              `${qi}.`,
              `q-${qi}`
            ))
          );
        } else {
          children.push(
            createElement(View, { key: `q-${qi}`, style: styles.questionRow },
              createElement(Text, { style: styles.questionNum }, `${qi}.`),
              createElement(View, { style: styles.questionBody },
                createElement(Text, { style: styles.noExplanation }, 'Nessuna correzione disponibile.')),
            )
          );
        }

        qi++;
        continue;
      }

      // Full question: text, images and alternatives — no explanation.
      children.push(
        ...(await blocksToPdf(
          buildContentBlocks(question.questionText, question.questionImages ?? []),
          `${qi}.`,
          `q-${qi}`
        ))
      );

      // Alternatives
      if (question.type !== 'COMPLETION') {
        for (let i = 0; i < question.alternatives.length; i++) {
          const alt = question.alternatives[i];
          const prefix = answerPrefix(i, answerIndex).trimEnd();
          const altNodes = await resolveNodes(parseContent(alt.text));

          children.push(
            createElement(View, { key: `alt-${qi}-${i}`, style: styles.altRow },
              ...(prefix ? [createElement(Text, { style: styles.altLabel }, prefix)] : []),
              createElement(View, { style: styles.altText }, ...renderNodes(altNodes)),
            )
          );

          if (alt.image) {
            const altImgSrc = await fetchAsDataUrl(alt.image);
            if (altImgSrc) children.push(createElement(Image, { key: `altimg-${qi}-${i}`, src: altImgSrc, style: { ...styles.blockImage, maxWidth: 200 } }));
          }
        }
      }

      qi++;
    }
  }

  children.push(createElement(View, { key: 'divEnd', style: styles.dividerGray }));

  return createElement(Page, { key: col._id, size: 'A4', style: styles.page }, ...children);
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generatePdf(
  collections: ExportCollection[],
  options: ExportOptions,
): Promise<Blob> {
  const resolved = {
    mode: options.mode,
    headerColor: options.headerColor ?? DEFAULT_HEADER_COLOR,
    splitBySubject: options.splitBySubject ?? false,
    splitByTopic: options.splitByTopic ?? false,
    answerIndex: options.answerIndex ?? 'letter',
  } as const;
  const pages = await Promise.all(collections.map((c) => buildPage(c, resolved)));
  const doc = createElement(Document, { creator: 'Testbusters Backoffice' }, ...pages);
  return pdf(doc).toBlob();
}
