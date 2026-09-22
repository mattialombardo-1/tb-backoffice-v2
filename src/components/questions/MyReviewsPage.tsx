import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  AlertCircle,
  CheckCircle,
  ClipboardCheck,
  ListChecks,
  Loader2,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Route } from '@/routes/_authenticated/questions/to-review';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { useBulkSelection } from '@/lib/hooks/useBulkSelection';
import { useReviewBatches, type ReviewBatch } from '@/lib/hooks/useReviewBatches';
import type {
  BatchOutcome,
  MyReviewsFilters as FiltersType,
  MyReviewStatus,
} from '@/lib/types/questions';
import { MyReviewsBatchGroup } from './MyReviewsBatchGroup';
import { MyReviewsBulkRejectDialog } from './MyReviewsBulkRejectDialog';
import { MyReviewsFilters } from './MyReviewsFilters';
import { QuestionsListPagination } from './QuestionsListPagination';

const parseCSV = (v: string | undefined): string[] => (v ? v.split(',').filter(Boolean) : []);

// Batch più "pesanti" di una riga di Domande — ogni card si apre in una tabella che può
// arrivare a decine di righe — quindi una pagina più corta di quella di Domande (20).
const PER_PAGE = 10;

export function MyReviewsPage() {
  const { t } = useTranslation();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const apiClient = useApiClient();

  const filters: FiltersType = {
    materias: parseCSV(search.materias),
    argomenti: parseCSV(search.argomenti),
    statuses: parseCSV(search.statuses) as MyReviewStatus[],
    outcomes: parseCSV(search.outcomes) as BatchOutcome[],
    dateFrom: search.dateFrom ?? '',
    dateTo: search.dateTo ?? '',
    search: search.search ?? '',
  };
  const page = search.page ?? 1;

  const updateFilters = (patch: Partial<FiltersType>) => {
    const next = { ...filters, ...patch };
    navigate({
      to: '/questions/to-review',
      search: {
        materias: next.materias.join(',') || undefined,
        argomenti: next.argomenti.join(',') || undefined,
        statuses: next.statuses.join(',') || undefined,
        outcomes: next.outcomes.join(',') || undefined,
        dateFrom: next.dateFrom || undefined,
        dateTo: next.dateTo || undefined,
        search: next.search || undefined,
        // page omesso di proposito: un cambio filtro riporta sempre a pagina 1, come in
        // QuestionsListPage — restare sulla pagina 5 quando il filtro ne lascia 2 sarebbe
        // una pagina vuota.
      },
      replace: true,
    });
  };

  const handleResetFilters = () => {
    updateFilters({
      materias: [],
      argomenti: [],
      statuses: [],
      outcomes: [],
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };

  const hasFilters =
    filters.materias.length > 0 ||
    filters.argomenti.length > 0 ||
    filters.statuses.length > 0 ||
    filters.outcomes.length > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo ||
    !!filters.search;

  const { batches, materiaOptions, argomentoOptions, isFetching, isError, refetch } =
    useReviewBatches(filters);

  const pagedBatches = batches.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Un solo batch aperto alla volta, come un accordion — aprirne uno chiude quello già
  // aperto. Sollevato qui (non locale a ogni MyReviewsBatchGroup) proprio per poterlo
  // coordinare tra le card.
  const [openBatchKey, setOpenBatchKey] = useState<string | null>(null);
  // Un ref per card (chiave = batch.key), per poter ancorare lo scroll all'inizio del
  // batch appena aperto — stesso pattern di QuestionGenerationStep per le righe.
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Selezione multipla — stesso hook generico già usato in QuestionsListPage. Lo scope di
  // "tutto" (selectPage con ogni id pending di ogni batch filtrato, non solo la pagina
  // corrente) non ha bisogno della modalità "isAllSelected" virtuale dell'hook: qui i dati
  // sono già tutti in memoria (myReviews() non è paginato lato server), quindi "tutto" è un
  // insieme concreto di id, non un conteggio da un endpoint separato.
  const bulk = useBulkSelection();
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [bulkRejectDialogOpen, setBulkRejectDialogOpen] = useState(false);

  const allPendingIds = batches.flatMap((b) => b.pending.map((q) => q.id));
  const allSelected = bulk.isPageFullySelected(allPendingIds);
  const someSelected = allPendingIds.some((id) => bulk.selectedIds.has(id));
  const selectAllState: boolean | 'indeterminate' =
    allPendingIds.length === 0
      ? false
      : allSelected
        ? true
        : someSelected
          ? 'indeterminate'
          : false;

  const handleToggleBatch = (batch: ReviewBatch) => {
    const ids = batch.pending.map((q) => q.id);
    if (bulk.isPageFullySelected(ids)) {
      bulk.deselectPage(ids);
    } else {
      bulk.selectPage(ids);
    }
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      bulk.deselectPage(allPendingIds);
    } else {
      bulk.selectPage(allPendingIds);
    }
  };

  const handleBulkApprove = async () => {
    const ids = [...bulk.selectedIds];
    setIsBulkApproving(true);
    try {
      const result = await questionsService.bulkApprove(apiClient, ids);
      bulk.clearSelection();
      refetch();
      if (result.failed.length > 0) {
        toast.error(t('myReviews.bulk.approveFailed', { count: result.failed.length }), {
          action: { label: t('common.retry'), onClick: () => bulk.setSelection(result.failed) },
        });
      } else {
        toast.success(t('myReviews.bulk.approveSuccess', { count: result.approved.length }));
      }
    } catch {
      toast.error(t('myReviews.bulk.approveError'));
    } finally {
      setIsBulkApproving(false);
    }
  };

  const handleBulkRejectConfirm = async (reason: string) => {
    const ids = [...bulk.selectedIds];
    try {
      const result = await questionsService.bulkReject(apiClient, ids, reason);
      setBulkRejectDialogOpen(false);
      bulk.clearSelection();
      refetch();
      if (result.failed.length > 0) {
        toast.error(t('myReviews.bulk.rejectFailed', { count: result.failed.length }), {
          action: { label: t('common.retry'), onClick: () => bulk.setSelection(result.failed) },
        });
      } else {
        toast.success(t('myReviews.bulk.rejectSuccess', { count: result.rejected.length }));
      }
    } catch {
      setBulkRejectDialogOpen(false);
      toast.error(t('myReviews.bulk.rejectError'));
    }
  };

  const handlePageChange = (nextPage: number) => {
    // Il batch aperto non esiste più su una pagina diversa: lo richiudiamo esplicitamente
    // (non solo "nascosto" — vedi effectiveOpenKey sotto) così tornare sulla pagina di
    // prima non lo ritrova magicamente riaperto senza che l'utente l'abbia più cliccato.
    setOpenBatchKey(null);
    navigate({
      to: '/questions/to-review',
      search: {
        materias: filters.materias.join(',') || undefined,
        argomenti: filters.argomenti.join(',') || undefined,
        statuses: filters.statuses.join(',') || undefined,
        outcomes: filters.outcomes.join(',') || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        search: filters.search || undefined,
        page: nextPage === 1 ? undefined : nextPage,
      },
      replace: true,
    });
  };

  // A prescindere da dove si trovava lo scroll, aprire un batch lo riporta in cima alla
  // vista: aprirne uno più in basso mentre si è scrollati non deve lasciarlo a metà schermo.
  useEffect(() => {
    if (openBatchKey) {
      cardRefs.current[openBatchKey]?.scrollIntoView({ block: 'start' });
    }
  }, [openBatchKey]);

  // Rete di sicurezza per il caso non coperto da handlePageChange: il batch aperto sparisce
  // perché non passa più i filtri (es. si digita nella ricerca mentre è aperto). Derivato al
  // render, non con un effect che rincorre lo stato — così non c'è mai un giro in cui
  // l'accordion risulta "aperto" su un batch che non è renderizzato.
  const effectiveOpenKey = pagedBatches.some((b) => b.key === openBatchKey) ? openBatchKey : null;

  if (isError) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{t('myReviews.errorTitle')}</p>
            <p className="text-sm">{t('myReviews.errorDesc')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />
              {t('myReviews.title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{t('myReviews.subtitle')}</p>
          </div>

          {bulk.isBulkMode ? (
            <div className="flex items-center gap-3">
              {/* Checkbox, non più una CTA — coerente con "seleziona tutto" delle tabelle
                  bulk altrove (es. QuestionsListTable), non un pulsante a sé. Sempre
                  visibile in modalità selezione, non solo dopo la prima spunta: è il modo
                  per selezionare tutto senza dover aprire ogni batch e spuntare a mano. */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectAllState}
                  onCheckedChange={handleToggleSelectAll}
                  aria-label={t('myReviews.bulk.selectAllAction')}
                />
                <span className="text-sm text-muted-foreground">
                  {t('myReviews.bulk.selectAll', { count: allPendingIds.length })}
                </span>
              </div>

              {/* min-w fisso + tabular-nums: senza, il numero di cifre (1 vs 2) cambia la
                  larghezza della chip ad ogni spunta e fa "ballare" Rigetta/Approva a destra —
                  stesso fix di QuestionGenerationStep. */}
              <Badge variant="secondary" className="min-w-28 tabular-nums">
                {t('questions.bulk.selected', { count: bulk.selectedCount })}
              </Badge>

              <Button variant="ghost" size="sm" onClick={bulk.toggleBulkMode}>
                {t('questions.bulk.cancelSelection')}
              </Button>

              {/* Sempre visibili (non solo con una selezione), disattivate finché non c'è
                  almeno una domanda/batch selezionato — non un'azione che compare dal nulla.
                  Stessi colore/icona di "Salva e Approva" e "Rigetta" in QuestionEditContent
                  — approva sempre verde, rigetta sempre rosso, in tutto il backoffice. */}
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkRejectDialogOpen(true)}
                disabled={bulk.selectedCount === 0}
              >
                <XCircle className="h-4 w-4" />
                {t('myReviews.bulk.rejectAction')}
              </Button>
              <Button
                size="sm"
                onClick={handleBulkApprove}
                disabled={bulk.selectedCount === 0 || isBulkApproving}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isBulkApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {t('myReviews.bulk.approveAction')}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={bulk.toggleBulkMode}>
                <ListChecks className="h-4 w-4" />
                {t('myReviews.bulk.toggle')}
              </Button>
              {/* isFetching (non isLoading): isLoading resta false durante un refetch manuale
                  perché ci sono già dati in cache, quindi da solo non farebbe mai girare
                  l'icona al click. A riposo un'icona "a cerchio" statica leggeva come un
                  simbolo rotto, non come un pulsante di ricarica — RefreshCw a riposo,
                  spinner solo mentre carica. */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title={t('common.refresh')}
              >
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Filtri: stessi campi/layout di QuestionsListFilters (sezione "Domande") più Esito,
            specifico di questa schermata — ridotti a Stato, Esito, Materia, Argomento, Periodo
            più la ricerca testo/ID. Applicati client-side dentro useReviewBatches:
            myReviews() non accetta parametri di filtro. Esito è mockato — vedi il commento su
            mockOutcomeForBatch in useReviewBatches.ts. */}
        <MyReviewsFilters
          filters={filters}
          onFilterChange={updateFilters}
          onReset={handleResetFilters}
          materiaOptions={materiaOptions}
          argomentoOptions={argomentoOptions}
        />

        {/* Proposta di design: il "listone" piatto delle revisioni singole è nascosto per
            ora — interfaccia pulita per concentrarsi sui batch generati insieme (stessa
            materia, stesso giorno). Vedi useReviewBatches. */}
        {pagedBatches.length > 0 ? (
          <div className="space-y-3">
            {pagedBatches.map((batch) => (
              <MyReviewsBatchGroup
                key={batch.key}
                batch={batch}
                open={effectiveOpenKey === batch.key}
                onOpenChange={(next) => setOpenBatchKey(next ? batch.key : null)}
                cardRef={(el) => {
                  cardRefs.current[batch.key] = el;
                }}
                selectionMode={bulk.isBulkMode}
                selectedIds={bulk.selectedIds}
                onToggleQuestion={bulk.toggleItem}
                onToggleBatch={handleToggleBatch}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="text-sm text-muted-foreground">
              {hasFilters ? t('myReviews.noResultsFiltered') : t('myReviews.empty')}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                {t('myReviews.resetFilters')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Stessa barra sticky in fondo di QuestionsListPage — coerenza col resto del
          backoffice invece di un contatore/paginazione posizionato diversamente qui. */}
      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <QuestionsListPagination
          page={page}
          total={batches.length}
          perPage={PER_PAGE}
          onPageChange={handlePageChange}
        />
      </div>

      <MyReviewsBulkRejectDialog
        open={bulkRejectDialogOpen}
        count={bulk.selectedCount}
        onConfirm={handleBulkRejectConfirm}
        onCancel={() => setBulkRejectDialogOpen(false)}
      />
    </div>
  );
}
