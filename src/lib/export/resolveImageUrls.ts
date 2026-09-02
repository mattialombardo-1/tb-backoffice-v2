import type { APIClient } from '@/lib/api/client';
import { questionImagesService } from '@/lib/services/questionImages';
import type { ExportCollection } from '@/lib/types/export';
import type { QuestionListItem } from '@/lib/types/questions';

// ─── Image URL resolution ─────────────────────────────────────────────────────
// Shared by the collections/questions export dialogs and the question edit form.
// Plain S3 keys stored on questions are not publicly fetchable, so they are
// swapped for presigned view URLs. Crucially, only URLs that belong to the
// presignable `immaginidomande` bucket (or bare keys) are sent to getViewUrls —
// absolute URLs to any other host are already usable and must pass through
// untouched, otherwise the backend presigns them as a key inside
// `immaginidomande` and corrupts the URL.

/** Base endpoint for image URLs stored as relative paths/keys. */
const IMAGE_BASE_URL = 'https://immaginidomande.s3.eu-south-1.amazonaws.com/';

/** Host of the bucket the backend can presign. */
const PRESIGN_HOST_RE = /immaginidomande\.s3\./i;

/**
 * Resolves an image URL to an absolute one, prepending the S3 base ONLY for bare
 * keys/relative paths. URLs that are already absolute are left untouched (this
 * includes ones that carry an S3 host but omit the scheme).
 */
export function toAbsoluteImageUrl(url: string): string {
  if (!url) return url;
  const u = url.trim();
  if (!u || u.startsWith('data:')) return url;
  if (/^https?:\/\//i.test(u)) return u; // already absolute with scheme
  if (u.startsWith('//')) return `https:${u}`; // protocol-relative
  if (/amazonaws\.com\//i.test(u)) return `https://${u.replace(/^\/+/, '')}`; // host present, scheme missing
  return IMAGE_BASE_URL + u.replace(/^\/+/, ''); // bare key / relative path
}

/**
 * Whether a URL must be presigned via getViewUrls. True for bare keys/relative
 * paths and for absolute URLs in the `immaginidomande` bucket. False for data
 * URIs and absolute URLs on any other host (e.g. `elliot-documents-mi`), which
 * are already usable — presigning them would corrupt the URL.
 */
function isPresignable(url: string): boolean {
  const u = url.trim();
  if (!u || u.startsWith('data:')) return false;
  if (/^https?:\/\//i.test(u) || u.startsWith('//')) return PRESIGN_HOST_RE.test(u);
  return true; // bare key / relative path → belongs to the presignable bucket
}

/**
 * Resolves an array of stored image URLs to display URLs, preserving order.
 * Presignable URLs are swapped for presigned view URLs; everything else is
 * normalised to an absolute URL and passed through as-is.
 */
export async function resolveViewUrls(
  client: APIClient,
  urls: string[],
  signal?: AbortSignal
): Promise<string[]> {
  const abs = urls.map(toAbsoluteImageUrl);
  const idxs: number[] = [];
  const toSign: string[] = [];
  urls.forEach((orig, i) => {
    if (isPresignable(orig)) {
      idxs.push(i);
      toSign.push(abs[i]);
    }
  });

  const signed = toSign.length
    ? await questionImagesService.getViewUrls(client, toSign, signal)
    : [];

  const out = abs.slice();
  idxs.forEach((originalIndex, k) => {
    out[originalIndex] = signed[k] ?? abs[originalIndex];
  });
  return out;
}

export function extractImgSrcs(html: string): string[] {
  return [...html.matchAll(/src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((u) => u && !u.startsWith('data:'));
}

function replaceImgSrcs(html: string, resolve: (src: string) => string): string {
  return html.replace(/src="([^"]+)"/g, (match, url) => {
    if (url.startsWith('data:')) return match;
    return `src="${resolve(url)}"`;
  });
}

/**
 * Resolves every distinct image reference across a flat question list (as used
 * by the CSV/XLSX export, which has no HTML `src` to rewrite) to a display URL,
 * returned as an original→resolved lookup map. Presigned URLs expire in 12h
 * (see questionImages.ts), so a CSV/XLSX re-import must happen within that window.
 */
export async function resolveQuestionListImageUrls(
  client: APIClient,
  items: QuestionListItem[]
): Promise<Map<string, string>> {
  const originals = new Set<string>();
  const add = (u: string | undefined | null) => {
    if (u && !u.startsWith('data:')) originals.add(u);
  };
  for (const q of items) {
    (q.questionImages ?? []).forEach(add);
    (q.explanationImages ?? []).forEach(add);
    q.alternatives.forEach((a) => add(a.image));
  }

  const list = [...originals];
  if (!list.length) return new Map();

  const view = await resolveViewUrls(client, list);
  return new Map(list.map((u, i) => [u, view[i]]));
}

export async function resolveImageUrls(client: APIClient, collections: ExportCollection[]) {
  // Collect every distinct image reference by its ORIGINAL stored value.
  const originals = new Set<string>();
  const add = (u: string | undefined | null) => {
    if (u && !u.startsWith('data:')) originals.add(u);
  };

  for (const col of collections) {
    for (const section of col.sections) {
      for (const q of section.questions) {
        (q.questionImages ?? []).forEach(add);
        (q.explanationImages ?? []).forEach(add);
        q.alternatives.forEach((a) => add(a.image));
        extractImgSrcs(q.questionText).forEach(add);
        extractImgSrcs(q.explanationText ?? '').forEach(add);
      }
    }
  }

  const list = [...originals];
  if (!list.length) return;

  const view = await resolveViewUrls(client, list);
  const map = new Map(list.map((u, i) => [u, view[i]]));
  const resolveOne = (u: string) => map.get(u) ?? toAbsoluteImageUrl(u);

  for (const col of collections) {
    for (const section of col.sections) {
      for (const q of section.questions) {
        q.questionImages = (q.questionImages ?? []).map(resolveOne);
        q.explanationImages = (q.explanationImages ?? []).map(resolveOne);
        q.alternatives = q.alternatives.map((a) => ({
          ...a,
          image: a.image ? resolveOne(a.image) : a.image,
        }));
        q.questionText = replaceImgSrcs(q.questionText, resolveOne);
        q.explanationText = replaceImgSrcs(q.explanationText ?? '', resolveOne);
      }
    }
  }
}
