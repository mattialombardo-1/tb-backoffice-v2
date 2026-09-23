// Funzione diagnostica temporanea, senza dipendenze da mock/ — per capire se
// FUNCTION_INVOCATION_FAILED viene da lì o da qualcosa a monte (config Vercel,
// runtime, bundling). Da rimuovere una volta risolto.
import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ ok: true, node: process.version, time: new Date().toISOString() }));
}
