import { useMemo } from 'react';
import type {
  BatchOutcome,
  HierarchyItem,
  MyReviewStatus,
  MyReviewsFilters,
  QuestionListItem,
} from '@/lib/types/questions';
import { getGenerationId } from './questionGenerationBatches';
import { useMyReviews } from './useMyReviews';

export interface ArgomentoOption extends HierarchyItem {
  subjectId: string;
}

const EMPTY_FILTERS: MyReviewsFilters = {
  materias: [],
  argomenti: [],
  statuses: [],
  outcomes: [],
  dateFrom: '',
  dateTo: '',
  search: '',
};

// yyyy-MM-dd, confrontabile lessicograficamente — stesso formato usato dai filtri di
// QuestionsListFilters (Periodo) e dal <Calendar> che li alimenta.
function isoDateOnly(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// isReviewed viene da fuori (liveIds, in useReviewBatches) — non da q.status: quel campo
// resta quello dell'ultimo fetch da myReviews() (sempre TO_REVIEW), quindi da solo non
// distingue "ancora da revisionare" da "già revisionata in questa sessione".
function matchesFilters(
  q: QuestionListItem,
  filters: MyReviewsFilters,
  isReviewed: boolean
): boolean {
  if (filters.materias.length > 0 && !filters.materias.includes(q.subjectId)) return false;
  if (filters.argomenti.length > 0 && !filters.argomenti.includes(q.topicId)) return false;
  if (filters.statuses.length > 0) {
    const status: MyReviewStatus = isReviewed ? 'REVIEWED' : 'TO_REVIEW';
    if (!filters.statuses.includes(status)) return false;
  }

  const day = isoDateOnly(q.createdAt);
  if (filters.dateFrom && day < filters.dateFrom) return false;
  if (filters.dateTo && day > filters.dateTo) return false;

  const search = filters.search.trim().toLowerCase();
  if (search) {
    const text = q.questionText.replace(/<[^>]+>/g, '').toLowerCase();
    if (!text.includes(search) && !q.id.toLowerCase().includes(search)) return false;
  }

  return true;
}

export interface ReviewBatchQuestion extends QuestionListItem {
  /** true = revisionata in questa sessione (non più TO_REVIEW sul server, ma la teniamo
   *  visibile — attenuata, in fondo — finché il batch non è completamente svuotato). */
  reviewedInSession: boolean;
}

export interface ReviewBatch {
  key: string;
  subjectId: string;
  materiaName: string;
  argomentoName: string;
  dateLabel: string;
  /** Timestamp (ms) del batch, per ordinare dal più recente — dateLabel da solo non basta:
   *  è già formattata (it-IT, gg/mm/aaaa) e un confronto tra stringhe darebbe un ordine
   *  sbagliato appena cambia il mese (es. "03/02" ordinerebbe prima di "25/01"). */
  createdAtMs: number;
  pending: ReviewBatchQuestion[];
  reviewed: ReviewBatchQuestion[];
  /** Esito mock della generazione — vedi il commento su BatchOutcome in types/questions.ts e
   *  su mockOutcomeForBatch qui sotto. */
  outcome: BatchOutcome;
  /** Solo per PARTIAL/ERROR — mock del "perché mancano le altre" richiesto dal brief. */
  outcomeReason?: string;
  /** Solo per PARTIAL — quantità mock richiesta in origine, per il "Generate N/M domande" nel
   *  boxettino: N è pending.length + reviewed.length (quello è vero), M è mockato — vedi
   *  mockRequestedForBatch. */
  outcomeRequested?: number;
  /** Solo per IN_PROGRESS — percentuale mock di avanzamento per il badge "Elaborazione in
   *  corso" — vedi mockProgressForBatch. */
  outcomeProgress?: number;
}

// Proposta di design: un batch "vero" ha più di una domanda — un singolo invio isolato non
// è una generazione, resta nella lista piatta sotto.
const MIN_BATCH_SIZE = 2;

// Mock dell'esito di generazione — nessun job reale da interrogare (vedi BatchOutcome in
// types/questions.ts). I tre batch demo fissi (seedati in mock/db.ts al riavvio del server —
// vedi il commento lì) sono l'UNICO caso con un esito diverso da "Elaborazione Completata",
// riconosciuti per materia + argomento + giorno esatti: stessa terna letterale duplicata in
// mock/db.ts (mock/ non importa da src/, vedi il commento in cima a quel file) — se uno dei
// tre valori cambia in un posto va cambiato anche nell'altro.
//
// Qualunque altro batch — generato dal vivo durante la demo, o dalla stessa generazione dopo
// un riavvio del server — deve invece risultare sempre COMPLETED: chi genera domande per il
// cliente si aspetta un esito riuscito, non un errore/parziale pescato a caso. Il
// riconoscimento è per attributi (materia/argomento/giorno), non per generationId/chiave
// "gen::" (che pure identifica una generazione in modo univoco, vedi makeBatchKey sotto):
// quella chiave si perde con un refresh della pagina (azzera la memoria client-side del
// generationId, vedi questionToGenerationId in questionGenerationBatches.ts), quindi un
// batch generato dal vivo, ricaricando la pagina, ricadrebbe sulla stessa chiave per attributi
// dei batch demo — ma materia/argomento/giorno di una generazione reale coincidono con quelli
// fissi qui sotto solo se l'utente sceglie esattamente la stessa materia/argomento nello
// stesso giorno di calendario di uno dei tre batch demo. Un caso limite accettato, non quello
// che la demo deve mostrare.
const DEMO_MATERIA = 'Biologia';
const DEMO_ARGOMENTO = 'La chimica dei viventi';
const DEMO_OUTCOME_BY_DAY: Partial<Record<string, BatchOutcome>> = {
  '01/09/2026': 'IN_PROGRESS',
  '31/08/2026': 'PARTIAL',
  '30/08/2026': 'ERROR',
};

function mockOutcomeForBatch(
  materiaName: string,
  argomentoName: string,
  dayLabel: string
): BatchOutcome {
  if (materiaName === DEMO_MATERIA && argomentoName === DEMO_ARGOMENTO) {
    const demoOutcome = DEMO_OUTCOME_BY_DAY[dayLabel];
    if (demoOutcome) return demoOutcome;
  }
  return 'COMPLETED';
}

// Il conteggio generato ("N" in "N/M domande") non serve mockarlo a parte: è già
// pending.length + reviewed.length, il conteggio vero del batch reale riusato per il mock —
// vedi outcomeRequested sopra. Il resto della frase (perché mancano le altre) resta breve
// apposta: il copy definitivo va rifatto insieme, questo è solo un segnaposto.
const MOCK_PARTIAL_REASON = "Fonti insufficienti per l'intera quantità richiesta.";
// Solo la coda della frase — "Creazione domande interrotta" (in semibold) è hardcoded nel
// JSX di MyReviewsBatchGroup, stesso pattern del prefisso "Generate N/M domande." di PARTIAL.
const MOCK_ERROR_REASON = "per un errore imprevisto durante l'elaborazione.";

// Hash della chiave del batch — usato solo per la percentuale mock di avanzamento (vedi
// mockProgressForBatch sotto): l'esito non passa più da un hash (vedi mockOutcomeForBatch
// sopra), ma la percentuale del batch demo "Elaborazione in corso" deve comunque restare
// stabile tra i render e dopo un refresh, quindi resta comunque una funzione pura della
// chiave del batch, non un valore casuale ricalcolato a ogni apertura.
function hashBatchKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  return Math.abs(hash);
}

