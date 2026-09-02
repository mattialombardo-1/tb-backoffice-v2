/**
 * Materie, banche dati, collection, test, pacchetti, SKU, tag, attributi, brand.
 *
 * Profondità inferiore rispetto alle domande: qui serve che le schermate si
 * popolino e i flussi non si rompano, non che ogni regola di business sia
 * replicata.
 */
import { getDb, type Db, type DbCollection, type DbCollectionSection } from '../db';
import {
  asRecord,
  asStringArray,
  csv,
  HttpError,
  num,
  paginate,
  type Ctx,
  type Router,
} from '../router';
import { createRng, objectId } from '../rng';

const idRng = createRng(4242);

// ---------------------------------------------------------------------------

function poolPayload(db: Db, poolId: string) {
  const pool = db.pools.find((p) => p._id === poolId);
  if (!pool) throw new HttpError(404, 'Pool not found');

  const counts = new Map<string, { subjectId: string; subjectName: string; count: number }>();
  for (const qid of pool.questionIds) {
    const q = db.questions.find((x) => x._id === qid);
    if (!q) continue;
    const entry = counts.get(q.subjectId) ?? {
      subjectId: q.subjectId,
      subjectName: q.subject.name,
      count: 0,
    };
    entry.count += 1;
    counts.set(q.subjectId, entry);
  }

  return {
    _id: pool._id,
    name: pool.name,
    description: pool.description,
    status: pool.status,
    totalQuestions: pool.questionIds.length,
    questionCountBySubject: [...counts.values()].sort((a, b) => b.count - a.count),
    scores: pool.scores,
  };
}

function collectionPayload(c: DbCollection) {
  return {
    _id: c._id,
    name: c.name,
    type: c.type,
    status: c.status,
    tests: c.tests,
    sections: c.sections,
    questionsCount: c.sections.reduce((acc, s) => acc + s.questions.length, 0),
    updatedAt: c.updatedAt,
    validFrom: c.validFrom,
    validTo: c.validTo,
    attributes: c.attributes,
    tags: c.tags,
    enableCorrection: c.enableCorrection,
    archived: c.archived,
  };
}

function findCollection(db: Db, id: string): DbCollection {
  const c = db.collections.find((x) => x._id === id);
  if (!c) throw new HttpError(404, 'Collection not found');
  return c;
}

function exportCollection(db: Db, c: DbCollection) {
  return {
    _id: c._id,
    name: c.name,
    type: c.type,
    status: c.status,
    sections: c.sections.map((s) => ({
      name: s.name,
      questions: s.questions.flatMap((entry) => {
        const q = db.questions.find((x) => x._id === entry.questionId);
        if (!q) return [];
        return [
          {
            questionId: q._id,
            type: q.type,
            subjectName: q.subject.name,
            topicName: q.topic.name,
            questionText: q.questionText,
            explanationText: q.explanationText,
            alternatives: q.alternatives,
            questionImages: q.questionImages,
            explanationImages: q.explanationImages,
          },
        ];
      }),
    })),
  };
}

// ---------------------------------------------------------------------------

