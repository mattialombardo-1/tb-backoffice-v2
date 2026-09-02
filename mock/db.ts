/**
 * Stato in memoria del mock server.
 *
 * Costruito una sola volta all'avvio del dev server a partire dal seed
 * deterministico. Le scritture (POST/PUT/PATCH/DELETE) mutano questo oggetto,
 * quindi i flussi si possono provare davvero; per ripartire da zero basta
 * riavviare `npm run dev:mock`.
 *
 * Le shape ricalcano quelle che i service in `src/lib/services/*` si aspettano
 * di ricevere dal backend (le interfacce `Backend*` dichiarate lì dentro), non
 * i tipi di dominio del frontend. Questo file non importa nulla da `src/`:
 * viene compilato nel bundle di `vite.config.ts`, dove l'alias `@/` non esiste.
 */
import { createRng, objectId, stratify, type Rng } from './rng';
import { SUBJECT_SEED } from './seed/subjects';
import { pickQuestionBody } from './seed/content';

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

export interface DbSubtopic {
  _id: string;
  name: string;
}
export interface DbTopic {
  _id: string;
  name: string;
  subtopics: DbSubtopic[];
}
export interface DbSubject {
  _id: string;
  name: string;
  topics: DbTopic[];
  createdAt: string;
  updatedAt: string;
}

export interface DbAlternative {
  text: string;
  correct: boolean;
  image?: string;
}

export type DbQuestionStatus = 'DRAFT' | 'ACTIVE' | 'TO_REVIEW' | 'INACTIVE';

