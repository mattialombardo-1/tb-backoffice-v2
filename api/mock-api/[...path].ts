/**
 * Funzione serverless Vercel — stesso mock server di `mock/`, servito qui
 * invece che dal middleware del dev server Vite (`mock/index.ts`,
 * `configureServer`), che esiste solo dentro `vite`/`npm run dev:mock` e non
 * sopravvive a una build statica. Riusa router e handler pari pari: nessuna
 * logica duplicata, solo un adattatore tra la richiesta Vercel e `Ctx`.
 *
 * Attiva solo per il deploy demo (`vite build --mode demo`, vedi
 * package.json e .env.demo, che punta `VITE_API_BASE_URL` a `/api/mock-api`
 * — relativo, risolto contro l'origine corrente da
 * src/lib/api/client.ts): la build "vera" (`npm run build`) non usa questo
 * path, quindi in produzione con backend reale questa funzione resta
 * semplicemente inutilizzata.
 *
 * Limite noto: `getDb()` tiene lo stato in un modulo Node in memoria (vedi
 * mock/db.ts) — su Vercel non c'è garanzia che richieste diverse finiscano
 * sulla stessa istanza calda della funzione, quindi tra due click ravvicinati
 * lo stato può risultare non condiviso (o azzerarsi del tutto a freddo). Va
 * bene per una demo puntata da un link; non è pensato per un uso prolungato o
 * per più persone che testano in contemporanea — per quello vedi le altre
 * opzioni di deploy discusse con l'utente (hosting con processo persistente).
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { getDb } from '../../mock/db.js';
import { registerCatalogRoutes } from '../../mock/handlers/catalog.js';
import { registerPeopleRoutes } from '../../mock/handlers/people.js';
import { registerQuestionRoutes } from '../../mock/handlers/questions.js';
import { createRouter, HttpError, sendJson, type Ctx } from '../../mock/router.js';

// Stesso identico ordine di registrazione di mock/index.ts. Lazy (non al
// caricamento del modulo): un errore qui dentro (es. nel seed di mock/db.ts)
// a livello di modulo farebbe fallire l'intera funzione con un
// FUNCTION_INVOCATION_FAILED opaco di Vercel, senza nessun dettaglio — vedi
// initError sotto, che invece lo trasforma in una risposta JSON leggibile.
let router: ReturnType<typeof createRouter> | null = null;
let initError: Error | null = null;

function ensureInitialized(): void {
  if (router || initError) return;
  try {
    router = createRouter();
    registerQuestionRoutes(router);
    registerCatalogRoutes(router);
    registerPeopleRoutes(router);

    const db = getDb();
    console.info(
      `[mock] API demo attiva — ${db.questions.length} domande, ${db.subjects.length} materie, ` +
        `${db.collections.length} collection, ${db.pools.length} banche dati`
    );
  } catch (err) {
    initError = err instanceof Error ? err : new Error(String(err));
    console.error('[mock] errore di inizializzazione:', initError.stack ?? initError.message);
  }
}

// Vercel arricchisce IncomingMessage con `body` già parsato per Content-Type
// application/json come manda sempre il client (vedi src/lib/api/client.ts)
// — niente tipi `@vercel/node` per restare senza dipendenze aggiuntive, come
// il resto di mock/ (vedi il commento in cima a mock/router.ts). `req.query`
// (i segmenti del catch-all `[...path]`) esiste ma si è rivelato inaffidabile
// in produzione — usiamo solo `req.url`, sempre presente, sotto.
interface VercelLikeRequest extends IncomingMessage {
  body?: unknown;
}

/** Stesso prefisso che il middleware del dev server toglie da req.url (vedi
 *  API_PREFIX in mock/index.ts) — qui la funzione vive sotto /api invece che
 *  alla radice, quindi il prefisso da togliere è diverso ma il principio è
 *  identico: /api/mock-api/questions/my-reviews → /questions/my-reviews. */
const FUNCTION_PREFIX = '/api/mock-api';

export default async function handler(req: VercelLikeRequest, res: ServerResponse): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase();

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  ensureInitialized();
  if (initError || !router) {
    sendJson(res, 500, {
      error: initError?.message ?? 'Mock server init failed',
      stack: initError?.stack,
      statusCode: 500,
    });
    return;
  }

  const url = new URL(req.url ?? '/', 'http://localhost');
  const path = url.pathname.startsWith(FUNCTION_PREFIX)
    ? url.pathname.slice(FUNCTION_PREFIX.length) || '/'
    : url.pathname;
  const matched = router.match(method, path);

  if (!matched) {
    // Stesso trattamento del middleware: 200 vuoto invece di 404, il client
    // ritenta tutto tranne 401/403 (src/lib/api/client.ts) — un endpoint
    // dimenticato costerebbe 4 tentativi e ~6s prima di far fallire la
    // schermata.
    console.warn(`[mock] nessun handler per ${method} ${path} — risposta vuota`);
    sendJson(res, 200, { data: [], total: 0, page: 1, limit: 20 });
    return;
  }

  try {
    const ctx: Ctx = {
      method,
      path,
      params: matched.params,
      query: url.searchParams,
      body: req.body,
    };
    const result = await matched.handler(ctx);
    sendJson(res, result === undefined ? 204 : 200, result);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Mock server error';
    if (status >= 500) console.error(`[mock] ${method} ${path}: ${message}`);
    sendJson(res, status, { error: message, message, statusCode: status });
  }
}