// "M" in "N/M domande" per PARTIAL — quanto era stato richiesto in origine. +7 fisso invece di
// un rapporto: è un mock, basta che M > N in modo plausibile (vedi il commento su
// outcomeRequested sopra).
function mockRequestedForBatch(generated: number): number {
  return generated + 7;
}

// Percentuale mock per il badge "Elaborazione in corso", ristretta a 15-90: né 0% ("non è
// ancora partita") né 100% ("sarebbe completa", cioè un altro esito).
function mockProgressForBatch(key: string): number {
  return 15 + (hashBatchKey(`progress::${key}`) % 76);
}

// Proposta di design — memoria di sessione (sopravvive alla navigazione dentro la SPA, non
// a un refresh, come il resto del prototipo). L'endpoint reale (/questions/my-reviews)
// restituisce solo le domande ancora TO_REVIEW: appena una viene approvata sparisce dalla
// risposta. Questa mappa ricorda, per ogni batch, tutte le domande viste "da revisionare"
// in questa visita, così quelle appena approvate restano un attimo visibili invece di
// sparire di scatto — e il batch si toglie da solo quando non ne resta più nessuna da fare.
const seenBatchMembers = new Map<string, Map<string, QuestionListItem>>();

function dateKey(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT');
}

// Regola d'oro: ogni generazione forma un batch a sé, mai sommato a uno già esistente con
// stessi materia/argomento/data. Il modo sicuro è l'id di generazione (questionGenerationBatches.ts,
// registrato al momento della creazione) — quando c'è, è lui da solo la chiave: due
// generazioni con gli stessi attributi restano comunque distinte. Senza (domanda creata
// prima di un refresh di pagina, che azzera quella memoria) si ricade sul raggruppamento
// per attributi — materia + argomento + data — il meglio possibile senza un id persistito.
function makeBatchKey(q: Pick<QuestionListItem, 'id' | 'subjectId' | 'topicId'>, dKey: string) {
  const generationId = getGenerationId(q.id);
  if (generationId) return `gen::${generationId}`;
  return `${q.subjectId}::${q.topicId}::${dKey}`;
}

