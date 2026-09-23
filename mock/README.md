# Mock server locale

Fa girare il back office **senza backend e senza SSO**, con ~200 domande finte
ma realistiche. Serve a prototipare la UI e mostrare schermate al cliente.

```bash
npm install
npm run dev:mock     # → http://localhost:4300
```

Si apre direttamente sulla dashboard: niente login, nessuna chiamata verso
`sso.peerpetual.com` o AWS.

---

## Condividere un link (deploy demo su Vercel)

`npm run dev:mock` gira solo in locale. Per un link condivisibile con lo
stakeholder, il prototipo si builda in modalità `demo` invece di `mock`:

```bash
npm run build:demo     # tsc -b && vite build --mode demo
```

Differenza rispetto a `dev:mock`: qui non c'è un dev server Node sempre acceso
a fare da mock API. La build statica (`dist/`) viene servita da Vercel, e le
chiamate a `/api/mock-api/*` sono gestite da una **funzione serverless**
(`api/mock-api/[...path].ts`, alla radice del repo, fuori da `mock/` perché
Vercel cerca le funzioni lì) che importa e riusa — senza duplicarla — la
stessa `mock/router.ts` + `mock/handlers/*` + `mock/db.ts` di sopra. La
sessione finta viene iniettata nell'HTML allo stesso modo (vedi
"Com'è aggirata l'autenticazione" sotto), il plugin (`mock/index.ts`) si
attiva anche per `--mode demo`, non solo `--mode mock`.

Config di riferimento:
- `VITE_API_BASE_URL`/`VITE_SSO_AUTHORITY`/`VITE_COGNITO_CLIENT_ID` per demo
  mode sono **forzati in `mock/index.ts`** (`DEMO_ENV`, via `define` in fase
  di build), non letti da `.env.demo`/`config.env`: Vercel può popolare
  Environment Variables del progetto con questi stessi nomi a stringa vuota
  (es. campi proposti dall'import e mai compilati) — per Vite `process.env`
  vince sempre sui file `.env*`, quindi una `VITE_API_BASE_URL=""` nel
  dashboard silenzierebbe `.env.demo` senza errori: l'app caricherebbe,
  sembrerebbe autenticata (la sessione finta si scrive comunque), ma ogni
  chiamata fallirebbe con "Accesso non autorizzato" (`buildURL()` lancia
  prima ancora di partire, `CapabilitiesProvider` lo legge come nessuna
  capability). `define` bypassa `process.env` del tutto: zero variabili da
  controllare o pulire nel dashboard Vercel, a prescindere da cosa c'è lì.
  `.env.demo` resta solo per `vite preview --mode demo` in locale — se lo
  cambi, aggiorna anche `DEMO_ENV` in `mock/index.ts`, altrimenti divergono.
- `vercel.json` — `buildCommand: npm run build:demo`, e il rewrite SPA esclude
  esplicitamente `/api/*` (altrimenti la chiamerebbe come route client-side
  invece di lasciarla alla funzione).

**Passi per pubblicare**: collega il repo GitHub a un progetto Vercel (dashboard
o `vercel` CLI) — build command e output directory sono già in `vercel.json`,
nessuna variabile d'ambiente da impostare a mano nel dashboard (e se ce ne
sono già, vuote o no, non contano più — vedi sopra). Il deploy produce un URL
tipo `https://<progetto>.vercel.app`, condivisibile subito.

