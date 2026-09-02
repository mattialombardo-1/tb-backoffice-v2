/**
 * Deterministic PRNG (mulberry32).
 *
 * The seed dataset must be identical on every dev-server restart: screenshots,
 * before/after comparisons and shared links all break if question ids or the
 * difficulty distribution drift between runs.
 */
export function createRng(seed: number) {
  let state = seed >>> 0;

  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Integer in [min, max] inclusive. */
    int(min: number, max: number): number {
      return min + Math.floor(next() * (max - min + 1));
    },
    pick<T>(items: readonly T[]): T {
      return items[Math.floor(next() * items.length)];
    },
    /** True with probability `p`. */
    chance(p: number): boolean {
      return next() < p;
    },
    /** Picks from a `[value, weight]` table. */
    weighted<T>(table: readonly (readonly [T, number])[]): T {
      const total = table.reduce((acc, [, w]) => acc + w, 0);
      let roll = next() * total;
      for (const [value, weight] of table) {
        roll -= weight;
        if (roll <= 0) return value;
      }
      return table[table.length - 1][0];
    },
    shuffle<T>(items: T[]): T[] {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;

/**
 * Distribuzione *esatta* invece che campionata.
 *
 * Con 200 elementi, estrarre 200 volte da una tabella pesata lascia scarti di
 * diversi punti percentuali rispetto ai pesi dichiarati (rumore statistico
 * normale, non un bug del PRNG). Per un dataset di seed conta che le
 * proporzioni siano quelle progettate: costruiamo la lista con i conteggi
 * giusti e la mescoliamo.
 */
export function stratify<T>(
  rng: Rng,
  table: readonly (readonly [T, number])[],
  count: number
): T[] {
  const total = table.reduce((acc, [, w]) => acc + w, 0);
  const out: T[] = [];
  for (const [value, weight] of table) {
    const n = Math.round((weight / total) * count);
    for (let i = 0; i < n; i++) out.push(value);
  }
  // Gli arrotondamenti possono lasciare uno o due posti scoperti/in eccesso.
  while (out.length < count) out.push(table[0][0]);
  out.length = count;
  return rng.shuffle(out);
}

/**
 * Mongo-like 24-hex ObjectId, derived from the rng so it stays stable.
 * Several screens print raw ids (`CopyableId`, the reviews table), so they need
 * to *look* like real ObjectIds rather than `q-17`.
 */
export function objectId(rng: Rng): string {
  let out = '';
  for (let i = 0; i < 24; i++) out += '0123456789abcdef'[rng.int(0, 15)];
  return out;
}
