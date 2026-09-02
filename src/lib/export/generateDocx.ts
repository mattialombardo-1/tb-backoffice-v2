import {
  Document,
  Header,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from 'docx';
import {
  DEFAULT_HEADER_COLOR,
  answerPrefix,
  type ExportCollection,
  type ExportOptions,
} from '@/lib/types/export';
import { parseContent, type ContentNode } from './parseContent';
import { buildContentBlocks } from './contentBlocks';
import { latexToPngCached } from './latexToImage';

const FONT_BODY = 'Open Sans';
const FONT_TITLE = 'Bebas Neue';
const SIZE_BODY = 22;   // 11pt in half-points
const SIZE_TITLE = 40;  // 20pt
const SIZE_TOPIC = 30;  // 15pt — topic headings, smaller than the subject title
const SIZE_SECTION = 28; // 14pt

const MAX_IMG_WIDTH = 500;

// ─── Image fetching ───────────────────────────────────────────────────────────

interface FetchedImage {
  data: Uint8Array;
  width: number;
  height: number;
  imgType: 'png' | 'jpg' | 'gif' | 'bmp';
}

const imgCache = new Map<string, Promise<FetchedImage | null>>();

function mimeToImgType(mime: string, url: string): 'png' | 'jpg' | 'gif' | 'bmp' {
  if (/jpe?g/i.test(mime) || /jpe?g/i.test(url)) return 'jpg';
  if (/gif/i.test(mime) || /\.gif/i.test(url)) return 'gif';
  if (/bmp/i.test(mime) || /\.bmp/i.test(url)) return 'bmp';
  return 'png';
}

function fetchImage(url: string): Promise<FetchedImage | null> {
  if (!imgCache.has(url)) {
    imgCache.set(url, (async (): Promise<FetchedImage | null> => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) return null;
        const mime = res.headers.get('content-type') ?? '';
        const blob = await res.blob();
        const buf = await blob.arrayBuffer();
        const data = new Uint8Array(buf);
        const objUrl = URL.createObjectURL(blob);
        const dims = await new Promise<{ width: number; height: number }>((ok) => {
          const img = new Image();
          img.onload = () => { URL.revokeObjectURL(objUrl); ok({ width: img.naturalWidth, height: img.naturalHeight }); };
          img.onerror = () => { URL.revokeObjectURL(objUrl); ok({ width: 400, height: 300 }); };
          img.src = objUrl;
        });
        return { data, width: dims.width, height: dims.height, imgType: mimeToImgType(mime, url) };
      } catch { return null; }
    })());
  }
  return imgCache.get(url)!;
}

function scaleDims(img: FetchedImage, max = MAX_IMG_WIDTH) {
  const scale = Math.min(1, max / Math.max(img.width, 1));
  return { width: Math.round(img.width * scale), height: Math.round(img.height * scale) };
}

async function urlToParagraph(url: string, maxWidth = MAX_IMG_WIDTH, indent = 0): Promise<Paragraph | null> {
  const img = await fetchImage(url);
  if (!img) return null;
  const { width, height } = scaleDims(img, maxWidth);
  return new Paragraph({
    children: [new ImageRun({ data: img.data, transformation: { width, height }, type: img.imgType })],
    indent: indent ? { left: indent } : undefined,
    spacing: { after: 80 },
  });
}