**Limite noto**: `getDb()` tiene lo stato in memoria del processo Node (vedi
sotto). Sul dev server locale è un processo unico e persistente; su Vercel è
una funzione serverless — nessuna garanzia che richieste diverse finiscano
sulla stessa istanza "calda", quindi lo stato tra un'azione e l'altra può non
essere condiviso (o azzerarsi a un'istanza fredda). Va bene per una demo
puntata da un link e usata da una persona alla volta; per una sessione più
lunga o più persone in contemporanea, riavviare il deploy (o ripubblicare)
riporta al seed pulito, esattamente come riavviare `dev:mock` in locale.

---

## Il principio: `src/` non sa che il mock esiste

Non c'è nessun `if (mock)` nel codice applicativo. I service in
`src/lib/services/*` continuano a fare vere chiamate HTTP verso
`VITE_API_BASE_URL`, che in mock mode punta a `http://localhost:4300/mock-api`
e viene intercettato da un middleware del dev server.

Questo serve a una cosa concreta: quando riconsegni le proposte di UI a Edoardo,

```bash
git diff <commit-baseline>..HEAD -- src/
```

contiene **solo** le tue modifiche di prodotto. L'infrastruttura di mock resta
fuori, in questa cartella.

---

## Com'è aggirata l'autenticazione

`oidc-client-ts` legge l'utente da localStorage alla chiave
`oidc.user:{authority}:{client_id}` e lo deserializza con
`User.fromStorageString`, che è un semplice `new User(JSON.parse(...))`.

Il plugin inietta in `index.html` uno script inline (solo in mock mode) che
scrive lì un utente ben formato prima che React monti. Da quel momento in poi
tutto il resto della catena funziona da solo: `AuthProvider` trova l'utente,
`isAuthenticated` diventa true, e l'interceptor in `src/lib/api/interceptors.ts`
trova il bearer token invece di fare `signinRedirect()`.

`src/lib/auth/` è **identico** all'originale, byte per byte.

Dettagli che contano:

- La scadenza è a +10 anni, così `automaticSilentRenew` non arma mai il timer e
  l'iframe verso `public/silent-renew.html` (che caricherebbe `oidc-client-ts`
  da unpkg) non parte mai.
- Lo script ripulisce anche `REACT_QUERY_OFFLINE_CACHE`: `main.tsx` persiste la
  cache di TanStack Query in localStorage con `gcTime` 24h e senza `buster`,
  quindi senza pulizia dopo un cambio di seed vedresti i dati vecchi.
- `/community-profile` restituisce **tutte** le capability su tutte le risorse.
  Con `capabilities: []` la sidebar si svuota e le rotte
  `/questions/create|import|$questionId` ti rimbalzano indietro.

---

## Cosa c'è nei dati

Generati da un PRNG con seed fisso (`mock/rng.ts`): **stesso dataset a ogni
riavvio**, così screenshot e confronti prima/dopo sono stabili.

| | |
|---|---|
| Domande | 200 |
| Materie | 6 (Biologia, Chimica, Fisica, Matematica, Logica, Anatomia) |
| Argomenti / sotto-argomenti | 31 / 90 |
| Staff | 12 persone, 4 ruoli con capability differenziate |
| Banche dati (pool) | 8 |
| Collection | 10 |
| Test, pacchetti, SKU | 6 / 5 / 5 |
| Clienti | 40 |
| Campagne di produzione | 3 |

**Distribuzioni esatte, non campionate.** Su 200 elementi l'estrazione casuale
lascerebbe scarti di parecchi punti percentuali rispetto ai pesi dichiarati, e
le proporzioni raccontate al cliente non corrisponderebbero a quelle a schermo.
`stratify()` in `mock/rng.ts` costruisce la lista con i conteggi giusti e la
mescola:

- **Difficoltà**: 70 non ancora valutate · 24 facili · 26 medio-facili ·
  36 medie · 24 medio-difficili · 20 difficili
- **Stato**: 90 attive · 50 da revisionare · 40 bozze · 20 inattive

Il 35% a "non ancora valutata" è **voluto**: è il buco che un redesign del
grading deve rendere visibile. Con una distribuzione piatta il problema
sparirebbe dalle schermate.

14 domande sono assegnate in revisione all'utente finto, così
`/questions/to-review` non è vuota al primo avvio.

**I testi non sono lorem ipsum.** `mock/seed/content.ts` contiene due sorgenti:
domande scritte a mano (una per una, plausibili come quelle di un test di
ammissione vero) e generatori parametrici che producono varianti numeriche
reali. Alcune contengono LaTeX, che l'editor renderizza davvero.

---

## Le scritture funzionano

`POST` / `PUT` / `PATCH` / `DELETE` mutano lo stato in memoria. Puoi provare i
flussi per davvero: cambia la difficoltà di una domanda, salva, torna in lista —
il nuovo valore è lì. Assegna un revisore, approva da "Domande da revisionare",
aggiungi domande a un pool: tutto si riflette nelle altre schermate.

**Per ripartire dal seed pulito: riavvia il dev server.** Niente persistenza su
disco, nessun file di stato da ripulire.

