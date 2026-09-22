/**
 * Endpoint delle domande — la superficie su cui si lavora davvero.
 *
 * Filtri e paginazione sono implementati sul serio: se qui i filtri fossero
 * finti, il prototipo non direbbe nulla su come si cerca una domanda.
 */
import { getDb, type Db, type DbQuestion, type DbQuestionStatus } from '../db';
import {
  asRecord,
  asStringArray,
  csv,
  HttpError,
  num,
  paginate,
  stripHtml,
  type Ctx,
  type Router,
} from '../router';
import { createRng, objectId } from '../rng';

const idRng = createRng(999);

interface Filters {
  statuses: string[];
  subjectIds: string[];
  topicIds: string[];
  languages: string[];
  difficulties: number[];
  types: string[];
  authors: string[];
  tags: string[];
  collectionIds: string[];
  collectionIdsMode: 'include' | 'exclude';
  poolIds: string[];
  poolIdsMode: 'include' | 'exclude';
  dateFrom: string;
  dateTo: string;
  unpublished: boolean;
  search: string;
}

const EMPTY: Filters = {
  statuses: [],
  subjectIds: [],
  topicIds: [],
  languages: [],
  difficulties: [],
  types: [],
  authors: [],
  tags: [],
  collectionIds: [],
  collectionIdsMode: 'include',
  poolIds: [],
  poolIdsMode: 'include',
  dateFrom: '',
  dateTo: '',
  unpublished: false,
  search: '',
};

/** GET /questions manda i filtri come parametri CSV. */
function filtersFromQuery(q: URLSearchParams): Filters {
  return {
    ...EMPTY,
    statuses: csv(q, 'statuses'),
    subjectIds: csv(q, 'subjectIds'),
    topicIds: csv(q, 'topicIds'),
    languages: csv(q, 'languages'),
    difficulties: csv(q, 'difficulties').map(Number).filter(Number.isFinite),
    types: csv(q, 'types'),
    authors: csv(q, 'authors'),
    tags: csv(q, 'tags'),
    dateFrom: q.get('dateFrom') ?? '',
    dateTo: q.get('dateTo') ?? '',
    search: q.get('search') ?? '',
  };
}

/** POST /questions/list manda gli stessi filtri come JSON body. */
function filtersFromBody(raw: unknown): Filters {
  const b = asRecord(raw);
  const mode = (v: unknown): 'include' | 'exclude' => (v === 'exclude' ? 'exclude' : 'include');
  return {
    ...EMPTY,
    statuses: asStringArray(b.statuses),
    subjectIds: asStringArray(b.subjectIds),
    topicIds: asStringArray(b.topicIds),
    languages: asStringArray(b.languages),
    difficulties: Array.isArray(b.difficulties)
      ? (b.difficulties as unknown[]).map(Number).filter(Number.isFinite)
      : [],
    types: asStringArray(b.types),
    authors: asStringArray(b.authors),
    tags: asStringArray(b.tags),
    collectionIds: asStringArray(b.collectionIds),
    collectionIdsMode: mode(b.collectionIdsMode),
    poolIds: asStringArray(b.poolIds),
    poolIdsMode: mode(b.poolIdsMode),
    dateFrom: typeof b.dateFrom === 'string' ? b.dateFrom : '',
    dateTo: typeof b.dateTo === 'string' ? b.dateTo : '',
    unpublished: b.unpublished === true,
    search: typeof b.search === 'string' ? b.search : '',
  };
}

/** Ids delle domande contenute in ciascuna collection / pool. */
function collectionQuestionIds(db: Db, collectionId: string): Set<string> {
  const c = db.collections.find((x) => x._id === collectionId);
  const ids = new Set<string>();
  for (const s of c?.sections ?? []) for (const q of s.questions) ids.add(q.questionId);
  return ids;
}

function poolQuestionIds(db: Db, poolId: string): Set<string> {
  return new Set(db.pools.find((p) => p._id === poolId)?.questionIds ?? []);
}

function unionOf(sets: Set<string>[]): Set<string> {
  const out = new Set<string>();
  for (const s of sets) for (const v of s) out.add(v);
  return out;
}

/** Tutte le domande referenziate da almeno una collection o un pool. */
function publishedIds(db: Db): Set<string> {
  return unionOf([
    ...db.collections.map((c) => collectionQuestionIds(db, c._id)),
    ...db.pools.map((p) => poolQuestionIds(db, p._id)),
  ]);
}

