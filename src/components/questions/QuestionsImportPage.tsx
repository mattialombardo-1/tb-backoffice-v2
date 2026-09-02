import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { SearchableCombobox, type ComboboxOption } from '@/components/ui/searchable-combobox';
import { useApiClient } from '@/lib/api/useApiClient';
import { useReviewerList } from '@/lib/hooks/useReviewerList';
import { questionsService } from '@/lib/services/questions';
import { parseQuestionsCsv } from '@/lib/csv/parseQuestionsCsv';
import { buildQuestionsCsvTemplate } from '@/lib/csv/questionsCsvTemplate';
import {
  MAX_BULK_ITEMS,
  type BulkImportItem,
  type BulkJobStatus,
  type ParsedQuestionRow,
} from '@/lib/types/questionsImport';
import { QuestionsImportPreviewTable } from './QuestionsImportPreviewTable';
import { QuestionsImportPreviewDialog } from './QuestionsImportPreviewDialog';

// Async job polling. The POST returns 202; we poll GET until a terminal status.
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function reviewerLabel(r: {
  name?: string;
  surname?: string;
  email?: string;
  _id: string;
}): string {
  const fullName = [r.name, r.surname].filter(Boolean).join(' ').trim();
  if (fullName && r.email) return `${fullName} · ${r.email}`;
  return fullName || r.email || r._id;
}