---

## File

```
mock/
  index.ts             plugin Vite: middleware, porta, iniezione dello script
  auth-bootstrap.ts    genera lo script che scrive la sessione finta
  router.ts            mini-router a regex + helper (paginate, csv, …)
  db.ts                shape dei documenti e costruzione del seed
  rng.ts               PRNG deterministico, objectId, stratify
  seed/
    subjects.ts        gerarchia materie → argomenti → sotto-argomenti
    content.ts         banca dei testi delle domande + generatori parametrici
  handlers/
    questions.ts       16 rotte — filtri e paginazione veri
    catalog.ts         53 rotte — materie, pool, collection, test, SKU, tag
    people.ts          20 rotte — profilo, staff, ruoli, clienti, campagne

api/mock-api/[...path].ts   funzione serverless Vercel — stesso router/handler
                            di sopra, riusati per il deploy demo (vedi sopra)
```

Le shape delle risposte ricalcano le interfacce `Backend*` già dichiarate dentro
`src/lib/services/*`, non l'OpenAPI: `docs/openapi.json` è vecchio e sbagliato.
Nessun file in `mock/` importa da `src/` — viene compilato nel bundle di
`vite.config.ts` (dove l'alias `@/` non esiste) o di `api/mock-api/[...path].ts`
per il deploy Vercel. Il contrario non vale: `api/mock-api/[...path].ts`
importa da `mock/` — è l'unico consumer esterno a questa cartella.

---

## Aggiungere o modificare dati

- **Altre domande**: alza `QUESTION_COUNT` in `mock/db.ts`, oppure aggiungi voci
  a `AUTHORED` / `FAMILIES` in `mock/seed/content.ts`.
- **Altra gerarchia**: `mock/seed/subjects.ts`. I contenuti si agganciano ai
  topic per nome, con fallback casuale se un nome non combacia.
- **Cambiare le distribuzioni**: le tabelle `difficultyPlan` / `statusPlan` in
  `mock/db.ts`.
- **Un endpoint nuovo**: aggiungilo al file `handlers/` giusto. Se una schermata
  chiama qualcosa che non è coperto, il catch-all risponde `200` con una busta
  vuota e stampa un warning giallo in console — è il segnale che manca una rotta.

---

## Cosa non è coperto

- **Upload immagini**: non c'è nessun S3. `/question-images` risponde con una
  lista vuota e le URL di upload sono placeholder.
- **Impersonate cliente**: `clientsService.impersonate` fa `fetch` diretto
  all'host SSO, non passa dall'`APIClient`, quindi il mock non lo intercetta.
- **`questionsService.bulkDelete`**: lancia un errore lato client
  (`src/lib/services/questions.ts`), l'endpoint non esiste nemmeno sul backend
  vero. Quel bottone è rotto anche in produzione.
- **Filtro per brand**: `BrandProvider` esiste in `src/lib/brand/` ma non è
  montato in `main.tsx`, e il backend non filtra per brand.

### Bug pre-esistenti che noterai (non sono del mock)

- Il selettore **sotto-argomento** nella modifica di una domanda parte sempre
  vuoto, anche quando la domanda ne ha uno: `QuestionEditContent` non passa
  `sottoArgomentoId` a `useHierarchy`.
- **`useReviewerList`** restituisce tutti i community user, non solo i revisori:
  manda `role: 'revisore'` ma il backend filtra per `roleId` (ObjectId) e ignora
  il campo. C'è già un `FIXME` nel file.

---

## Se lanci `npm run dev` per sbaglio

Si rifiuta di partire e ti dice di usare `npm run dev:mock`. È voluto: prima
partiva lo stesso e al click su "Log In" restituiva un
`Unhandled Promise Rejection: Error: Not Found (404)` da `signinRedirect()`.

La causa non era intuibile dall'errore — senza `VITE_SSO_AUTHORITY` definita,
`metadataUrl` diventa la stringa letterale
`"undefined/api/.well-known/openid-configuration"`, cioè un URL relativo che
`oidc-client-ts` chiede al dev server stesso.

Questo repo non è pensato per collegarsi al backend vero. Se un giorno servisse
davvero, la configurazione è in `.env.example`.
