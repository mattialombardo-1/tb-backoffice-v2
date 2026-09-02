export type ContentNode =
  | { type: 'text'; text: string; bold?: boolean }
  | { type: 'math'; latex: string }
  | { type: 'newline' }
  | { type: 'image'; src: string };

// Token inserted by the rich editor's "Completamento" custom command
// (src/components/rich-editor/constants.ts) to mark the blank in a
// COMPLETION question — rendered as a line for the student to write on.
const COMPLETION_TOKEN = '&&completamento&&';
const COMPLETION_BLANK = '_____________________';

/**
 * Parse an HTML string (may contain inline LaTeX `$...$`, `<img>`, bold, line breaks)
 * into a flat list of content nodes. Tables are NOT parsed here — strip them first
 * with `extractTables` if you need block-level table handling.
 */
export function parseContent(html: string): ContentNode[] {
  if (!html) return [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.querySelector('div')!;

  const nodes: ContentNode[] = [];

  function pushPlainText(text: string, bold: boolean) {
    // Replace the completion-blank token with a literal underscore line.
    const blankParts = text.split(COMPLETION_TOKEN);
    for (let j = 0; j < blankParts.length; j++) {
      const lines = blankParts[j].split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i]) nodes.push({ type: 'text', text: lines[i], bold });
        if (i < lines.length - 1) nodes.push({ type: 'newline' });
      }
      if (j < blankParts.length - 1) nodes.push({ type: 'text', text: COMPLETION_BLANK, bold });
    }
  }

  function pushText(raw: string, bold: boolean) {
    // Split on $...$ to emit math nodes.
    const parts = raw.split(/(\$[^$]+\$)/g);
    for (const part of parts) {
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        nodes.push({ type: 'math', latex: part.slice(1, -1) });
        continue;
      }
      pushPlainText(part, bold);
    }
  }

  function walk(node: Node, bold: boolean) {
    if (node.nodeType === Node.TEXT_NODE) {
      pushText(node.textContent ?? '', bold);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    if (tag === 'br') {
      nodes.push({ type: 'newline' });
    } else if (tag === 'img') {
      const src = el.getAttribute('src');
      if (src) nodes.push({ type: 'image', src });
    } else if (tag === 'b' || tag === 'strong') {
      for (const child of el.childNodes) walk(child, true);
    } else if (tag === 'p') {
      for (const child of el.childNodes) walk(child, bold);
      // Add newline between paragraphs, but not after the last one.
      if (el.nextSibling) nodes.push({ type: 'newline' });
    } else if (tag === 'table') {
      // Tables are handled block-level — skip inline parsing.
    } else {
      for (const child of el.childNodes) walk(child, bold);
    }
  }

  for (const child of root.childNodes) walk(child, false);

  // Trim trailing newlines.
  while (nodes.length > 0 && nodes[nodes.length - 1].type === 'newline') nodes.pop();

  return nodes;
}

/**
 * Split HTML into alternating text/table segments for block-level handling in DOCX.
 */
export function splitByTables(html: string): Array<{ kind: 'text'; html: string } | { kind: 'table'; html: string }> {
  const result: Array<{ kind: 'text'; html: string } | { kind: 'table'; html: string }> = [];
  const re = /(<table[\s\S]*?<\/table>)/gi;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(html)) !== null) {
    if (m.index > last) result.push({ kind: 'text', html: html.slice(last, m.index) });
    result.push({ kind: 'table', html: m[1] });
    last = m.index + m[0].length;
  }
  if (last < html.length) result.push({ kind: 'text', html: html.slice(last) });

  return result;
}
