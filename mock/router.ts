/**
 * Mini-router per il mock server. Nessuna dipendenza: pattern tipo
 * `/questions/:id/status` compilati in regex e confrontati con il path.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface Ctx {
  method: string;
  /** Path senza il prefisso `/mock-api` e senza query string. */
  path: string;
  params: Record<string, string>;
  query: URLSearchParams;
  body: unknown;
}

export type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

interface Route {
  method: string;
  regex: RegExp;
  keys: string[];
  handler: Handler;
}

/**
 * Errore con status code, per rispondere 404/409 dai handler.
 * Niente parameter properties: `erasableSyntaxOnly` è attivo nel tsconfig.
 */
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function createRouter() {
  const routes: Route[] = [];

  const add = (method: string, pattern: string, handler: Handler) => {
    const keys: string[] = [];
    const source = pattern
      .split('/')
      .map((segment) => {
        if (!segment.startsWith(':')) return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        keys.push(segment.slice(1));
        return '([^/]+)';
      })
      .join('/');
    routes.push({ method, regex: new RegExp(`^${source}$`), keys, handler });
  };

  return {
    get: (p: string, h: Handler) => add('GET', p, h),
    post: (p: string, h: Handler) => add('POST', p, h),
    put: (p: string, h: Handler) => add('PUT', p, h),
    patch: (p: string, h: Handler) => add('PATCH', p, h),
    delete: (p: string, h: Handler) => add('DELETE', p, h),

    match(
      method: string,
      path: string
    ): { handler: Handler; params: Record<string, string> } | null {
      for (const route of routes) {
        if (route.method !== method) continue;
        const m = route.regex.exec(path);
        if (!m) continue;
        const params: Record<string, string> = {};
        route.keys.forEach((key, i) => {
          params[key] = decodeURIComponent(m[i + 1]);
        });
        return { handler: route.handler, params };
      }
      return null;
    },
  };
}

export type Router = ReturnType<typeof createRouter>;

export function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      if (chunks.length === 0) return resolve(undefined);
      const raw = Buffer.concat(chunks).toString('utf8');
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
    req.on('error', () => resolve(undefined));
  });
}

export function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  if (status === 204 || payload === undefined) {
    res.statusCode = 204;
    res.end();
    return;
  }
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Length', Buffer.byteLength(body));
  res.end(body);
}

// --- helper condivisi dai handler -----------------------------------------

/** Legge un intero dalla query con default. */
export function num(query: URLSearchParams, key: string, fallback: number): number {
  const raw = query.get(key);
  if (raw == null || raw === '') return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Legge un parametro CSV (`statuses=DRAFT,ACTIVE`) come array. */
export function csv(query: URLSearchParams, key: string): string[] {
  const raw = query.get(key);
  if (!raw) return [];
  return raw
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Pagina un array e restituisce la busta `{ data, total, page, limit }`. */
export function paginate<T>(items: T[], page: number, limit: number) {
  const safePage = Math.max(1, page || 1);
  const start = (safePage - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    total: items.length,
    page: safePage,
    limit,
  };
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

/** Rimuove i tag HTML — serve alla ricerca full-text sul testo delle domande. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ');
}