// ─── Run builders ─────────────────────────────────────────────────────────────

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const b64 = dataUrl.split(',')[1];
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function nodesToRuns(nodes: ContentNode[]): Promise<(TextRun | ImageRun)[]> {
  const runs: (TextRun | ImageRun)[] = [];
  for (const node of nodes) {
    if (node.type === 'newline') {
      runs.push(new TextRun({ break: 1 }));
    } else if (node.type === 'text') {
      runs.push(new TextRun({
        text: node.text,
        bold: node.bold,
        font: FONT_BODY,
        size: SIZE_BODY,
      }));
    } else if (node.type === 'math') {
      const result = await latexToPngCached(node.latex, 11);
      if (result) {
        // Embed the rasterised PNG (not the SVG): Word's SVG renderer chokes on
        // complex MathJax output such as \begin{array} tables and paints them as
        // solid black blocks. The PNG (same one the PDF uses) renders reliably.
        runs.push(new ImageRun({
          data: dataUrlToUint8Array(result.dataUrl),
          transformation: { width: Math.round(result.width), height: Math.round(result.height) },
          type: 'png',
        }));
      } else {
        runs.push(new TextRun({ text: `$${node.latex}$`, font: FONT_BODY, size: SIZE_BODY }));
      }
    } else if (node.type === 'image') {
      const img = await fetchImage(node.src);
      if (img) {
        const { width, height } = scaleDims(img, 200);
        runs.push(new ImageRun({ data: img.data, transformation: { width, height }, type: img.imgType }));
      }
    }
  }
  return runs;
}

// ─── HTML → block elements (handles tables) ───────────────────────────────────