export function applyFilters(db: Db, f: Filters): DbQuestion[] {
  // Gli autori arrivano dalla UI come cognitoId (useAuthorsList); nel db la
  // domanda referenzia l'_id del community user. Accettiamo entrambi.
  const authorIds = new Set(
    f.authors.flatMap((a) => {
      const user = db.communityUsers.find((u) => u.cognitoId === a || u._id === a);
      return user ? [user._id, user.cognitoId] : [a];
    })
  );

  const inCollections = f.collectionIds.length
    ? unionOf(f.collectionIds.map((id) => collectionQuestionIds(db, id)))
    : null;
  const inPools = f.poolIds.length ? unionOf(f.poolIds.map((id) => poolQuestionIds(db, id))) : null;
  const published = f.unpublished ? publishedIds(db) : null;
  const needle = f.search.trim().toLowerCase();

  return db.questions.filter((q) => {
    if (q.archived) return false;
    if (f.statuses.length && !f.statuses.includes(q.status)) return false;
    if (f.subjectIds.length && !f.subjectIds.includes(q.subjectId)) return false;
    if (f.topicIds.length && !f.topicIds.includes(q.topicId)) return false;
    if (f.languages.length && !f.languages.includes(q.language)) return false;
    if (f.difficulties.length && !f.difficulties.includes(q.difficulty)) return false;
    if (f.types.length && !f.types.includes(q.type)) return false;
    if (f.authors.length && !authorIds.has(q.authorId)) return false;
    if (f.tags.length && !q.tags.some((t) => f.tags.includes(t))) return false;

    if (inCollections) {
      const present = inCollections.has(q._id);
      if (f.collectionIdsMode === 'exclude' ? present : !present) return false;
    }
    if (inPools) {
      const present = inPools.has(q._id);
      if (f.poolIdsMode === 'exclude' ? present : !present) return false;
    }
    if (published && published.has(q._id)) return false;

    if (f.dateFrom && q.createdAt < f.dateFrom) return false;
    // dateTo è una data senza ora: confrontando le stringhe ISO servirebbe il
    // fine giornata, altrimenti si perde tutto ciò che è stato creato quel giorno.
    if (f.dateTo && q.createdAt > `${f.dateTo}T23:59:59.999Z`) return false;

    if (needle) {
      const haystack = [
        stripHtml(q.questionText),
        stripHtml(q.explanationText),
        q.subject.name,
        q.topic.name,
        q.subtopic.name,
        q.author.email,
        ...q.alternatives.map((a) => stripHtml(a.text)),
        ...q.completionAnswers,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) return false;
    }

    return true;
  });
}

/** Il backend restituisce le domande dalla più recente. */
const byUpdatedDesc = (a: DbQuestion, b: DbQuestion) => (a.updatedAt < b.updatedAt ? 1 : -1);

function associationsOf(db: Db, questionId: string) {
  return {
    collections: db.collections
      .filter((c) => c.sections.some((s) => s.questions.some((q) => q.questionId === questionId)))
      .map((c) => ({ id: c._id, name: c.name })),
    pools: db.pools
      .filter((p) => p.questionIds.includes(questionId))
      .map((p) => ({ id: p._id, name: p.name })),
  };
}

function findQuestion(db: Db, id: string): DbQuestion {
  const q = db.questions.find((x) => x._id === id);
  if (!q) throw new HttpError(404, `Question ${id} not found`);
  return q;
}