/**
 * Wrapper su `useMyReviews` che raggruppa le domande "da revisionare" in batch — uno per
 * generazione entro questa sessione, per materia + argomento + data altrimenti (vedi
 * makeBatchKey) — con lo split tra quelle ancora da revisionare e quelle già revisionate
 * in questa sessione.
 *
 * `filters` (Stato, Esito, Materia, Argomento, Periodo, ricerca testo/ID — stessi campi di
 * QuestionsListFilters più Esito, specifico di questa schermata) è applicato qui, sulla lista
 * piatta, prima del raggruppamento: `myReviews()` non accetta parametri di filtro
 * (restituisce tutto quanto assegnato al reviewer con status TO_REVIEW), quindi non c'è query
 * da filtrare lato server. Stato è un MyReviewStatus derivato (TO_REVIEW / REVIEWED), non un
 * QuestionStatus di backend — vedi il commento su MyReviewStatus in types/questions.ts. Esito
 * è mockato per intero (vedi mockOutcomeForBatch) — non esiste ancora un job di generazione
 * da interrogare. Materia/Argomento/Periodo sono di fatto uniformi dentro un batch (una
 * generazione è sempre su una sola materia/argomento, la stessa data), quindi filtrarli qui
 * equivale a filtrare per batch — così come Esito, che è per l'appunto una proprietà del
 * batch, non della singola domanda; la ricerca testo/ID e lo Stato invece possono isolare
 * singole domande dentro un batch altrimenti conforme.
 */
