import katex from 'katex';

export function tryRenderKatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false });
  } catch {
    return `<span class="text-destructive">[Errore LaTeX: ${escapeHtml(tex)}]</span>`;
  }
}

/**
 * Starting at `start` which points to an opening `{`, find the matching `}`.
 * Returns the index AFTER the closing brace, or -1 if unmatched.
 */
function findMatchingBrace(input: string, start: number): number {
  if (input[start] !== '{') return -1;
  let depth = 1;
  let i = start + 1;
  while (i < input.length && depth > 0) {
    if (input[i] === '{') depth++;
    else if (input[i] === '}') depth--;
    i++;
  }
  return depth === 0 ? i : -1;
}

/**
 * Starting at `start` which points to an opening `[`, find the matching `]`.
 * Returns the index AFTER the closing bracket, or -1 if unmatched.
 */
function findMatchingBracket(input: string, start: number): number {
  if (input[start] !== '[') return -1;
  let depth = 1;
  let i = start + 1;
  while (i < input.length && depth > 0) {
    if (input[i] === '[') depth++;
    else if (input[i] === ']') depth--;
    i++;
  }
  return depth === 0 ? i : -1;
}

/**
 * From position `start` (pointing at `\`), consume a bare LaTeX expression:
 *   \commandName optionally followed by [...]{...}{...} groups,
 *   then optionally followed by ^{...} or _{...} modifiers.
 *
 * Returns the end index (exclusive) of the consumed expression.
 */
function consumeBareLatex(input: string, start: number): number {
  // Match \commandName
  const cmdMatch = /^\\[a-zA-Z]+/.exec(input.slice(start));
  if (!cmdMatch) return start + 1; // just a stray backslash, skip it

  let pos = start + cmdMatch[0].length;

  // Consume optional [...] (e.g. \sqrt[3]{x})
  if (pos < input.length && input[pos] === '[') {
    const end = findMatchingBracket(input, pos);
    if (end !== -1) pos = end;
  }

  // Consume all consecutive {...} groups (e.g. \frac{a}{b})
  while (pos < input.length && input[pos] === '{') {
    const end = findMatchingBrace(input, pos);
    if (end === -1) break;
    pos = end;
  }

  // Consume optional ^{...} or _{...} modifier
  if (pos < input.length && (input[pos] === '^' || input[pos] === '_')) {
    pos++; // skip ^ or _
    if (pos < input.length && input[pos] === '{') {
      const end = findMatchingBrace(input, pos);
      if (end !== -1) pos = end;
    } else if (pos < input.length) {
      pos++; // single char like ^2
    }
  }

  // Check if followed by another \command (e.g. \not\ni, \prime\prime, \left(\right))
  if (pos < input.length && input[pos] === '\\') {
    const nextCmd = /^\\[a-zA-Z]+/.exec(input.slice(pos));
    if (nextCmd) {
      // Only chain if it looks like a modifier/continuation (not a new standalone command)
      const chainable = /^\\(not|left|right|prime|hline|mathit|mathrm|mathbf|operatorname)/.test(
        input.slice(pos)
      );
      if (chainable) {
        pos = consumeBareLatex(input, pos);
      }
    }
  }

  return pos;
}

/**
 * Single-pass LaTeX renderer. Tokenizes the input into:
 *   1. $$...$$ display math
 *   2. $...$ inline math
 *   3. Bare \command{...} sequences (with nested braces)
 *   4. Plain text
 *
 * Each math segment is rendered once via KaTeX, and rendered HTML
 * is never re-scanned.
 */
export function renderLatex(input: string): string {
  const parts: string[] = [];
  let i = 0;
  let plainStart = 0;

  const flushPlain = (end: number) => {
    if (end > plainStart) {
      const text = input.slice(plainStart, end);
      parts.push(escapeHtml(text).replace(/\n/g, '<br>'));
    }
  };

  while (i < input.length) {
    // Check for $$ (display math)
    if (input[i] === '$' && input[i + 1] === '$') {
      flushPlain(i);
      const closeIdx = input.indexOf('$$', i + 2);
      if (closeIdx !== -1) {
        const tex = input.slice(i + 2, closeIdx);
        parts.push(tryRenderKatex(tex, true));
        i = closeIdx + 2;
      } else {
        // Unclosed $$, render rest as math
        const tex = input.slice(i + 2);
        parts.push(tryRenderKatex(tex, true));
        i = input.length;
      }
      plainStart = i;
      continue;
    }

    // Check for $ (inline math)
    if (input[i] === '$') {
      flushPlain(i);
      // Find closing $ (not $$)
      let j = i + 1;
      while (j < input.length && input[j] !== '$') j++;
      if (j < input.length) {
        const tex = input.slice(i + 1, j);
        parts.push(tryRenderKatex(tex, false));
        i = j + 1;
      } else {
        // Unclosed $, treat as plain text
        parts.push(escapeHtml('$'));
        i = i + 1;
      }
      plainStart = i;
      continue;
    }

    // Check for bare \command
    if (input[i] === '\\' && i + 1 < input.length && /[a-zA-Z]/.test(input[i + 1])) {
      flushPlain(i);
      const end = consumeBareLatex(input, i);
      const tex = input.slice(i, end);
      parts.push(tryRenderKatex(tex, false));
      i = end;
      plainStart = i;
      continue;
    }

    // Check for bare ^{...} or _{...} (superscript/subscript not attached to a command)
    if ((input[i] === '^' || input[i] === '_') && i + 1 < input.length && input[i + 1] === '{') {
      flushPlain(i);
      const end = findMatchingBrace(input, i + 1);
      if (end !== -1) {
        const tex = input.slice(i, end);
        parts.push(tryRenderKatex(tex, false));
        i = end;
      } else {
        parts.push(escapeHtml(input[i]));
        i++;
      }
      plainStart = i;
      continue;
    }

    i++;
  }

  flushPlain(i);
  return parts.join('');
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Renders text containing both LaTeX and &&imageN&& image variables.
 * Image variables are replaced with <img> tags; remaining segments are rendered via renderLatex.
 */
export function renderLatexWithImages(
  text: string,
  images: Array<{ id: string; url: string }>
): string {
  const imageMap = new Map(images.map((img) => [img.id, img.url]));
  const parts = text.split(/(&&image\d+&&)/g);
  return parts
    .map((part) => {
      const match = part.match(/^&&(image\d+)&&$/);
      if (match) {
        const url = imageMap.get(match[1]);
        if (url) {
          return `<img src="${url}" alt="${match[1]}" class="max-w-full h-auto rounded my-1 inline-block" />`;
        }
        return `<span class="text-destructive font-mono text-xs">[${part}]</span>`;
      }
      return renderHtmlWithLatex(part);
    })
    .join('');
}

/**
 * Like renderLatex but for content that already contains HTML markup.
 * HTML tags pass through unchanged; LaTeX is rendered only inside text nodes.
 */
export function renderHtmlWithLatex(html: string): string {
  const parts: string[] = [];
  const tagRegex = /<[^>]+>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderLatex(html.slice(lastIndex, match.index)));
    }
    parts.push(match[0]);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) {
    parts.push(renderLatex(html.slice(lastIndex)));
  }
  return parts.join('');
}