/** Applica il body di POST /questions o PUT /questions/{id} sul documento. */
function applyQuestionBody(db: Db, q: DbQuestion, raw: unknown): void {
  const b = asRecord(raw);

  if (typeof b.questionText === 'string') q.questionText = b.questionText;
  if (typeof b.explanationText === 'string') q.explanationText = b.explanationText;
  if (typeof b.difficulty === 'number') q.difficulty = b.difficulty;
  if (typeof b.language === 'string') q.language = b.language as DbQuestion['language'];
  if (Array.isArray(b.questionImages)) q.questionImages = asStringArray(b.questionImages);
  if (Array.isArray(b.explanationImages)) q.explanationImages = asStringArray(b.explanationImages);
  if (Array.isArray(b.tags)) q.tags = asStringArray(b.tags);

  if (Array.isArray(b.alternatives)) {
    q.alternatives = (b.alternatives as unknown[]).map((a) => {
      const alt = asRecord(a);
      return {
        text: typeof alt.text === 'string' ? alt.text : '',
        correct: alt.correct === true,
        ...(typeof alt.image === 'string' ? { image: alt.image } : {}),
      };
    });
  }
  if (Array.isArray(b.completionAnswers)) q.completionAnswers = asStringArray(b.completionAnswers);

  // Il backend deriva il tipo dalla presenza di completionAnswers.
  q.type = q.completionAnswers.length > 0 ? 'COMPLETION' : 'MULTIPLE_CHOICE';

  const subject = asRecord(b.subject);
  if (typeof subject._id === 'string') {
    q.subjectId = subject._id;
    const doc = db.subjects.find((s) => s._id === subject._id);
    q.subject = { name: doc?.name ?? (typeof subject.name === 'string' ? subject.name : '') };
  }
  const topic = asRecord(b.topic);
  if (typeof topic._id === 'string') {
    q.topicId = topic._id;
    const doc = db.subjects.flatMap((s) => s.topics).find((t) => t._id === topic._id);
    q.topic = { name: doc?.name ?? (typeof topic.name === 'string' ? topic.name : '') };
  }
  if (typeof b.subtopicId === 'string') {
    q.subtopicId = b.subtopicId;
    const doc = db.subjects
      .flatMap((s) => s.topics)
      .flatMap((t) => t.subtopics)
      .find((st) => st._id === b.subtopicId);
    q.subtopic = { name: doc?.name ?? '' };
  }

  // `revisor: { id }` è come questionsService.submit assegna il revisore.
  const revisor = asRecord(b.revisor);
  if (typeof revisor.id === 'string') {
    const user = db.communityUsers.find((u) => u._id === revisor.id || u.cognitoId === revisor.id);
    q.revisorId = user?._id ?? revisor.id;
    q.revisor = user ? { email: user.email } : null;
  }

  q.updatedAt = new Date().toISOString();
}