export function useReviewBatches(filters: MyReviewsFilters = EMPTY_FILTERS) {
  const { questions: allQuestions, ...rest } = useMyReviews();

  // Opzioni di Materia/Argomento per il filtro, derivate dalle domande stesse (non dal
  // catalogo materie/argomenti): le domande generate da QuestionSetupAccordion hanno un
  // topicId "fixedOptions" (__fixed__...), un id fittizio che non esiste nel catalogo reale
  // — un MultiSelect alimentato dal catalogo (come in QuestionsListFilters) non potrebbe mai
  // corrispondere a quelle domande, cioè la quasi totalità di questa schermata. Derivarle qui
  // garantisce che ogni opzione mostrata sia effettivamente selezionabile.
  const materiaOptions = useMemo<HierarchyItem[]>(() => {
    const byId = new Map<string, string>();
    for (const q of allQuestions) byId.set(q.subjectId, q.materiaName);
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allQuestions]);

  const argomentoOptions = useMemo<ArgomentoOption[]>(() => {
    const byId = new Map<string, ArgomentoOption>();
    for (const q of allQuestions) {
      byId.set(q.topicId, { id: q.topicId, name: q.argomentoName, subjectId: q.subjectId });
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [allQuestions]);

  const batches = useMemo(() => {
    // liveIds e la registrazione in seenBatchMembers restano su allQuestions (NON filtrate):
    // sono lo stato "vero" di cosa è ancora da revisionare sul server. Se si usasse la lista
    // già filtrata, una domanda ancora da revisionare ma esclusa dal filtro risulterebbe
    // "non più live" e verrebbe scambiata per già revisionata (o farebbe sparire l'intero
    // batch) solo perché non corrisponde al filtro corrente — il filtro deve nascondere,
    // non falsare lo stato di revisione.
    const liveIds = new Set(allQuestions.map((q) => q.id));
    const meta = new Map<
      string,
      {
        subjectId: string;
        materiaName: string;
        argomentoName: string;
        dateLabel: string;
        createdAtMs: number;
      }
    >();

    for (const q of allQuestions) {
      const dKey = dateKey(q.createdAt);
      const key = makeBatchKey(q, dKey);
      if (!seenBatchMembers.has(key)) seenBatchMembers.set(key, new Map());
      seenBatchMembers.get(key)!.set(q.id, q);
      if (!meta.has(key))
        meta.set(key, {
          subjectId: q.subjectId,
          materiaName: q.materiaName,
          argomentoName: q.argomentoName,
          dateLabel: dKey,
          createdAtMs: new Date(q.createdAt).getTime(),
        });
    }

    const result: ReviewBatch[] = [];
    for (const [key, members] of seenBatchMembers) {
      // MIN_BATCH_SIZE è una proprietà strutturale del batch (quante domande ne fanno
      // davvero parte), non del risultato filtrato — va controllata qui, sui membri grezzi,
      // non dopo aver applicato lo Stato/la ricerca: un batch da 10 con 9 filtrate via non
      // deve sparire solo perché ne resta "1 sola" a valle del filtro.
      if (members.size < MIN_BATCH_SIZE) continue;

      const pending: ReviewBatchQuestion[] = [];
      const reviewed: ReviewBatchQuestion[] = [];
      for (const [id, q] of members) {
        // Il filtro agisce qui, a livello di singola domanda: Materia/Argomento/Periodo sono
        // uniformi dentro un batch (una generazione è su una sola materia/argomento/data),
        // quindi in pratica nascondono l'intero batch; la ricerca testo/ID e lo Stato possono
        // invece isolare singole domande dentro un batch altrimenti conforme.
        const isReviewed = !liveIds.has(id);
        if (!matchesFilters(q, filters, isReviewed)) continue;
        if (isReviewed) {
          reviewed.push({ ...q, reviewedInSession: true });
        } else {
          pending.push({ ...q, reviewedInSession: false });
        }
      }
      // Di norma un batch senza più nulla da revisionare sparisce dalla coda (comportamento
      // di default, come una inbox svuotata) — a meno che l'utente non abbia chiesto
      // esplicitamente "Stato: Già revisionate", nel qual caso è proprio quello che vuole
      // vedere.
      const wantsReviewed = filters.statuses.includes('REVIEWED');
      if (pending.length === 0 && !(wantsReviewed && reviewed.length > 0)) continue;

      // pending[0] da solo non basta più: con "Stato: Già revisionate" un batch può arrivare
      // qui a pending vuoto (interamente revisionato) — in quel caso meta.get(key) è anche lui
      // assente (meta deriva da allQuestions, cioè dai soli membri ancora live), quindi il
      // fallback deve poter attingere a reviewed[0]. Il controllo sopra garantisce che almeno
      // uno dei due non sia vuoto a questo punto.
      const first = pending[0] ?? reviewed[0];
      const info = meta.get(key) ?? {
        subjectId: first.subjectId,
        materiaName: first.materiaName,
        argomentoName: first.argomentoName,
        dateLabel: dateKey(first.createdAt),
        createdAtMs: new Date(first.createdAt).getTime(),
      };

      const outcome = mockOutcomeForBatch(info.materiaName, info.argomentoName, info.dateLabel);
      if (filters.outcomes.length > 0 && !filters.outcomes.includes(outcome)) continue;

      result.push({
        key,
        ...info,
        pending,
        reviewed,
        outcome,
        ...(outcome === 'PARTIAL' && {
          outcomeReason: MOCK_PARTIAL_REASON,
          outcomeRequested: mockRequestedForBatch(pending.length + reviewed.length),
        }),
        ...(outcome === 'ERROR' && { outcomeReason: MOCK_ERROR_REASON }),
        ...(outcome === 'IN_PROGRESS' && { outcomeProgress: mockProgressForBatch(key) }),
      });
    }

    // Il più recente in alto, a scendere fino al più vecchio — solo il momento di
    // generazione, nessuna distinzione tra esiti (niente priorità a IN_PROGRESS o
    // simili: era stato provato, tolto su richiesta).
    return result.sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [allQuestions, filters]);

  const batchedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const b of batches) {
      for (const q of b.pending) ids.add(q.id);
    }
    return ids;
  }, [batches]);

  const unbatched = useMemo(
    // allQuestions è sempre la lista live da myReviews() — isReviewed è sempre false qui,
    // mai "Già revisionate" (quelle non sono più in allQuestions una volta uscite dal server).
    () => allQuestions.filter((q) => matchesFilters(q, filters, false) && !batchedIds.has(q.id)),
    [allQuestions, filters, batchedIds]
  );

  return { batches, unbatched, materiaOptions, argomentoOptions, ...rest };
}
