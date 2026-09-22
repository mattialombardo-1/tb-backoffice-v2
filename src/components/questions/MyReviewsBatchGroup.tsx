import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, ChevronDown, Layers, Loader2, ScanEye, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { BATCH_OUTCOME_LABELS, DIFFICULTY_LABELS } from '@/lib/types/questions';
import type { BatchOutcome } from '@/lib/types/questions';
import type { ReviewBatch, ReviewBatchQuestion } from '@/lib/hooks/useReviewBatches';

// Stessi colori di STATUS_CONFIG in QuestionsListTable.tsx (TO_REVIEW/ACTIVE) — il conteggio
// qui riflette lo stesso stato, quindi la stessa palette in tutto il backoffice.
const PENDING_TAG_CLASSNAME =
  'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300';
const REVIEWED_TAG_CLASSNAME =
  'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

// Badge dell'Esito mock (vedi mockOutcomeForBatch in useReviewBatches). COMPLETED riusa lo
// stesso emerald di REVIEWED_TAG_CLASSNAME sopra (= ACTIVE in QuestionsListTable): è lo
// stesso verde "successo" di tutto il backoffice, non un colore a sé — l'etichetta
// "Elaborazione Completata" (non solo "Completata", vedi sotto) è quella che distingue
// l'asse Esito dallo Stato di revisione, non serve che lo faccia anche il colore.
const OUTCOME_TAG_CLASSNAME: Record<BatchOutcome, string> = {
  COMPLETED: REVIEWED_TAG_CLASSNAME,
  // Neutro (nessun border/bg override — resta il grigio di default della variant "outline",
  // stesso trattamento del badge "N domande" accanto), non più blu: lo spinner Loader2 dentro
  // il badge (vedi sotto) già comunica "in corso" con il movimento, il colore non aggiungeva
  // segnale — solo un'altra tinta nella lista. font-semibold (la Badge base è già font-medium)
  // per ridare un po' di peso al testo, visto che ha perso il colore.
  IN_PROGRESS: 'text-muted-foreground font-semibold',
  // Yellow, non amber come PENDING_TAG_CLASSNAME ("da revisionare") sopra — due gialli
  // diversi ma vicini, non lo stesso: PARTIAL è asse Esito, "da revisionare" è asse Stato,
  // un colore identico tra i due riproporrebbe la stessa ambiguità che la separazione
  // Esito/Stato voleva evitare. L'icona AlertTriangle, condivisa col boxettino "Generate N/M
  // domande" sotto (quello resta amber), è il collegamento visivo tra badge e box.
  PARTIAL:
    'border-yellow-500 bg-yellow-100 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300',
  ERROR:
    'border-red-500 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
};

// Copy del badge sul batch, più descrittivo di BATCH_OUTCOME_LABELS (quello resta per le
// opzioni nel filtro, dove il contesto "Esito" è già dato dal nome del campo): "Completata"
// o "In corso" da sole, lette accanto a "N da revisionare", suonano come se si riferissero
// alla revisione invece che alla generazione.
const OUTCOME_BADGE_LABEL: Record<BatchOutcome, string> = {
  ...BATCH_OUTCOME_LABELS,
  IN_PROGRESS: 'Elaborazione in corso',
  COMPLETED: 'Elaborazione Completata',
  PARTIAL: 'Elaborazione Parziale',
  ERROR: 'Errore in elaborazione',
};

// Larghezze condivise tra l'header di colonna e le righe, così restano allineate.
const COL_CHECKBOX = 'w-8';
const COL_MATERIA = 'w-28';
const COL_ARGOMENTO = 'w-44';
const COL_DIFFICULTY = 'w-28';
const COL_DATE = 'w-24';
const COL_ACTION = 'w-32';