function blankQuestion(db: Db): DbQuestion {
  const now = new Date().toISOString();
  const author = db.communityUsers.find((u) => u._id === db.currentUserId)!;
  return {
    _id: objectId(idRng),
    subjectId: '',
    subject: { name: '' },
    topicId: '',
    topic: { name: '' },
    subtopicId: '',
    subtopic: { name: '' },
    type: 'MULTIPLE_CHOICE',
    difficulty: 0,
    language: 'IT-it',
    questionText: '',
    alternatives: [],
    completionAnswers: [],
    explanationText: '',
    questionImages: [],
    explanationImages: [],
    status: 'DRAFT',
    versionCount: 1,
    authorId: author._id,
    author: { email: author.email },
    revisorId: null,
    revisor: null,
    archived: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function registerQuestionRoutes(router: Router): void {
  // Le rotte statiche vanno dichiarate PRIMA di /questions/:id, altrimenti
  // "my-reviews" verrebbe catturato come un id.
  router.get('/questions/my-reviews', () => {
    const db = getDb();
    // Prototipo: mostra tutto ciò che è TO_REVIEW a prescindere dal revisore assegnato,
    // non solo quelle assegnate all'utente finto — per la demo serve vedere le domande
    // generate a prescindere da chi le revisionerà davvero (vedi anche i tre batch demo
    // fissi in mock/db.ts, pensati apposta per comparire qui appena aperto il link).
    return db.questions.filter((q) => q.status === 'TO_REVIEW').sort(byUpdatedDesc);
  });

  router.get('/questions', ({ query }: Ctx) => {
    const db = getDb();
    const filtered = applyFilters(db, filtersFromQuery(query)).sort(byUpdatedDesc);
    return paginate(filtered, num(query, 'page', 1), num(query, 'limit', 20));
  });

  router.post('/questions/list', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const filtered = applyFilters(db, filtersFromBody(body)).sort(byUpdatedDesc);
    const page = typeof b.page === 'number' ? b.page : 1;
    const limit = typeof b.limit === 'number' ? b.limit : 20;
    return paginate(filtered, page, limit);
  });

  router.post('/questions/list/ids', ({ body }: Ctx) => {
    const db = getDb();
    const filtered = applyFilters(db, filtersFromBody(body));
    const CAP = 20000; // stesso safety valve del backend (listQuestionIds.ts)
    return {
      ids: filtered.slice(0, CAP).map((q) => q._id),
      total: filtered.length,
      truncated: filtered.length > CAP,
    };
  });

  router.post('/questions/export', ({ body }: Ctx) => {
    const db = getDb();
    const ids = asStringArray(asRecord(body).ids);
    const wanted = new Set(ids);
    return {
      questions: db.questions
        .filter((q) => wanted.has(q._id))
        .map((q) => ({ ...q, associations: associationsOf(db, q._id) })),
    };
  });

  // Import bulk: il backend risponde 202 con un jobId e il frontend fa polling.
  // Qui il job è già completo al primo poll — non c'è coda da simulare.
  router.post('/questions/bulk', ({ body }: Ctx) => {
    const db = getDb();
    const items = Array.isArray(asRecord(body).items) ? (asRecord(body).items as unknown[]) : [];
    const results = items.map((item, index) => {
      const raw = asRecord(item);
      const existingId = typeof raw.id === 'string' ? raw.id : null;
      let question: DbQuestion;
      let action: 'created' | 'updated';
      if (existingId && db.questions.some((q) => q._id === existingId)) {
        question = findQuestion(db, existingId);
        action = 'updated';
      } else {
        question = blankQuestion(db);
        db.questions.unshift(question);
        action = 'created';
      }
      applyQuestionBody(db, question, raw);
      return { index, action, questionId: question._id };
    });

    const jobId = objectId(idRng);
    db.bulkJobs[jobId] = {
      jobId,
      status: 'COMPLETED',
      processed: results.length,
      total: results.length,
    };
    // `results` viaggia a parte: BulkJob lo espone solo sullo stato COMPLETED.
    (db.bulkJobs[jobId] as unknown as { results: unknown }).results = results;

    return {
      jobId,
      total: items.length,
      status: 'PENDING',
      statusUrl: `/questions/bulk/${jobId}`,
    };
  });

  router.get('/questions/bulk/:jobId', ({ params }: Ctx) => {
    const db = getDb();
    const job = db.bulkJobs[params.jobId];
    if (!job) throw new HttpError(404, 'Job not found');
    return { ...job, status: 'COMPLETED' };
  });

  router.get('/questions/:id/associations', ({ params }: Ctx) =>
    associationsOf(getDb(), params.id)
  );

  router.get('/questions/:id', ({ params }: Ctx) => findQuestion(getDb(), params.id));

  router.post('/questions', ({ body }: Ctx) => {
    const db = getDb();
    const question = blankQuestion(db);
    applyQuestionBody(db, question, body);
    db.questions.unshift(question);
    return question;
  });

  router.put('/questions/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const question = findQuestion(db, params.id);
    applyQuestionBody(db, question, body);
    question.versionCount += 1;
    return question;
  });

  router.patch('/questions/:id/status', ({ params, body }: Ctx) => {
    const db = getDb();
    const question = findQuestion(db, params.id);
    const status = asRecord(body).status;
    if (typeof status === 'string') question.status = status as DbQuestionStatus;
    question.updatedAt = new Date().toISOString();
    return question;
  });

  router.delete('/questions/:id', ({ params }: Ctx) => {
    const db = getDb();
    const i = db.questions.findIndex((q) => q._id === params.id);
    if (i === -1) throw new HttpError(404, 'Question not found');
    db.questions.splice(i, 1);
    // Ripulisce i riferimenti, altrimenti pool e collection contano domande morte.
    for (const p of db.pools) p.questionIds = p.questionIds.filter((id) => id !== params.id);
    for (const c of db.collections) {
      for (const s of c.sections)
        s.questions = s.questions.filter((q) => q.questionId !== params.id);
    }
    return undefined; // 204
  });

  // --- immagini ------------------------------------------------------------
  // Non c'è nessun S3: si restituiscono placeholder così il browser delle
  // immagini e l'anteprima non esplodono.
  router.get('/question-images', () => ({ images: [] }));
  router.post('/question-images/upload-url', () => {
    const key = `mock/${objectId(idRng)}.png`;
    return {
      // Path relativi: valgono come src di un <img> e non si legano alla porta.
      uploadUrl: '/mock-api/question-images/put',
      imageUrl: `/mock-api/question-images/file/${key}`,
      viewUrl: `/mock-api/question-images/file/${key}`,
      key,
    };
  });
  router.post('/question-images/view-urls', ({ body }: Ctx) => ({
    viewUrls: asStringArray(asRecord(body).urls),
  }));
}
