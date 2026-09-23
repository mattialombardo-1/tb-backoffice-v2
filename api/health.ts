// Funzione diagnostica temporanea — per capire se FUNCTION_INVOCATION_FAILED
// viene da un import cross-directory verso mock/ o da qualcos'altro. Da
// rimuovere una volta risolto.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { createRng, objectId } from '../mock/rng';
import { getDb } from '../mock/db';

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  const rng = createRng(1);
  const id = objectId(rng);
  let dbInfo: unknown;
  let dbError: string | null = null;
  try {
    const db = getDb();
    dbInfo = { questions: db.questions.length, subjects: db.subjects.length };
  } catch (err) {
    dbError = err instanceof Error ? (err.stack ?? err.message) : String(err);
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      ok: true,
      node: process.version,
      time: new Date().toISOString(),
      rngWorks: id.length === 24,
      dbInfo,
      dbError,
    })
  );
}