function BatchColumnHeader({ selectionMode }: { selectionMode: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-4 border-b bg-muted/30 px-5 py-2 text-xs font-medium text-muted-foreground">
      {/* Spacer: allinea questa riga alla checkbox di ogni riga sotto, senza una propria —
          la selezione dell'intero batch è già sul checkbox nell'header della card. */}
      {selectionMode && <div className={cn(COL_CHECKBOX, 'shrink-0')} />}
      <div className="min-w-0 flex-1">{t('myReviews.table.text')}</div>
      <div className={cn(COL_MATERIA, 'shrink-0')}>{t('myReviews.table.materia')}</div>
      <div className={cn(COL_ARGOMENTO, 'shrink-0')}>{t('myReviews.table.argomento')}</div>
      <div className={cn(COL_DIFFICULTY, 'shrink-0')}>{t('myReviews.table.difficulty')}</div>
      <div className={cn(COL_DATE, 'shrink-0')}>{t('myReviews.table.createdAt')}</div>
      <div className={cn(COL_ACTION, 'shrink-0')} />
    </div>
  );
}

function BatchQuestionRow({
  question,
  index,
  selectionMode,
  selected,
  onToggleSelected,
}: {
  question: ReviewBatchQuestion;
  index: number;
  selectionMode: boolean;
  selected: boolean;
  onToggleSelected: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reviewed = question.reviewedInSession;
  const preview = question.questionText.replace(/<[^>]+>/g, '').slice(0, 100);

  const goToReview = () => {
    if (reviewed) return;
    navigate({
      to: '/questions/$questionId',
      params: { questionId: question.id },
      search: { review: true },
    });
  };

  // In modalità selezione la riga seleziona invece di navigare — aprire la domanda a metà
  // di una selezione multipla perderebbe il contesto (quali erano già spuntate).
  const handleRowClick = () => {
    if (reviewed) return;
    if (selectionMode) {
      onToggleSelected();
    } else {
      goToReview();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-5 py-3 transition-colors',
        !reviewed && 'cursor-pointer hover:bg-accent/30'
      )}
      onClick={handleRowClick}
    >
      {selectionMode && (
        <div className={cn(COL_CHECKBOX, 'shrink-0')}>
          {/* Solo le domande pending sono selezionabili — quelle già revisionate in questa
              sessione sono chiuse, non ha senso approvarle/rigettarle di nuovo in bulk. */}
          {!reviewed && (
            <Checkbox
              checked={selected}
              onCheckedChange={onToggleSelected}
              onClick={(e) => e.stopPropagation()}
              aria-label={t('myReviews.bulk.selectAction', { index })}
            />
          )}
        </div>
      )}
      {/* L'opacità attenuata resta sul contenuto della domanda, non sulla chip di stato:
          "Revisionata" deve spiccare con lo stesso verde pieno del conteggio nell'header
          del batch, non leggersi come disabilitata insieme al resto della riga. */}
      <div className={cn('flex min-w-0 flex-1 items-center gap-4', reviewed && 'opacity-50')}>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium', reviewed && 'line-through')}>
            <span className="mr-1.5 text-muted-foreground">{index}.</span>
            {preview || (
              <span className="text-muted-foreground italic">{t('myReviews.noText')}</span>
            )}
          </p>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{question.id}</p>
        </div>
        {/* Campi già presenti su main (QuestionRow lì) — qui a colonne separate (Materia e
            Argomento distinti, non uniti in una cella), per sfruttare lo spazio orizzontale
            liberato togliendo "Anteprima". */}
        <div className={cn(COL_MATERIA, 'shrink-0 truncate text-sm text-muted-foreground')}>
          {question.materiaName}
        </div>
        <div className={cn(COL_ARGOMENTO, 'shrink-0 truncate text-sm text-muted-foreground')}>
          {question.argomentoName || '—'}
        </div>
        <div className={cn(COL_DIFFICULTY, 'shrink-0 truncate text-sm text-muted-foreground')}>
          {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
        </div>
        <div className={cn(COL_DATE, 'shrink-0 whitespace-nowrap text-sm text-muted-foreground')}>
          {new Date(question.createdAt).toLocaleDateString('it-IT')}
        </div>
      </div>
      {reviewed ? (
        <div className={cn(COL_ACTION, 'flex shrink-0 justify-end')}>
          <Badge variant="outline" className={REVIEWED_TAG_CLASSNAME}>
            Revisionata
          </Badge>
        </div>
      ) : (
        // Nascosto in modalità selezione: cliccare "Revisiona" naviga via perdendo la
        // selezione fatta finora — in quella modalità l'unica azione sulla riga è spuntarla.
        !selectionMode && (
          <Button
            size="sm"
            className={cn(COL_ACTION, 'shrink-0 gap-1.5')}
            onClick={(e) => {
              e.stopPropagation();
              goToReview();
            }}
          >
            <ScanEye className="h-4 w-4" />
            {t('myReviews.review')}
          </Button>
        )
      )}
    </div>
  );
}

/**
 * Proposta di design — un batch di domande generate insieme (stessa materia, stesso giorno),
 * mostrato come blocco a sé sopra il "listone" piatto delle revisioni singole. Dentro, le
 * domande ancora da revisionare stanno in evidenza in alto; quelle già revisionate in questa
 * sessione scendono in fondo, attenuate. Il blocco sparisce da solo quando non resta più
 * nulla da revisionare — nessuna azione manuale di chiusura. Il badge Esito (con eventuale
 * motivo sotto) è mock — vedi mockOutcomeForBatch in useReviewBatches.ts.
 */
export function MyReviewsBatchGroup({
  batch,
  open,
  onOpenChange,
  cardRef,
  selectionMode,
  selectedIds,
  onToggleQuestion,
  onToggleBatch,
}: {
  batch: ReviewBatch;
  /** Sollevato al genitore (MyReviewsPage): un solo batch aperto alla volta — aprirne uno
   *  chiude quello già aperto, come un accordion. */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ref sulla Card, per poter riportare il batch appena aperto in cima alla vista — vedi
   *  l'effect di scroll in MyReviewsPage. */
  cardRef?: Ref<HTMLDivElement>;
  /** Selezione multipla — sollevata a MyReviewsPage insieme al resto dello stato di
   *  selezione, per coordinare la chip/CTA in alto a destra su tutti i batch. */
  selectionMode: boolean;
  selectedIds: Set<string>;
  onToggleQuestion: (id: string) => void;
  onToggleBatch: (batch: ReviewBatch) => void;
}) {
  const { t } = useTranslation();
  // Ordine e numerazione stabili sulla data di creazione (= ordine di generazione), non
  // sull'ordine restituito dal server — così un numero resta lo stesso anche quando la
  // domanda scende da "da revisionare" a "già revisionate", e le righe appaiono in ordine.
  const byCreatedAt = (a: ReviewBatchQuestion, b: ReviewBatchQuestion) =>
    a.createdAt.localeCompare(b.createdAt);
  const numberById = new Map(
    [...batch.pending, ...batch.reviewed].sort(byCreatedAt).map((q, i) => [q.id, i + 1])
  );
  const sortedPending = [...batch.pending].sort(byCreatedAt);
  const sortedReviewed = [...batch.reviewed].sort(byCreatedAt);

  const selectedInBatch = batch.pending.filter((q) => selectedIds.has(q.id)).length;
  const batchCheckedState: boolean | 'indeterminate' =
    batch.pending.length === 0
      ? false
      : selectedInBatch === batch.pending.length
        ? true
        : selectedInBatch === 0
          ? false
          : 'indeterminate';

  // ERROR: dietro non c'è stata generazione, quindi per questo batch "non esistono" domande
  // da mostrare/aprire/selezionare — anche se il mock lo riusa da un batch reale con domande
  // vere (vedi mockOutcomeForBatch), qui lo trattiamo come vuoto: 0 domande, niente chip
  // Stato, niente apertura né selezione bulk. L'unica cosa da vedere è il box d'errore sotto.
  const hasError = batch.outcome === 'ERROR';
  // IN_PROGRESS ha lo stesso blocco su apertura/selezione/chip Stato di ERROR: finché la
  // generazione non passa a "Elaborazione Completata" nessuna domanda è stata davvero
  // prodotta/assegnata, quindi aprire il batch mostrerebbe comunque le domande vere del mock
  // sottostante — la stessa incoerenza risolta per ERROR. Unica differenza: "N domande" NON
  // va azzerato, è la quantità target/richiesta, non un fallimento (vedi sotto).
  const isLocked = hasError || batch.outcome === 'IN_PROGRESS';

  const header = (
    <div className="flex min-w-0 items-center gap-3">
      <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          {/* truncate: l'argomento nel titolo può essere lungo — su una riga sola con
              ellissi invece di andare a capo o spingere i badge fuori. */}
          <p className="truncate text-sm font-semibold">
            {batch.materiaName} · {batch.argomentoName} · {batch.dateLabel}
          </p>
          <Badge variant="outline" className="shrink-0 font-normal text-muted-foreground">
            {hasError ? 0 : batch.pending.length + batch.reviewed.length} domande
          </Badge>
          {/* Esito (mock — vedi mockOutcomeForBatch) sta qui, non nella riga sotto con
              Stato: sono due assi diversi (come è nato il batch vs quanto lavoro di
              revisione resta) — tenerli separati evita che i colori competano nella
              stessa riga, specie con COMPLETED che riusa l'emerald di "già revisionate". */}
          <Badge
            variant="outline"
            className={cn('shrink-0 gap-1', OUTCOME_TAG_CLASSNAME[batch.outcome])}
          >
            {batch.outcome === 'IN_PROGRESS' && (
              <Loader2 className="h-3 w-3 animate-spin [animation-duration:1.6s]" />
            )}
            {batch.outcome === 'PARTIAL' && <AlertTriangle className="h-3 w-3" />}
            {batch.outcome === 'ERROR' && <XCircle className="h-3 w-3" />}
            {OUTCOME_BADGE_LABEL[batch.outcome]}
            {batch.outcome === 'IN_PROGRESS' &&
              batch.outcomeProgress != null &&
              ` · ${batch.outcomeProgress}%`}
          </Badge>
        </div>
        {/* Niente chip Stato per ERROR/IN_PROGRESS: per ERROR è coerente con "0 domande" sopra
            (mostrare "10 da revisionare" contraddirebbe sia il conteggio azzerato sia il box
            d'errore sotto); per IN_PROGRESS, anche se "N domande" resta il target, nessuna di
            quelle domande esiste ancora davvero — non c'è nulla da segnare come "da
            revisionare" finché la generazione non è completa. */}
        {!isLocked && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={PENDING_TAG_CLASSNAME}>
              {batch.pending.length} da revisionare
            </Badge>
            <Badge variant="outline" className={REVIEWED_TAG_CLASSNAME}>
              {batch.reviewed.length} già revisionate
            </Badge>
          </div>
        )}
        {/* Motivo mock dell'errore — solo per ERROR, sempre visibile qui: quei batch non sono
            apribili (isLocked, "0 domande", niente contenuto da mostrare — vedi sotto), quindi
            non c'è un accordion in cui spostarlo, a differenza del PARTIAL (vedi CardContent
            più sotto). Niente più box (bordo/sfondo/padding): dentro una lista di card era
            troppo peso visivo — resta solo icona + testo colorato. mt-2, non mt-3.5 come aveva
            PARTIAL: per ERROR non c'è la riga di chip Stato in mezzo (isLocked la nasconde,
            vedi sopra) — questo testo segue direttamente la riga del titolo, stesso ritmo
            verticale (mt-2) già usato lì. */}
        {hasError && batch.outcomeReason && (
          <div className="mt-2 flex max-w-prose items-start gap-1.5">
            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600 dark:text-red-400" />
            <p className="text-xs leading-relaxed text-red-700 dark:text-red-300">
              <span className="font-semibold">Creazione domande interrotta</span>{' '}
              {batch.outcomeReason}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    // scroll-mt-6: quando l'apertura del batch lo riporta in cima alla vista (vedi l'effect
    // di scroll in MyReviewsPage), lascia lo stesso margine del padding dell'header (p-6)
    // invece di incollarlo al bordo della viewport.
    <Card ref={cardRef} className="overflow-hidden scroll-mt-6">
      <div
        className={cn(
          'flex w-full items-center gap-4 px-5 py-4 transition-colors',
          !isLocked && 'hover:bg-accent/30'
        )}
      >
        {selectionMode && (
          // Fuori dal <button> di apertura/chiusura sotto: un checkbox è a sua volta un
          // elemento interattivo, e un <button> non può contenerne un altro validamente.
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={batchCheckedState}
              onCheckedChange={() => onToggleBatch(batch)}
              // ERROR resta "chiuso" (isLocked: niente apertura, niente chip Stato — vedi
              // sopra), ma le sue domande esistono comunque per davvero nel mock (vedi il
              // commento su hasError) e devono poter essere selezionate e rigettate in bulk
              // da qui: è l'unico modo di liberarsi di un batch fallito, dato che non c'è
              // nulla da aprire/revisionare dentro. IN_PROGRESS resta disabilitato: lì le
              // domande non esistono ancora davvero.
              disabled={(isLocked && !hasError) || batch.pending.length === 0}
              aria-label={t('myReviews.bulk.selectBatchAction', {
                materia: batch.materiaName,
                argomento: batch.argomentoName,
              })}
            />
          </div>
        )}
        {/* ERROR/IN_PROGRESS non aprono nulla — vedi isLocked sopra: niente <button>, niente
            ChevronDown, solo il contenuto informativo. */}
        {isLocked ? (
          <div className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left">
            {header}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenChange(!open)}
            className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
          >
            {header}
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        )}
      </div>

      {open && !isLocked && (
        <CardContent className="border-t p-0">
          {/* Motivo mock del parziale (brief: "dichiara perché mancano le altre") — spostato
              qui dentro l'accordion aperto, non più nell'header sempre visibile: su una card
              PARTIAL a riposo il colore si accumulava (badge Esito + chip Stato + questo
              warning, tutti insieme) senza che l'utente avesse chiesto di vederlo. Aprendo il
              batch la richiesta è implicita — è lì che si legge perché mancano domande. Su
              PARTIAL il "Generate N/M domande" è in semibold, il resto della frase no — N è
              vero (pending.length + reviewed.length), M è mockato (outcomeRequested). */}
          {batch.outcomeReason && (
            <div className="flex max-w-prose items-start gap-1.5 border-b px-5 py-3">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300">
                <span className="font-semibold">
                  Generate {batch.pending.length + batch.reviewed.length}/{batch.outcomeRequested}{' '}
                  domande.
                </span>{' '}
                {batch.outcomeReason}
              </p>
            </div>
          )}
          <BatchColumnHeader selectionMode={selectionMode} />
          {sortedPending.map((q) => (
            <div key={q.id} className="border-b last:border-b-0">
              <BatchQuestionRow
                question={q}
                index={numberById.get(q.id) ?? 0}
                selectionMode={selectionMode}
                selected={selectedIds.has(q.id)}
                onToggleSelected={() => onToggleQuestion(q.id)}
              />
            </div>
          ))}
          {sortedReviewed.map((q) => (
            <div key={q.id} className="border-b last:border-b-0">
              <BatchQuestionRow
                question={q}
                index={numberById.get(q.id) ?? 0}
                selectionMode={selectionMode}
                selected={false}
                onToggleSelected={() => onToggleQuestion(q.id)}
              />
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}