export function registerCatalogRoutes(router: Router): void {
  // --- brand ---------------------------------------------------------------
  router.get('/brands', () => getDb().brands);

  // --- materie -------------------------------------------------------------
  // Un solo endpoint serve sia la lista che la gerarchia: `includes` decide
  // quanto in profondità scendere (topics, subtopics).
  router.get('/subjects', ({ query }: Ctx) => {
    const db = getDb();
    const includes = (query.get('includes') ?? '').split(',');
    const withTopics = includes.includes('topics');
    const withSubtopics = includes.includes('subtopics');

    const data = db.subjects.map((s) => ({
      _id: s._id,
      name: s.name,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      ...(withTopics
        ? {
            topics: s.topics.map((t) => ({
              _id: t._id,
              name: t.name,
              ...(withSubtopics ? { subtopics: t.subtopics } : {}),
            })),
          }
        : {}),
    }));

    return { data, total: data.length, page: 1, limit: data.length };
  });

  router.post('/subjects', ({ body }: Ctx) => {
    const db = getDb();
    const subject = {
      _id: objectId(idRng),
      name: String(asRecord(body).name ?? 'Nuova materia'),
      topics: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.subjects.push(subject);
    return subject;
  });

  router.put('/subjects/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const s = db.subjects.find((x) => x._id === params.id);
    if (!s) throw new HttpError(404, 'Subject not found');
    const name = asRecord(body).name;
    if (typeof name === 'string') s.name = name;
    s.updatedAt = new Date().toISOString();
    return s;
  });

  router.delete('/subjects/:id', ({ params }: Ctx) => {
    const db = getDb();
    const i = db.subjects.findIndex((x) => x._id === params.id);
    if (i === -1) throw new HttpError(404, 'Subject not found');
    db.subjects.splice(i, 1);
    return undefined;
  });

  router.post('/subjects/:id/topics', ({ params, body }: Ctx) => {
    const db = getDb();
    const s = db.subjects.find((x) => x._id === params.id);
    if (!s) throw new HttpError(404, 'Subject not found');
    s.topics.push({
      _id: objectId(idRng),
      name: String(asRecord(body).name ?? 'Nuovo argomento'),
      subtopics: [],
    });
    s.updatedAt = new Date().toISOString();
    return s;
  });

  router.put('/subjects/:id/topics/:topicId', ({ params, body }: Ctx) => {
    const db = getDb();
    const s = db.subjects.find((x) => x._id === params.id);
    const t = s?.topics.find((x) => x._id === params.topicId);
    if (!s || !t) throw new HttpError(404, 'Topic not found');
    const name = asRecord(body).name;
    if (typeof name === 'string') t.name = name;
    s.updatedAt = new Date().toISOString();
    return s;
  });

  router.delete('/subjects/:id/topics/:topicId', ({ params }: Ctx) => {
    const db = getDb();
    const s = db.subjects.find((x) => x._id === params.id);
    if (!s) throw new HttpError(404, 'Subject not found');
    s.topics = s.topics.filter((t) => t._id !== params.topicId);
    return undefined;
  });

  // --- banche dati ---------------------------------------------------------
  router.get('/pools', ({ query }: Ctx) => {
    const db = getDb();
    const all = db.pools.map((p) => poolPayload(db, p._id));
    return paginate(all, num(query, 'page', 1), num(query, 'limit', 100));
  });

  router.post('/pools', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const pool = {
      _id: objectId(idRng),
      name: String(b.name ?? 'Nuova banca dati'),
      description: typeof b.description === 'string' ? b.description : '',
      status: (typeof b.status === 'string' ? b.status : 'DRAFT') as Db['pools'][number]['status'],
      scores: (asRecord(b.scores).correct !== undefined
        ? b.scores
        : { correct: 1, wrong: -0.25, empty: 0 }) as Db['pools'][number]['scores'],
      questionIds: [],
    };
    db.pools.push(pool);
    return poolPayload(db, pool._id);
  });

  router.get('/pools/:id/questions', ({ params, query }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');

    const difficulty = query.get('difficulty');
    const type = query.get('type');
    const search = (query.get('search') ?? '').trim().toLowerCase();

    const rows = pool.questionIds
      .flatMap((qid) => {
        const q = db.questions.find((x) => x._id === qid);
        return q ? [q] : [];
      })
      .filter((q) => {
        if (query.get('subjectId') && q.subjectId !== query.get('subjectId')) return false;
        if (query.get('topicId') && q.topicId !== query.get('topicId')) return false;
        if (query.get('subtopicId') && q.subtopicId !== query.get('subtopicId')) return false;
        if (difficulty != null && difficulty !== '' && q.difficulty !== Number(difficulty))
          return false;
        if (type === 'completion' && q.type !== 'COMPLETION') return false;
        if (type === 'alternative' && q.type !== 'MULTIPLE_CHOICE') return false;
        if (query.get('language') && q.language !== query.get('language')) return false;
        if (search && !q.questionText.toLowerCase().includes(search)) return false;
        return true;
      })
      .map((q) => ({
        _id: `${pool._id}-${q._id}`,
        questionId: q._id,
        subjectId: q.subjectId,
        subject: { name: q.subject.name },
        topicId: q.topicId,
        topic: { name: q.topic.name },
        subtopicId: q.subtopicId,
        subtopic: { name: q.subtopic.name },
        difficulty: q.difficulty,
        // Il campo `type` di PoolQuestion usa il vocabolario vecchio.
        type: q.type === 'COMPLETION' ? 'completion' : 'alternative',
        language: q.language,
        addedAt: q.createdAt,
      }));

    return paginate(rows, num(query, 'page', 1), num(query, 'limit', 20));
  });

  router.post('/pools/:id/questions', ({ params, body }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');
    const qid = String(asRecord(body).questionId ?? '');
    if (qid && !pool.questionIds.includes(qid)) pool.questionIds.push(qid);
    return undefined;
  });

  router.post('/pools/:id/questions/bulk', ({ params, body }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');
    const ids = asStringArray(asRecord(body).questionIds);
    let added = 0;
    let alreadyIn = 0;
    let notFound = 0;
    for (const id of ids) {
      if (!db.questions.some((q) => q._id === id)) notFound++;
      else if (pool.questionIds.includes(id)) alreadyIn++;
      else {
        pool.questionIds.push(id);
        added++;
      }
    }
    return { added, alreadyIn, notFound };
  });

  router.delete('/pools/:id/questions/bulk', ({ params, body }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');
    const ids = new Set(asStringArray(asRecord(body).questionIds));
    const before = pool.questionIds.length;
    pool.questionIds = pool.questionIds.filter((id) => !ids.has(id));
    const removed = before - pool.questionIds.length;
    return { removed, notFound: ids.size - removed };
  });

  router.delete('/pools/:id/questions/:questionId', ({ params }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');
    pool.questionIds = pool.questionIds.filter((id) => id !== params.questionId);
    return undefined;
  });

  router.patch('/pools/:id/status', ({ params, body }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');
    const status = asRecord(body).status;
    if (typeof status === 'string') pool.status = status as Db['pools'][number]['status'];
    return undefined;
  });

  router.put('/pools/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const pool = db.pools.find((p) => p._id === params.id);
    if (!pool) throw new HttpError(404, 'Pool not found');
    const b = asRecord(body);
    if (typeof b.name === 'string') pool.name = b.name;
    if (typeof b.description === 'string') pool.description = b.description;
    if (b.scores) pool.scores = b.scores as Db['pools'][number]['scores'];
    return poolPayload(db, pool._id);
  });

  router.get('/pools/:id', ({ params }: Ctx) => poolPayload(getDb(), params.id));

  router.delete('/pools/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.pools = db.pools.filter((p) => p._id !== params.id);
    return undefined;
  });

  // --- collection ----------------------------------------------------------
  router.get('/collections/export', ({ query }: Ctx) => {
    const db = getDb();
    const statuses = csv(query, 'statuses');
    const list = db.collections.filter((c) => !statuses.length || statuses.includes(c.status));
    const collections = list.map((c) => exportCollection(db, c));
    return { collections, total: collections.length };
  });

  router.get('/collections/:id/export', ({ params }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    return { collections: [exportCollection(db, c)], total: 1 };
  });

  router.get('/collections', ({ query }: Ctx) => {
    const db = getDb();
    const statuses = csv(query, 'statuses');
    const testIds = csv(query, 'testIds');
    const tagIds = csv(query, 'tagIds');
    const type = query.get('type');
    const search = (query.get('search') ?? '').trim().toLowerCase();
    const archived = query.get('archived');
    const tagsMode = (query.get('filterMode') ?? '').includes('tagIds:AND') ? 'AND' : 'OR';

    const filtered = db.collections.filter((c) => {
      if (archived != null && archived !== '' && c.archived !== (archived === 'true')) return false;
      if (statuses.length && !statuses.includes(c.status)) return false;
      if (type && c.type !== type) return false;
      if (testIds.length && !c.tests.some((t) => testIds.includes(t.id))) return false;
      if (tagIds.length) {
        const own = c.tags.map((t) => t.id);
        const ok =
          tagsMode === 'AND'
            ? tagIds.every((t) => own.includes(t))
            : tagIds.some((t) => own.includes(t));
        if (!ok) return false;
      }
      if (query.get('id') && c._id !== query.get('id')) return false;
      if (search && !c.name.toLowerCase().includes(search)) return false;
      return true;
    });

    const page = paginate(filtered, num(query, 'page', 1), num(query, 'limit', 20));
    return { ...page, data: page.data.map(collectionPayload) };
  });

  router.post('/collections', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const testIds = asStringArray(b.testIds);
    const collection: DbCollection = {
      _id: objectId(idRng),
      name: String(b.name ?? 'Nuova collection'),
      type: (b.type === 'EXERCISE' ? 'EXERCISE' : 'SIMULATION') as DbCollection['type'],
      status: (typeof b.status === 'string' ? b.status : 'DRAFT') as DbCollection['status'],
      tests: testIds.flatMap((id) => {
        const t = db.tests.find((x) => x._id === id);
        return t ? [{ id: t._id, name: t.name }] : [];
      }),
      sections: [],
      tags: [],
      attributes: asRecord(b.attributes),
      enableCorrection: true,
      archived: false,
      validFrom: new Date().toISOString(),
      validTo: new Date(Date.now() + 365 * 86_400_000).toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.collections.unshift(collection);
    return collectionPayload(collection);
  });

  router.post('/collections/:id/sections', ({ params, body }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    const b = asRecord(body);
    c.sections.push({
      _id: objectId(idRng),
      name: typeof b.name === 'string' ? b.name : `Sezione ${c.sections.length + 1}`,
      maxAttempts: typeof b.maxAttempts === 'number' ? b.maxAttempts : 1,
      rules: {
        duration: Number(asRecord(b.rules).duration ?? 3600),
        pausable: asRecord(b.rules).pausable === true,
      },
      questions: [],
    });
    c.updatedAt = new Date().toISOString();
    return collectionPayload(c);
  });

  router.put('/collections/:id/sections', ({ params, body }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    const incoming = Array.isArray(asRecord(body).sections)
      ? (asRecord(body).sections as unknown[])
      : [];
    c.sections = incoming.map((raw, i): DbCollectionSection => {
      const s = asRecord(raw);
      const rules = asRecord(s.rules);
      return {
        _id: typeof s._id === 'string' ? s._id : objectId(idRng),
        name: typeof s.name === 'string' ? s.name : `Sezione ${i + 1}`,
        maxAttempts: typeof s.maxAttempts === 'number' ? s.maxAttempts : 1,
        rules: { duration: Number(rules.duration ?? 3600), pausable: rules.pausable === true },
        questions: (Array.isArray(s.questions) ? (s.questions as unknown[]) : []).map((q) => {
          const entry = asRecord(q);
          const points = asRecord(entry.points);
          return {
            questionId: typeof entry === 'string' ? entry : String(entry.questionId ?? ''),
            points: {
              correctPoint: Number(points.correctPoint ?? 1),
              wrongPoint: Number(points.wrongPoint ?? 0),
              emptyPoint: Number(points.emptyPoint ?? 0),
            },
          };
        }),
      };
    });
    c.updatedAt = new Date().toISOString();
    return collectionPayload(c);
  });

  router.put('/collections/:id/sections/:sectionIdx', ({ params, body }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    const section = c.sections[Number(params.sectionIdx)];
    if (!section) throw new HttpError(404, 'Section not found');
    const b = asRecord(body);
    if (Array.isArray(b.questions)) {
      section.questions = (b.questions as unknown[]).map((q) => {
        const entry = asRecord(q);
        const points = asRecord(entry.points);
        return {
          questionId: String(entry.questionId ?? q),
          points: {
            correctPoint: Number(points.correctPoint ?? 1),
            wrongPoint: Number(points.wrongPoint ?? 0),
            emptyPoint: Number(points.emptyPoint ?? 0),
          },
        };
      });
    }
    if (typeof b.name === 'string') section.name = b.name;
    if (typeof b.maxAttempts === 'number') section.maxAttempts = b.maxAttempts;
    c.updatedAt = new Date().toISOString();
    return collectionPayload(c);
  });

  router.patch('/collections/:id/status', ({ params, body }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    const status = asRecord(body).status;
    if (typeof status === 'string') c.status = status as DbCollection['status'];
    c.updatedAt = new Date().toISOString();
    return collectionPayload(c);
  });

  router.patch('/collections/:id/archive', ({ params, body }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    c.archived = asRecord(body).archived === true;
    c.updatedAt = new Date().toISOString();
    return collectionPayload(c);
  });

  router.post('/collections/:id/duplicate', ({ params, body }: Ctx) => {
    const db = getDb();
    const source = findCollection(db, params.id);
    const copy: DbCollection = {
      ...structuredClone(source),
      _id: objectId(idRng),
      name: String(asRecord(body).name ?? `${source.name} (copia)`),
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
    };
    db.collections.unshift(copy);
    return collectionPayload(copy);
  });

  router.put('/collections/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const c = findCollection(db, params.id);
    const b = asRecord(body);
    if (typeof b.name === 'string') c.name = b.name;
    if (typeof b.type === 'string') c.type = b.type as DbCollection['type'];
    if (Array.isArray(b.testIds)) {
      c.tests = asStringArray(b.testIds).flatMap((id) => {
        const t = db.tests.find((x) => x._id === id);
        return t ? [{ id: t._id, name: t.name }] : [];
      });
    }
    if (Array.isArray(b.tags)) {
      const known = db.tags.collections ?? [];
      c.tags = asStringArray(b.tags).flatMap((id) => {
        const t = known.find((x) => x.id === id);
        return t ? [{ id: t.id, value: t.value }] : [];
      });
    }
    if (b.attributes && typeof b.attributes === 'object') c.attributes = asRecord(b.attributes);
    c.updatedAt = new Date().toISOString();
    return collectionPayload(c);
  });

  router.get('/collections/:id', ({ params }: Ctx) =>
    collectionPayload(findCollection(getDb(), params.id))
  );

  router.delete('/collections/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.collections = db.collections.filter((c) => c._id !== params.id);
    return undefined;
  });

  // --- test ----------------------------------------------------------------
  router.get('/tests', ({ query }: Ctx) => {
    const db = getDb();
    const name = (query.get('name') ?? '').toLowerCase();
    const brandId = query.get('brandId');
    const year = query.get('year');
    const filtered = db.tests.filter((t) => {
      if (name && !t.name.toLowerCase().includes(name)) return false;
      if (brandId && !t.brands.some((b) => b.id === brandId)) return false;
      if (year && String(t.year) !== year) return false;
      return true;
    });
    return paginate(filtered, num(query, 'page', 1), num(query, 'limit', 20));
  });

  router.patch('/tests/reorder', () => undefined);

  router.post('/tests', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const test = {
      _id: objectId(idRng),
      name: String(b.name ?? 'Nuovo test'),
      year: typeof b.year === 'number' ? b.year : new Date().getFullYear(),
      brands: (Array.isArray(b.brands) ? b.brands : []) as Db['tests'][number]['brands'],
      brandOrders: [],
      syllabus: (Array.isArray(b.syllabus) ? b.syllabus : []) as Db['tests'][number]['syllabus'],
      defaultScores: (b.defaultScores ?? {
        correct: 1,
        empty: 0,
        wrong: 0,
      }) as Db['tests'][number]['defaultScores'],
    };
    db.tests.push(test);
    return test;
  });

  router.put('/tests/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const t = db.tests.find((x) => x._id === params.id);
    if (!t) throw new HttpError(404, 'Test not found');
    Object.assign(t, asRecord(body));
    return t;
  });

  router.get('/tests/:id', ({ params }: Ctx) => {
    const t = getDb().tests.find((x) => x._id === params.id);
    if (!t) throw new HttpError(404, 'Test not found');
    return t;
  });

  router.delete('/tests/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.tests = db.tests.filter((t) => t._id !== params.id);
    return undefined;
  });

  // --- SKU e pacchetti -----------------------------------------------------
  const textMatch = (query: URLSearchParams, fields: Record<string, string>) =>
    Object.entries(fields).every(([key, value]) => {
      const wanted = query.get(key);
      return !wanted || value.toLowerCase().includes(wanted.toLowerCase());
    });

  router.get('/skus', ({ query }: Ctx) => {
    const db = getDb();
    const filtered = db.skus.filter((s) =>
      textMatch(query, { name: s.name, code: s.code, id: s._id, search: `${s.name} ${s.code}` })
    );
    return paginate(filtered, num(query, 'page', 1), num(query, 'limit', 20));
  });

  router.post('/skus', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const sku = {
      _id: objectId(idRng),
      code: String(b.code ?? ''),
      name: String(b.name ?? ''),
      url: typeof b.url === 'string' ? b.url : '',
      brands: (Array.isArray(b.brands) ? b.brands : []) as Db['skus'][number]['brands'],
    };
    db.skus.push(sku);
    return sku;
  });

  router.put('/skus/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const s = db.skus.find((x) => x._id === params.id);
    if (!s) throw new HttpError(404, 'SKU not found');
    Object.assign(s, asRecord(body));
    return s;
  });

  router.delete('/skus/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.skus = db.skus.filter((s) => s._id !== params.id);
    return undefined;
  });

  router.get('/packages', ({ query }: Ctx) => {
    const db = getDb();
    const filtered = db.packages.filter((p) =>
      textMatch(query, { name: p.name ?? '', code: p.skuCode ?? '', id: p._id })
    );
    return paginate(filtered, num(query, 'page', 1), num(query, 'limit', 20));
  });

  router.post('/packages', ({ body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const sku = db.skus.find((s) => s._id === b.skuId);
    const pkg = {
      _id: objectId(idRng),
      skuId: String(b.skuId ?? ''),
      skuCode: sku?.code ?? '',
      skuName: sku?.name ?? '',
      name: String(b.name ?? ''),
      active: b.active === true,
      isFree: b.isFree === true,
      timed: b.timed === true,
      collectionIds: asStringArray(b.collectionIds),
      poolIds: asStringArray(b.poolIds),
      expiresAt: typeof b.expiresAt === 'string' ? b.expiresAt : null,
    };
    db.packages.push(pkg);
    return pkg;
  });

  router.patch('/packages/:id/active', ({ params, body }: Ctx) => {
    const db = getDb();
    const p = db.packages.find((x) => x._id === params.id);
    if (!p) throw new HttpError(404, 'Package not found');
    p.active = asRecord(body).active === true;
    return p;
  });

  router.put('/packages/:id', ({ params, body }: Ctx) => {
    const db = getDb();
    const p = db.packages.find((x) => x._id === params.id);
    if (!p) throw new HttpError(404, 'Package not found');
    Object.assign(p, asRecord(body));
    return p;
  });

  router.delete('/packages/:id', ({ params }: Ctx) => {
    const db = getDb();
    db.packages = db.packages.filter((p) => p._id !== params.id);
    return undefined;
  });

  // --- tag e attributi -----------------------------------------------------
  router.get('/resources/:resource/tags', ({ params }: Ctx) => getDb().tags[params.resource] ?? []);

  router.post('/resources/:resource/tags', ({ params, body }: Ctx) => {
    const db = getDb();
    const b = asRecord(body);
    const list = (db.tags[params.resource] ??= []);
    const tag = {
      id: objectId(idRng),
      value: String(b.value ?? ''),
      style: asRecord(b.style) as { color?: string },
    };
    list.push(tag);
    return tag;
  });

  router.put('/resources/:resource/tags/:tagId', ({ params, body }: Ctx) => {
    const db = getDb();
    const tag = (db.tags[params.resource] ?? []).find((t) => t.id === params.tagId);
    if (!tag) throw new HttpError(404, 'Tag not found');
    const b = asRecord(body);
    if (typeof b.value === 'string') tag.value = b.value;
    if (b.style) tag.style = asRecord(b.style) as { color?: string };
    return tag;
  });

  router.delete('/resources/:resource/tags/:tagId', ({ params }: Ctx) => {
    const db = getDb();
    db.tags[params.resource] = (db.tags[params.resource] ?? []).filter(
      (t) => t.id !== params.tagId
    );
    return undefined;
  });

  router.get('/resources/:resource', ({ params }: Ctx) => {
    const db = getDb();
    const found = db.attributeResources[params.resource];
    if (found) return found;
    return {
      _id: objectId(idRng),
      name: params.resource,
      attributes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  router.post('/resources/:resource', ({ params, body }: Ctx) => {
    const db = getDb();
    const attributes = (
      Array.isArray(asRecord(body).attributes) ? asRecord(body).attributes : []
    ) as Db['attributeResources'][string]['attributes'];
    const existing = db.attributeResources[params.resource];
    const next = {
      _id: existing?._id ?? objectId(idRng),
      name: params.resource,
      attributes,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.attributeResources[params.resource] = next;
    return next;
  });
}
