// LaTeX → image using MathJax pre-bundled browser bundle (tex-svg.js).
//
// Why this approach:
//   mathjax-full ships CJS modules in js/.  When dynamically imported in Vite
//   they are NOT pre-bundled (Vite only pre-bundles static imports), so the
//   browser receives raw CJS with require() calls → ReferenceError.
//
//   Instead we import the pre-built webpack bundle (es5/tex-svg.js) as a ?url
//   asset and inject it as a <script> tag.  The bundle is fully self-contained
//   and sets up window.MathJax with tex2svg / tex2svgPromise helpers.
//
// Pipeline:
//   LaTeX  →  MathJax.tex2svg()  →  pure SVG (paths, no <foreignObject>)
//          →  Blob URL → canvas  →  PNG data URL  (no canvas taint!)
//
// The script is injected lazily — only on the first export — and cached by
// the browser on subsequent exports.

// Vite copies the file to the build output and returns its hashed URL.
// @ts-ignore — ?url imports are valid Vite syntax but unknown to tsc
import MJX_BUNDLE_URL from 'mathjax-full/es5/tex-svg.js?url';

export interface LatexPng {
  svgString: string; // pure MathJax SVG — embed directly in DOCX (type:'svg')
  dataUrl:   string; // PNG data URL          — embed in PDF via <Image>
  width:     number; // display width  in CSS px
  height:    number; // display height in CSS px
}

// ─── MathJax bootstrap (inject script once, wait for startup.ready) ──────────

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    MathJax: any;
  }
}

let mjxReadyPromise: Promise<void> | null = null;

function ensureMathJax(): Promise<void> {
  if (mjxReadyPromise) return mjxReadyPromise;

  mjxReadyPromise = new Promise<void>((resolve, reject) => {
    // If a previous call already finished loading
    if (window.MathJax?.version) {
      resolve();
      return;
    }

    // Configure BEFORE the script executes.
    window.MathJax = {
      tex: {
        packages: { '[+]': ['ams', 'boldsymbol'] },
        inlineMath: [],
        displayMath: [],
      },
      svg: {
        fontCache: 'local', // self-contained SVG per expression
      },
      startup: {
        typeset: false, // do NOT auto-typeset the page
        ready() {
          window.MathJax.startup.defaultReady();
          resolve();
        },
      },
    };

    const script = document.createElement('script');
    script.src   = MJX_BUNDLE_URL as string;
    script.async = true;
    script.onerror = () => reject(new Error('[latexToImage] MathJax bundle failed to load'));
    document.head.appendChild(script);
  });

  return mjxReadyPromise;
}

// ─── Unit conversion ─────────────────────────────────────────────────────────

// MathJax SVG uses "ex" or "em" for width/height attributes.
// 1ex ≈ 0.44 × fontSize; 1em = fontSize.
function unitToPx(attr: string | null, fontSize: number): number {
  if (!attr) return 0;
  const n = parseFloat(attr);
  if (isNaN(n)) return 0;
  if (attr.endsWith('ex')) return n * fontSize * 0.44;
  if (attr.endsWith('em')) return n * fontSize;
  return n;
}

// ─── SVG → PNG (no taint) ────────────────────────────────────────────────────

// MathJax SVG contains only <path>, <use>, <g>, <defs> — no <foreignObject>.
// Chrome therefore does NOT taint the canvas, and toDataURL() succeeds.
function svgToPngDataUrl(svgStr: string, width: number, height: number): Promise<string | null> {
  const SCALE = 2;
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width  = Math.max(1, Math.round(width  * SCALE));
    canvas.height = Math.max(1, Math.round(height * SCALE));

    const ctx = canvas.getContext('2d');
    if (!ctx) return resolve(null);

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const blob = new Blob([svgStr], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();

    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.error('[latexToImage] canvas.toDataURL failed', e);
        resolve(null);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

// ─── Main conversion ─────────────────────────────────────────────────────────

export async function latexToPng(latex: string, fontSize = 16): Promise<LatexPng | null> {
  try {
    await ensureMathJax();

    // tex2svg() is synchronous once MathJax startup is ready.
    // Returns mjx-container > svg.
    const container: HTMLElement = window.MathJax.tex2svg(latex.trim(), {
      display:        false,
      em:             fontSize,
      ex:             fontSize * 0.44,
      containerWidth: 1_000_000,
    });

    const svgEl = container.querySelector('svg') as SVGSVGElement | null;
    if (!svgEl) {
      console.error('[latexToImage] MathJax produced no <svg> for:', latex);
      return null;
    }

    // Compute pixel dimensions from MathJax's ex-based width/height.
    const width  = Math.ceil(unitToPx(svgEl.getAttribute('width'),  fontSize)) || 40;
    const height = Math.ceil(unitToPx(svgEl.getAttribute('height'), fontSize)) || Math.ceil(fontSize * 1.5);

    // Rewrite the SVG's width/height in PIXELS. MathJax emits them in `ex`, a
    // unit browsers cannot resolve when the SVG is loaded via <img> (no font
    // context), so the image gets a wrong intrinsic size and drawImage()
    // distorts it — badly enough for wide \begin{array} tables to rasterise as a
    // solid black block. Explicit px keeps the aspect ratio correct.
    svgEl.setAttribute('width', String(width));
    svgEl.setAttribute('height', String(height));

    // Replace currentColor (fill AND stroke — array rules use stroke) so the
    // SVG renders black on the canvas.
    let svgString = svgEl.outerHTML.replace(/currentColor/g, '#000000');

    // Ensure standalone SVG namespaces (needed for Blob-loaded images and <use> refs).
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!svgString.includes('xmlns:xlink')) {
      svgString = svgString.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const dataUrl = await svgToPngDataUrl(svgString, width, height);
    if (!dataUrl) return null;

    return { svgString, dataUrl, width, height };
  } catch (e) {
    console.error('[latexToImage]', latex, e);
    return null;
  }
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const cache = new Map<string, Promise<LatexPng | null>>();

export function latexToPngCached(latex: string, fontSize?: number): Promise<LatexPng | null> {
  const key = `${latex}::${fontSize ?? 16}`;
  if (!cache.has(key)) cache.set(key, latexToPng(latex, fontSize));
  return cache.get(key)!;
}