function rowsToDocxTable(rows: string[][], headerFirstRow: boolean): Table {
  const docxRows = rows.map((cells, ri) => {
    const isHeader = headerFirstRow && ri === 0;
    return new TableRow({
      tableHeader: isHeader,
      children: cells.map((text) =>
        new TableCell({
          children: [new Paragraph({
            children: [new TextRun({ text, font: FONT_BODY, size: SIZE_BODY, bold: isHeader })],
          })],
          shading: isHeader ? { type: ShadingType.SOLID, color: 'E5E7EB', fill: 'E5E7EB' } : undefined,
        })
      ),
    });
  });

  return new Table({ rows: docxRows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

// Renders content blocks (text / native table / image) into the doc, placing the
// question number on the first text block (or standalone before the first block
// when there is no text, e.g. an image- or table-only question).
async function appendBlocks(
  children: (Paragraph | Table)[],
  blocks: ReturnType<typeof buildContentBlocks>,
  numberPrefix: string,
) {
  const firstTextIdx = blocks.findIndex((b) => b.kind === 'text');
  const numberRun = new TextRun({ text: numberPrefix, bold: true, font: FONT_BODY, size: SIZE_BODY });

  if (firstTextIdx === -1 && blocks.length > 0) {
    children.push(new Paragraph({ children: [numberRun], spacing: { before: 120, after: 60 } }));
  }

  for (let bi = 0; bi < blocks.length; bi++) {
    const b = blocks[bi];
    if (b.kind === 'text') {
      const runs = await nodesToRuns(parseContent(b.html));
      children.push(new Paragraph({
        children: bi === firstTextIdx ? [numberRun, ...runs] : runs,
        spacing: { before: 120, after: 60 },
      }));
    } else if (b.kind === 'table') {
      children.push(rowsToDocxTable(b.rows, b.headerFirstRow));
    } else if (b.kind === 'image') {
      const p = await urlToParagraph(b.url);
      if (p) children.push(p);
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function divider(color = 'E5E7EB'): Paragraph {
  return new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 4, color, space: 1 } },
    spacing: { before: 0, after: 80 },
  });
}

function copyrightHeader(): Header {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [new TextRun({
        text: '© Testbusters — tutti i diritti riservati',
        font: FONT_BODY,
        size: 16,
        color: '9CA3AF',
      })],
    })],
  });
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateDocx(
  collections: ExportCollection[],
  options: ExportOptions,
): Promise<Blob> {
  const {
    mode,
    headerColor = DEFAULT_HEADER_COLOR,
    splitBySubject = false,
    splitByTopic = false,
    answerIndex = 'letter',
  } = options;
  const hex = headerColor.replace(/^#/, '').toUpperCase();
  const header = copyrightHeader();
  const docSections: object[] = [];

  for (const col of collections) {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: col.name, font: FONT_TITLE, size: SIZE_TITLE, color: hex })],
      spacing: { before: 200, after: 80 },
    }));
    children.push(divider(hex));


    let qi = 1;
    let lastSubject: string | undefined;
    let lastTopic: string | undefined;

    for (const section of col.sections) {
      if (section.name) {
        children.push(new Paragraph({
          children: [new TextRun({ text: section.name, font: FONT_BODY, size: SIZE_SECTION, bold: true, color: hex })],
          spacing: { before: 160, after: 80 },
        }));
      }

      for (const question of section.questions) {
        // "Dividi per materia": every time the subject changes from one
        // question to the next, force a new page with a heading.
        let brokeForSubject = false;
        if (splitBySubject && question.subjectName && question.subjectName !== lastSubject) {
          children.push(new Paragraph({
            children: [new TextRun({ text: question.subjectName, font: FONT_TITLE, size: SIZE_TITLE, color: hex })],
            pageBreakBefore: lastSubject !== undefined,
            spacing: { before: 80, after: 120 },
          }));
          lastSubject = question.subjectName;
          // New subject → re-emit the topic heading for its first topic.
          lastTopic = undefined;
          brokeForSubject = true;
        }

        // "Dividi per argomento": cumulable with subject split. Start a new page
        // on topic change, except right after a subject heading (already a fresh page).
        if (splitByTopic && question.topicName && question.topicName !== lastTopic) {
          children.push(new Paragraph({
            children: [new TextRun({ text: question.topicName, font: FONT_TITLE, size: SIZE_TOPIC, color: hex })],
            pageBreakBefore: lastTopic !== undefined && !brokeForSubject,
            spacing: { before: 80, after: 100 },
          }));
          lastTopic = question.topicName;
        }

        if (mode === 'with-explanation') {
          // Pure answer key: "N. <correction text>" — no question text or alternatives.
          if (question.explanationText) {
            await appendBlocks(
              children,
              buildContentBlocks(question.explanationText, question.explanationImages ?? []),
              `${qi}. `,
            );
          } else {
            children.push(new Paragraph({
              children: [
                new TextRun({ text: `${qi}. `, bold: true, font: FONT_BODY, size: SIZE_BODY }),
                new TextRun({
                  text: 'Nessuna correzione disponibile.',
                  italics: true,
                  color: '6B7280',
                  font: FONT_BODY,
                  size: SIZE_BODY,
                }),
              ],
              spacing: { before: 120, after: 60 },
            }));
          }

          children.push(new Paragraph({ children: [], spacing: { after: 80 } }));
          qi++;
          continue;
        }

        // Full question: text, images and alternatives — no explanation.
        await appendBlocks(
          children,
          buildContentBlocks(question.questionText, question.questionImages ?? []),
          `${qi}. `,
        );

        // Alternatives
        if (question.type !== 'COMPLETION') {
          for (let i = 0; i < question.alternatives.length; i++) {
            const alt = question.alternatives[i];
            const prefix = answerPrefix(i, answerIndex);
            const altRuns = await nodesToRuns(parseContent(alt.text));

            children.push(new Paragraph({
              children: [
                ...(prefix
                  ? [new TextRun({ text: prefix, font: FONT_BODY, size: SIZE_BODY })]
                  : []),
                ...altRuns,
              ],
              indent: { left: 360 },
              spacing: { after: 40 },
            }));

            if (alt.image) {
              const p = await urlToParagraph(alt.image, 200, 360);
              if (p) children.push(p);
            }
          }
        }

        children.push(new Paragraph({ children: [], spacing: { after: 80 } }));
        qi++;
      }
    }

    children.push(divider());
    docSections.push({ headers: { default: header }, children });
  }

  const doc = new Document({
    creator: 'Testbusters Backoffice',
    title: collections.length === 1 ? collections[0].name : 'Export Collezioni',
    sections: docSections as ConstructorParameters<typeof Document>[0]['sections'],
  });

  return Packer.toBlob(doc);
}