export interface DbQuestion {
  _id: string;
  subjectId: string;
  subject: { name: string };
  topicId: string;
  topic: { name: string };
  subtopicId: string;
  subtopic: { name: string };
  type: 'MULTIPLE_CHOICE' | 'COMPLETION';
  /** 0-5, dove 0 = "non ancora valutata". Mappa in src/lib/services/questions.ts. */
  difficulty: number;
  language: 'IT-it' | 'EN-en';
  questionText: string;
  alternatives: DbAlternative[];
  completionAnswers: string[];
  explanationText: string;
  questionImages: string[];
  explanationImages: string[];
  status: DbQuestionStatus;
  versionCount: number;
  authorId: string;
  author: { email: string };
  revisorId: string | null;
  revisor: { email: string } | null;
  archived: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DbCommunityRole {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  rank: number;
  capabilities: { resource: string; actions: string[] }[];
  createdAt: string;
  updatedAt: string;
}

export interface DbCommunityUser {
  _id: string;
  cognitoId: string;
  roleIds: string[];
  name: string;
  surname: string;
  email: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbTag {
  id: string;
  value: string;
  style?: { color?: string };
}

export interface DbPool {
  _id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  scores: { correct: number; wrong: number; empty: number };
  questionIds: string[];
}

export interface DbCollectionSection {
  _id: string;
  name: string;
  maxAttempts: number;
  rules: { duration: number; pausable: boolean };
  questions: {
    questionId: string;
    points: { correctPoint: number; wrongPoint: number; emptyPoint: number };
  }[];
}

export interface DbCollection {
  _id: string;
  name: string;
  type: 'SIMULATION' | 'EXERCISE';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  tests: { id: string; name: string }[];
  sections: DbCollectionSection[];
  tags: { id: string; value: string }[];
  attributes: Record<string, unknown>;
  enableCorrection: boolean;
  archived: boolean;
  validFrom: string;
  validTo: string;
  updatedAt: string;
}

export interface DbTest {
  _id: string;
  name: string;
  year: number;
  brands: { id: string; name: string }[];
  brandOrders: { brandId: string; order: number }[];
  syllabus: {
    baseSubject: string;
    baseTopic: string;
    displaySubject: string;
    displayTopic: string;
  }[];
  defaultScores: { correct: number; empty: number; wrong: number };
}

export interface DbSku {
  _id: string;
  code: string;
  name: string;
  url: string;
  brands: { id: string; name: string }[];
}

export interface DbPackage {
  _id: string;
  skuId: string;
  skuCode: string;
  skuName: string;
  name: string;
  active: boolean;
  isFree: boolean;
  timed: boolean;
  collectionIds: string[];
  poolIds: string[];
  expiresAt: string | null;
}

export interface DbClient {
  id: string;
  cognitoId: string;
  name: string;
  surname: string;
  email: string;
  brands: { id: string; name: string }[];
  modules: { _id: string; name: string; skuCode: string }[];
}

export interface DbCampaignSlot {
  _id: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty: number;
  questionType: 'MULTIPLE_CHOICE' | 'COMPLETION';
  assigneeId: string;
  revisorId: string;
  dueDate: string;
  questionId?: string;
}

export interface DbCampaign {
  _id: string;
  name: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  questions: DbCampaignSlot[];
}

export interface DbAttributeResource {
  _id: string;
  name: string;
  attributes: { name: string; type: string; values?: string[] }[];
  createdAt: string;
  updatedAt: string;
}

export interface Db {
  brands: { id: string; name: string }[];
  subjects: DbSubject[];
  roles: DbCommunityRole[];
  communityUsers: DbCommunityUser[];
  questions: DbQuestion[];
  pools: DbPool[];
  collections: DbCollection[];
  tests: DbTest[];
  skus: DbSku[];
  packages: DbPackage[];
  clients: DbClient[];
  campaigns: DbCampaign[];
  /** Tag per risorsa: `collections`, `questions`, ... */
  tags: Record<string, DbTag[]>;
  attributeResources: Record<string, DbAttributeResource>;
  bulkJobs: Record<string, { jobId: string; status: string; processed: number; total: number }>;
  /** L'utente loggato finto — deve combaciare con bootstrapAuth. */
  currentUserId: string;
}

// ---------------------------------------------------------------------------
// Identità dell'utente finto
// ---------------------------------------------------------------------------

export const MOCK_USER = {
  cognitoId: 'a1b2c3d4-mock-4f00-9e11-000000000001',
  email: 'design@belka.studio',
  name: 'Emanuele',
  surname: 'Pasin',
};

/** Tutte le risorse note al frontend (src/lib/types/me.ts) + `tests`. */
const ALL_RESOURCES = [
  'users',
  'questions',
  'subjects',
  'community-users',
  'community-roles',
  'brands',
  'pools',
  'packages',
  'campaigns',
  'skus',
  'collections',
  'attributes',
  'tests',
];
const ALL_ACTIONS = ['CREATE', 'READ', 'UPDATE', 'DELETE'];

export const FULL_CAPABILITIES = ALL_RESOURCES.map((resource) => ({
  resource,
  actions: [...ALL_ACTIONS],
}));

// ---------------------------------------------------------------------------
// Costruzione del seed
// ---------------------------------------------------------------------------

const QUESTION_COUNT = 200;

const iso = (daysAgo: number, rng: Rng): string => {
  const base = Date.UTC(2026, 8, 2, 9, 0, 0); // 2026-09-02, data fissa: niente drift
  const jitter = rng.int(0, 20) * 3600_000;
  return new Date(base - daysAgo * 86_400_000 - jitter).toISOString();
};

const PEOPLE: [string, string][] = [
  ['Giulia', 'Ferraro'],
  ['Marco', 'Bertolini'],
  ['Sara', 'Colombo'],
  ['Andrea', 'Rinaldi'],
  ['Chiara', 'Vitale'],
  ['Luca', 'Moretti'],
  ['Elena', 'Gallo'],
  ['Davide', 'Santoro'],
  ['Francesca', 'Longo'],
  ['Matteo', 'Ricci'],
  ['Alessia', 'Barbieri'],
];

const TAG_VALUES = [
  'da rivedere',
  'alta priorità',
  'immagine mancante',
  'TOLC-MED',
  'ammissione 2026',
  'ripasso',
  'clinica',
  'formule',
  'archivio 2024',
  'segnalata dai tutor',
  'ambigua',
  'doppia risposta',
  'facile per warm-up',
  'riformulare',
  'validata',
];

export function buildDb(): Db {
  const rng = createRng(20260902);

  // --- brand ---------------------------------------------------------------
  const brands = [
    { id: objectId(rng), name: 'Testbusters' },
    { id: objectId(rng), name: 'Peer4Med' },
  ];

  // --- gerarchia -----------------------------------------------------------
  const subjects: DbSubject[] = SUBJECT_SEED.map((s) => ({
    _id: objectId(rng),
    name: s.name,
    topics: s.topics.map((t) => ({
      _id: objectId(rng),
      name: t.name,
      subtopics: t.subtopics.map((st) => ({ _id: objectId(rng), name: st })),
    })),
    createdAt: iso(400, rng),
    updatedAt: iso(30, rng),
  }));

  // --- ruoli ---------------------------------------------------------------
  const roleDefs: [string, string, string, number, string[][]][] = [
    ['admin', 'Amministratore', 'Accesso completo a tutte le sezioni', 100, []],
    [
      'coordinatore',
      'Coordinatore',
      'Gestisce campagne, banche dati e assegnazioni',
      70,
      [
        ['questions', 'CREATE,READ,UPDATE'],
        ['campaigns', 'CREATE,READ,UPDATE,DELETE'],
        ['pools', 'CREATE,READ,UPDATE'],
        ['collections', 'READ,UPDATE'],
        ['subjects', 'READ'],
        ['community-users', 'READ'],
      ],
    ],
    [
      'revisore',
      'Revisore',
      'Revisiona e approva le domande assegnate',
      50,
      [
        ['questions', 'READ,UPDATE'],
        ['subjects', 'READ'],
        ['collections', 'READ'],
        ['pools', 'READ'],
      ],
    ],
    [
      'autore',
      'Autore',
      'Crea e modifica le proprie domande',
      30,
      [
        ['questions', 'CREATE,READ,UPDATE'],
        ['subjects', 'READ'],
      ],
    ],
  ];

  const roles: DbCommunityRole[] = roleDefs.map(([name, displayName, description, rank, caps]) => ({
    _id: objectId(rng),
    name,
    displayName,
    description,
    rank,
    capabilities:
      name === 'admin'
        ? FULL_CAPABILITIES.map((c) => ({ resource: c.resource, actions: [...c.actions] }))
        : caps.map(([resource, actions]) => ({
            resource,
            actions: actions.split(','),
          })),
    createdAt: iso(380, rng),
    updatedAt: iso(60, rng),
  }));

  const roleId = (name: string) => roles.find((r) => r.name === name)!._id;

  // --- staff ---------------------------------------------------------------
  const currentUser: DbCommunityUser = {
    _id: objectId(rng),
    cognitoId: MOCK_USER.cognitoId,
    roleIds: [roleId('admin')],
    name: MOCK_USER.name,
    surname: MOCK_USER.surname,
    email: MOCK_USER.email,
    lastLogin: iso(0, rng),
    createdAt: iso(200, rng),
    updatedAt: iso(1, rng),
  };

  const communityUsers: DbCommunityUser[] = [
    currentUser,
    ...PEOPLE.map(([name, surname], i) => ({
      _id: objectId(rng),
      cognitoId: `${objectId(rng)}-u${i}`,
      roleIds: [
        roleId(
          rng.weighted([
            ['autore', 5],
            ['revisore', 3],
            ['coordinatore', 2],
            ['admin', 1],
          ])
        ),
      ],
      name,
      surname,
      email: `${name.toLowerCase()}.${surname.toLowerCase()}@testbusters.it`,
      lastLogin: iso(rng.int(0, 20), rng),
      createdAt: iso(rng.int(120, 500), rng),
      updatedAt: iso(rng.int(1, 60), rng),
    })),
  ];

  const reviewers = communityUsers.filter((u) =>
    u.roleIds.some((id) => id === roleId('revisore') || id === roleId('coordinatore'))
  );
  const authors = communityUsers.filter((u) => u._id !== currentUser._id);

  // --- tag -----------------------------------------------------------------
  const palette = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#64748b'];
  const makeTags = (values: string[]): DbTag[] =>
    values.map((value) => ({
      id: objectId(rng),
      value,
      style: { color: rng.pick(palette) },
    }));

  const questionTags = makeTags(TAG_VALUES);
  const collectionTags = makeTags([
    'simulazione ufficiale',
    'esercitazione guidata',
    'edizione 2026',
    'prova gratuita',
    'best seller',
  ]);

  // --- domande -------------------------------------------------------------
  const questions: DbQuestion[] = [];
  const perSubjectIndex: Record<string, number> = {};
  const usedTexts = new Set<string>();

  // Difficoltà e stato sono distribuiti in modo esatto, non estratti a caso:
  // su 200 elementi il campionamento lascerebbe scarti di parecchi punti e le
  // proporzioni che raccontiamo al cliente non corrisponderebbero a quelle a
  // schermo.
  //
  // Lo sbilanciamento sulla difficoltà 0 ("non ancora valutata") è voluto: è il
  // buco che il redesign del grading deve rendere visibile. Con una
  // distribuzione piatta il problema sparirebbe dalle schermate.
  const difficultyPlan = stratify(
    rng,
    [
      [0, 35],
      [1, 12],
      [2, 13],
      [3, 18],
      [4, 12],
      [5, 10],
    ] as const,
    QUESTION_COUNT
  );
  const statusPlan = stratify(
    rng,
    [
      ['ACTIVE', 45],
      ['TO_REVIEW', 25],
      ['DRAFT', 20],
      ['INACTIVE', 10],
    ] as const satisfies readonly (readonly [DbQuestionStatus, number])[],
    QUESTION_COUNT
  );

  for (let i = 0; i < QUESTION_COUNT; i++) {
    const subject = subjects[i % subjects.length];
    const idx = (perSubjectIndex[subject.name] = (perSubjectIndex[subject.name] ?? -1) + 1);

    // I generatori parametrici possono ricadere sugli stessi valori: qualche
    // tentativo in più costa nulla ed evita pagine con la stessa domanda
    // ripetuta tre volte, che in uno screenshot per il cliente si nota.
    let body = pickQuestionBody(subject.name, idx, rng);
    for (let attempt = 0; attempt < 12 && usedTexts.has(body.text); attempt++) {
      body = pickQuestionBody(subject.name, idx, rng);
    }
    usedTexts.add(body.text);

    // Il body dichiara topic/subtopic per nome: risolviamoli sulla gerarchia
    // vera, con fallback casuale se il seed dei contenuti e quello delle
    // materie divergono.
    const topic = subject.topics.find((t) => t.name === body.topic) ?? rng.pick(subject.topics);
    const subtopic =
      topic.subtopics.find((st) => st.name === body.subtopic) ?? rng.pick(topic.subtopics);

    // Alcune domande a risposta secca (un numero, una formula) vengono girate
    // in COMPLETION: le sole authored non basterebbero a rappresentare il tipo.
    const convertToCompletion = body.completable === true && rng.chance(0.42);
    const isCompletion = body.alternatives.length === 0 || convertToCompletion;
    const completionAnswer = convertToCompletion
      ? body.alternatives[0]
      : (body.completionAnswer ?? '');

    const alternatives: DbAlternative[] = isCompletion
      ? []
      : rng.shuffle(body.alternatives.map((text, j) => ({ text, correct: j === 0 })));

    const difficulty = difficultyPlan[i];
    const status = statusPlan[i];

    const author = rng.pick(authors);
    // Un quarto delle TO_REVIEW va all'utente finto, così /questions/to-review
    // non è vuota al primo avvio.
    const revisor =
      status === 'TO_REVIEW'
        ? rng.chance(0.28)
          ? currentUser
          : rng.pick(reviewers)
        : rng.chance(0.4)
          ? rng.pick(reviewers)
          : null;

    const createdDays = rng.int(5, 300);

    questions.push({
      _id: objectId(rng),
      subjectId: subject._id,
      subject: { name: subject.name },
      topicId: topic._id,
      topic: { name: topic.name },
      subtopicId: subtopic._id,
      subtopic: { name: subtopic.name },
      type: isCompletion ? 'COMPLETION' : 'MULTIPLE_CHOICE',
      difficulty,
      language: rng.chance(0.06) ? 'EN-en' : 'IT-it',
      questionText: body.text,
      alternatives,
      completionAnswers: completionAnswer ? [completionAnswer] : [],
      explanationText: body.explanation,
      questionImages: [],
      explanationImages: [],
      status,
      versionCount: rng.int(1, 4),
      authorId: author._id,
      author: { email: author.email },
      revisorId: revisor?._id ?? null,
      revisor: revisor ? { email: revisor.email } : null,
      archived: false,
      tags: rng.chance(0.45)
        ? rng
            .shuffle([...questionTags])
            .slice(0, rng.int(1, 3))
            .map((t) => t.id)
        : [],
      createdAt: iso(createdDays, rng),
      updatedAt: iso(rng.int(0, Math.max(1, createdDays - 1)), rng),
    });
  }

  // --- pool ----------------------------------------------------------------
  const poolNames = [
    'Banca Biologia 2026',
    'Banca Chimica 2026',
    'Banca Fisica e Matematica',
    'Banca Logica',
    'Banca Anatomia clinica',
    'Pool ripasso intensivo',
    'Pool domande validate',
    'Pool archivio 2024',
  ];
  const pools: DbPool[] = poolNames.map((name, i) => {
    const pick = rng.shuffle([...questions]).slice(0, rng.int(18, 60));
    return {
      _id: objectId(rng),
      name,
      description: `Raccolta di domande per ${name.replace(/^(Banca|Pool) /, '').toLowerCase()}.`,
      status: i < 5 ? 'ACTIVE' : rng.pick(['DRAFT', 'INACTIVE'] as const),
      scores: { correct: 1, wrong: -0.25, empty: 0 },
      questionIds: pick.map((q) => q._id),
    };
  });

  // --- test ----------------------------------------------------------------
  const testNames = [
    'TOLC-MED',
    'Medicina in italiano',
    'Medicina in inglese (IMAT)',
    'Professioni sanitarie',
    'Veterinaria',
    'Odontoiatria',
  ];
  const tests: DbTest[] = testNames.map((name, i) => ({
    _id: objectId(rng),
    name,
    year: rng.pick([2024, 2025, 2026]),
    brands: i % 3 === 0 ? [brands[0], brands[1]] : [brands[i % 2]],
    brandOrders: [{ brandId: brands[0].id, order: i }],
    syllabus: subjects.slice(0, 4).map((s) => ({
      baseSubject: s._id,
      baseTopic: s.topics[0]._id,
      displaySubject: s.name,
      displayTopic: s.topics[0].name,
    })),
    defaultScores: { correct: 1.5, empty: 0, wrong: -0.4 },
  }));

  // --- collection ----------------------------------------------------------
  const collectionNames = [
    'Simulazione nazionale #1',
    'Simulazione nazionale #2',
    'Simulazione nazionale #3',
    'Esercitazione Biologia',
    'Esercitazione Chimica',
    'Esercitazione Logica',
    'Mini-test diagnostico',
    'Prova gratuita di ingresso',
    'Simulazione IMAT',
    'Recupero argomenti deboli',
  ];
  const collections: DbCollection[] = collectionNames.map((name, i) => {
    const isSim = i < 3 || name.includes('Simulazione');
    const sectionCount = isSim ? rng.int(2, 3) : 1;
    const sections: DbCollectionSection[] = Array.from({ length: sectionCount }, (_, s) => ({
      _id: objectId(rng),
      name: `Sezione ${s + 1}`,
      maxAttempts: rng.int(1, 3),
      rules: { duration: rng.pick([1800, 3600, 5400]), pausable: rng.chance(0.4) },
      questions: rng
        .shuffle([...questions])
        .slice(0, rng.int(10, 30))
        .map((q) => ({
          questionId: q._id,
          points: { correctPoint: 1.5, wrongPoint: -0.4, emptyPoint: 0 },
        })),
    }));

    return {
      _id: objectId(rng),
      name,
      type: isSim ? 'SIMULATION' : 'EXERCISE',
      status: rng.weighted([
        ['ACTIVE', 6],
        ['DRAFT', 3],
        ['INACTIVE', 1],
      ]),
      tests: [{ id: tests[i % tests.length]._id, name: tests[i % tests.length].name }],
      sections,
      tags: rng.chance(0.6)
        ? rng
            .shuffle([...collectionTags])
            .slice(0, rng.int(1, 2))
            .map((t) => ({ id: t.id, value: t.value }))
        : [],
      attributes: {},
      enableCorrection: true,
      archived: i === collectionNames.length - 1,
      validFrom: iso(60, rng),
      validTo: iso(-120, rng),
      updatedAt: iso(rng.int(1, 40), rng),
    };
  });

  // --- sku e pacchetti -----------------------------------------------------
  const skus: DbSku[] = [
    ['TB-MED-FULL', 'Corso Medicina completo'],
    ['TB-MED-SIM', 'Pacchetto simulazioni'],
    ['TB-LOG-BASE', 'Logica base'],
    ['P4M-PREMIUM', 'Peer4Med Premium'],
    ['TB-FREE', 'Prova gratuita'],
  ].map(([code, name], i) => ({
    _id: objectId(rng),
    code,
    name,
    url: `https://testbusters.it/prodotti/${code.toLowerCase()}`,
    brands: [brands[i % 2]],
  }));

  const packages: DbPackage[] = skus.map((sku, i) => ({
    _id: objectId(rng),
    skuId: sku._id,
    skuCode: sku.code,
    skuName: sku.name,
    name: sku.name,
    active: i !== 4,
    isFree: sku.code === 'TB-FREE',
    timed: i % 2 === 0,
    collectionIds: rng
      .shuffle([...collections])
      .slice(0, rng.int(1, 4))
      .map((c) => c._id),
    poolIds: rng
      .shuffle([...pools])
      .slice(0, rng.int(1, 3))
      .map((p) => p._id),
    expiresAt: i % 2 === 0 ? iso(-365, rng) : null,
  }));

  // --- clienti -------------------------------------------------------------
  const firstNames = [
    'Sofia',
    'Lorenzo',
    'Aurora',
    'Leonardo',
    'Giorgia',
    'Tommaso',
    'Beatrice',
    'Riccardo',
  ];
  const lastNames = [
    'Esposito',
    'Russo',
    'Greco',
    'Marino',
    'Bruno',
    'Costa',
    'Fontana',
    'Caruso',
    'Serra',
    'Rizzo',
  ];
  const clients: DbClient[] = Array.from({ length: 40 }, (_, i) => {
    const name = rng.pick(firstNames);
    const surname = rng.pick(lastNames);
    return {
      id: objectId(rng),
      cognitoId: `${objectId(rng)}-c${i}`,
      name,
      surname,
      email: `${name.toLowerCase()}.${surname.toLowerCase()}${i}@example.com`,
      brands: [brands[i % 2]],
      modules: rng
        .shuffle([...packages])
        .slice(0, rng.int(0, 3))
        .map((p) => ({ _id: p._id, name: p.name, skuCode: p.skuCode })),
    };
  });

  // --- campagne ------------------------------------------------------------
  const campaigns: DbCampaign[] = [
    'Produzione Biologia Q4',
    'Refresh Chimica 2026',
    'Nuove domande Logica',
  ].map((name) => ({
    _id: objectId(rng),
    name,
    author: currentUser._id,
    createdAt: iso(rng.int(20, 90), rng),
    updatedAt: iso(rng.int(1, 15), rng),
    questions: Array.from({ length: rng.int(6, 14) }, () => {
      const subject = rng.pick(subjects);
      const topic = rng.pick(subject.topics);
      const assignee = rng.pick(authors);
      // Una fetta di slot assegnata all'utente finto, così /my-slots è piena.
      return {
        _id: objectId(rng),
        status: rng.weighted<DbCampaignSlot['status']>([
          ['draft', 5],
          ['in_review', 3],
          ['approved', 3],
          ['rejected', 1],
        ]),
        subjectId: subject._id,
        subjectName: subject.name,
        topicId: topic._id,
        topicName: topic.name,
        difficulty: rng.int(0, 5),
        questionType: rng.chance(0.75) ? 'MULTIPLE_CHOICE' : 'COMPLETION',
        assigneeId: rng.chance(0.35) ? currentUser._id : assignee._id,
        revisorId: rng.pick(reviewers)._id,
        dueDate: iso(-rng.int(5, 60), rng),
      };
    }),
  }));

  // --- attributi -----------------------------------------------------------
  const attributeResources: Record<string, DbAttributeResource> = {};
  for (const [name, attrs] of Object.entries({
    collections: [
      { name: 'visibileInApp', type: 'boolean' },
      { name: 'noteInterne', type: 'string' },
      { name: 'livello', type: 'select', values: ['base', 'intermedio', 'avanzato'] },
    ],
    questions: [
      { name: 'fonte', type: 'string' },
      { name: 'annoTest', type: 'number' },
      { name: 'verificataDaDocente', type: 'boolean' },
    ],
    subjects: [{ name: 'coloreGrafico', type: 'string' }],
    users: [
      { name: 'canaleAcquisizione', type: 'select', values: ['organico', 'ads', 'referral'] },
    ],
    brands: [{ name: 'dominio', type: 'string' }],
  })) {
    attributeResources[name] = {
      _id: objectId(rng),
      name,
      attributes: attrs,
      createdAt: iso(300, rng),
      updatedAt: iso(20, rng),
    };
  }

  return {
    brands,
    subjects,
    roles,
    communityUsers,
    questions,
    pools,
    collections,
    tests,
    skus,
    packages,
    clients,
    campaigns,
    tags: { collections: collectionTags, questions: questionTags },
    attributeResources,
    bulkJobs: {},
    currentUserId: currentUser._id,
  };
}

let instance: Db | null = null;

export function getDb(): Db {
  if (!instance) instance = buildDb();
  return instance;
}