export function QuestionsImportPage() {
  const navigate = useNavigate();
  const client = useApiClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  const [rows, setRows] = useState<ParsedQuestionRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewRow, setPreviewRow] = useState<ParsedQuestionRow | null>(null);
  const [massReviewerId, setMassReviewerId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<BulkJobStatus | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  // Payload index of the item that made the job fail (results/rows share order).
  const [failedIndex, setFailedIndex] = useState<number | null>(null);

  const [subjectNames, setSubjectNames] = useState<Map<string, string>>(new Map());
  const [topicNames, setTopicNames] = useState<Map<string, string>>(new Map());

  // Stop polling if the user navigates away mid-import.
  useEffect(() => {
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  const { reviewers, isLoading: reviewersLoading } = useReviewerList();

  const reviewerOptions: ComboboxOption[] = useMemo(
    () => reviewers.map((r) => ({ value: r._id, label: reviewerLabel(r) })),
    [reviewers]
  );

  // Resolve hierarchy ids → names for the read-only preview.
  useEffect(() => {
    if (rows.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const materie = await questionsService.getMaterie(client);
        if (cancelled) return;
        const subjMap = new Map(materie.map((m) => [m.id, m.name]));
        setSubjectNames(subjMap);

        const uniqueSubjectIds = [...new Set(rows.map((r) => r.subjectId).filter(Boolean))];
        const topicMap = new Map<string, string>();
        await Promise.all(
          uniqueSubjectIds.map(async (sid) => {
            const argomenti = await questionsService.getArgomenti(client, sid);
            argomenti.forEach((a) => topicMap.set(a.id, a.name));
          })
        );
        if (!cancelled) setTopicNames(topicMap);
      } catch {
        // Non-blocking: table falls back to showing raw ids.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rows, client]);

  const handlePickFile = () => fileInputRef.current?.click();

  const handleDownloadTemplate = () => {
    const blob = new Blob([buildQuestionsCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modello-import-domande.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      toast.error('Seleziona un file CSV.');
      return;
    }

    try {
      const text = await file.text();
      const result = parseQuestionsCsv(text);
      if (result.errors.length > 0) {
        toast.error(result.errors.join(' '));
        return;
      }

      // Pre-assign reviewers from the optional `revisore_email` column.
      const byEmail = new Map(
        reviewers.filter((r) => r.email).map((r) => [r.email!.toLowerCase(), r._id] as const)
      );
      const withReviewers = result.rows.map((row) =>
        row.reviewerEmail
          ? { ...row, reviewerId: byEmail.get(row.reviewerEmail.toLowerCase()) ?? null }
          : row
      );

      setRows(withReviewers);
      setFileName(file.name);
      setMassReviewerId(null);
    } catch {
      toast.error('Impossibile leggere il file.');
    }
  };

  const handleAssignReviewer = (rowNumber: number, reviewerId: string | null) => {
    setRows((prev) => prev.map((r) => (r.rowNumber === rowNumber ? { ...r, reviewerId } : r)));
  };

  const handleMassAssign = (reviewerId: string | null) => {
    setMassReviewerId(reviewerId);
    if (reviewerId) {
      setRows((prev) => prev.map((r) => ({ ...r, reviewerId })));
    }
  };

  const handleReset = () => {
    setRows([]);
    setFileName(null);
    setMassReviewerId(null);
  };

  const errorCount = rows.filter((r) => r.rowErrors.length > 0).length;
  const missingReviewerCount = rows.filter((r) => !r.reviewerId).length;
  const updateCount = rows.filter((r) => r.isUpdate).length;
  const createCount = rows.length - updateCount;
  const tooManyRows = rows.length > MAX_BULK_ITEMS;
  const canImport =
    rows.length > 0 &&
    errorCount === 0 &&
    missingReviewerCount === 0 &&
    !tooManyRows &&
    !isImporting;

  const handleImport = async () => {
    if (!canImport) return;
    setIsImporting(true);
    setImportError(null);
    setFailedIndex(null);
    setImportStatus('PENDING');
    try {
      const items: BulkImportItem[] = rows.map((r) => ({
        id: r.id,
        subjectId: r.subjectId,
        topicId: r.topicId,
        sottoArgomentoId: r.sottoArgomentoId,
        type: r.type,
        difficulty: r.difficulty,
        language: r.language,
        questionText: r.questionText,
        explanationText: r.explanationText,
        questionImages: r.questionImages,
        explanationImages: r.explanationImages,
        alternatives: r.alternatives,
        completionAnswer: r.completionAnswer,
        reviewerId: r.reviewerId!, // guaranteed by canImport
      }));

      const start = await questionsService.bulkImport(client, { items });
      setImportStatus(start.status);

      // Poll until the job reaches a terminal status (COMPLETED / FAILED).
      const deadline = Date.now() + POLL_TIMEOUT_MS;
      for (;;) {
        if (cancelledRef.current) return;
        if (Date.now() > deadline) throw new Error('Timeout monitoraggio import');
        await sleep(POLL_INTERVAL_MS);
        if (cancelledRef.current) return;

        const job = await questionsService.getBulkJob(client, start.jobId);
        setImportStatus(job.status);

        if (job.status === 'COMPLETED') {
          const created = job.results?.filter((r) => r.action === 'created').length ?? createCount;
          const updated = job.results?.filter((r) => r.action === 'updated').length ?? updateCount;
          toast.success(`Import completato: ${created} create, ${updated} aggiornate.`);
          navigate({ to: '/questions' });
          return;
        }
        if (job.status === 'FAILED') {
          const fi = job.failedIndex ?? -1;
          setFailedIndex(fi >= 0 ? fi : null);
          const msg = job.error ?? 'Import fallito.';
          setImportError(
            fi >= 0
              ? `${msg} (riga ${fi + 1}). Nessuna domanda è stata salvata: correggi e reinvia.`
              : `${msg}. Nessuna domanda è stata salvata: correggi e reinvia.`
          );
          toast.error(msg);
          return;
        }
        // PENDING / PROCESSING → keep polling.
      }
    } catch {
      setImportError('Errore durante l’avvio o il monitoraggio dell’import. Riprova.');
      toast.error('Errore durante l’import. Riprova.');
    } finally {
      if (!cancelledRef.current) {
        setIsImporting(false);
        setImportStatus(null);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 pb-6 pt-0 space-y-6">
        {/* z-30: sopra il thead sticky (z-10), sotto i portali di Radix (z-50) — altrimenti
            il backdrop-blur si mangia dropdown, dialog e popover. */}
        <div className="flex items-center p-6 backdrop-blur-lg z-30 justify-between sticky top-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate({ to: '/questions' })}
              aria-label="Indietro"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">Importa domande da CSV</h1>
              <p className="text-sm text-muted-foreground">
                Carica un CSV per creare o aggiornare domande in blocco
              </p>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="px-6 flex flex-col gap-6">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed py-16 text-center">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium">Nessun file caricato</p>
                <p className="text-sm text-muted-foreground">
                  Formati supportati: CSV con separatore , o ;
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handlePickFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Carica CSV
                </Button>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Scarica modello CSV
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Summary + actions */}
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {rows.length} domande · {createCount} nuove · {updateCount} aggiornamenti
                    {errorCount > 0 && (
                      <span className="text-destructive"> · {errorCount} con errori</span>
                    )}
                    {missingReviewerCount > 0 && (
                      <span className="text-amber-600">
                        {' '}
                        · {missingReviewerCount} senza revisore
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <div className="space-y-1">
                    <label className="mb-1.5 block text-xs text-muted-foreground">
                      Assegna revisore a tutte
                    </label>
                    <SearchableCombobox
                      value={massReviewerId}
                      onChange={handleMassAssign}
                      options={reviewerOptions}
                      disabled={reviewersLoading || isImporting}
                      className="w-64"
                      placeholder={reviewersLoading ? 'Caricamento…' : 'Seleziona revisore'}
                      searchPlaceholder="Cerca revisore…"
                      emptyMessage="Nessun revisore."
                    />
                  </div>
                  <Button variant="outline" onClick={handlePickFile} disabled={isImporting}>
                    Cambia file
                  </Button>
                  <Button variant="ghost" onClick={handleReset} disabled={isImporting}>
                    Annulla
                  </Button>
                  <Button onClick={handleImport} disabled={!canImport}>
                    {isImporting
                      ? importStatus === 'PENDING'
                        ? 'Avvio import…'
                        : 'Import in corso…'
                      : `Importa (${rows.length})`}
                  </Button>
                </div>
              </div>

              {isImporting && (
                <p className="text-sm text-muted-foreground">
                  Import atomico in corso (stato: {importStatus ?? 'PENDING'}). O passano tutte o
                  nessuna. Puoi lasciare la pagina: riceverai comunque l’esito (successo o errore)
                  via email.
                </p>
              )}

              {importError && (
                <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {importError}
                </p>
              )}

              {tooManyRows && (
                <p className="text-sm text-destructive">
                  Massimo {MAX_BULK_ITEMS} domande per import (attuali: {rows.length}). Dividi il
                  CSV in più file.
                </p>
              )}

              {(errorCount > 0 || missingReviewerCount > 0) && (
                <p className="text-sm text-muted-foreground">
                  Per procedere: risolvi le righe con errori e assegna un revisore a ogni domanda.
                </p>
              )}

              <QuestionsImportPreviewTable
                rows={rows}
                reviewerOptions={reviewerOptions}
                reviewersLoading={reviewersLoading}
                subjectNames={subjectNames}
                topicNames={topicNames}
                failedRowNumber={failedIndex != null ? failedIndex + 1 : undefined}
                onAssignReviewer={handleAssignReviewer}
                onPreview={setPreviewRow}
              />
            </>
          )}
        </div>

        <QuestionsImportPreviewDialog
          row={previewRow}
          materiaName={previewRow ? subjectNames.get(previewRow.subjectId) : undefined}
          argomentoName={previewRow ? topicNames.get(previewRow.topicId) : undefined}
          onClose={() => setPreviewRow(null)}
        />
      </div>
    </div>
  );
}
