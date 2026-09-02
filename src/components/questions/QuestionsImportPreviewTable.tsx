import { AlertTriangle, Eye, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SearchableCombobox, type ComboboxOption } from '@/components/ui/searchable-combobox';
import { cn } from '@/lib/utils';
import { DIFFICULTY_LABELS } from '@/lib/types/questions';
import type { DifficultyLevel } from '@/lib/types/questions';
import type { ParsedQuestionRow } from '@/lib/types/questionsImport';
import { RichQuestionText } from './RichQuestionText';

const DIFFICULTY_CLASS: Record<DifficultyLevel, string> = {
  facile:
    'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  medio_facile:
    'border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  medio:
    'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  medio_difficile:
    'border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
  difficile:
    'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300',
  non_ancora_valutata: '',
};

interface QuestionsImportPreviewTableProps {
  rows: ParsedQuestionRow[];
  reviewerOptions: ComboboxOption[];
  reviewersLoading: boolean;
  subjectNames: Map<string, string>;
  topicNames: Map<string, string>;
  /** Row number (1-based) that made the import job fail, to highlight it. */
  failedRowNumber?: number;
  onAssignReviewer: (rowNumber: number, reviewerId: string | null) => void;
  onPreview: (row: ParsedQuestionRow) => void;
}

export function QuestionsImportPreviewTable({
  rows,
  reviewerOptions,
  reviewersLoading,
  subjectNames,
  topicNames,
  failedRowNumber,
  onAssignReviewer,
  onPreview,
}: QuestionsImportPreviewTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-24">Tipo</TableHead>
            <TableHead>Testo</TableHead>
            <TableHead className="w-36">Difficoltà</TableHead>
            <TableHead className="w-40">Materia</TableHead>
            <TableHead className="w-40">Argomento</TableHead>
            <TableHead className="w-64">Revisore</TableHead>
            <TableHead className="w-20 text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const hasError = row.rowErrors.length > 0;
            const isFailed = failedRowNumber === row.rowNumber;
            return (
              <TableRow
                key={row.rowNumber}
                className={cn(
                  hasError && 'bg-destructive/5 hover:bg-destructive/10',
                  isFailed && 'bg-destructive/10 ring-1 ring-inset ring-destructive/40'
                )}
              >
                <TableCell className="text-sm text-muted-foreground align-top">
                  <div className="flex items-center gap-1.5">
                    {row.rowNumber}
                    {hasError && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <ul className="list-disc pl-4 text-xs">
                              {row.rowErrors.map((e, i) => (
                                <li key={i}>{e}</li>
                              ))}
                            </ul>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top">
                  {row.isUpdate ? (
                    <Badge variant="secondary" className="whitespace-nowrap">
                      Aggiorna
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="whitespace-nowrap">
                      Nuova
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="align-top max-w-sm">
                  <RichQuestionText
                    html={row.questionText || '—'}
                    className="text-sm line-clamp-2"
                  />
                  {(() => {
                    const imageCount =
                      row.questionImages.length +
                      row.explanationImages.length +
                      row.alternatives.filter((a) => a.image).length;
                    return imageCount > 0 ? (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        {imageCount} immagini
                      </span>
                    ) : null;
                  })()}
                </TableCell>
                <TableCell className="align-top">
                  <Badge
                    variant="outline"
                    className={cn('whitespace-nowrap', DIFFICULTY_CLASS[row.difficulty])}
                  >
                    {DIFFICULTY_LABELS[row.difficulty]}
                  </Badge>
                </TableCell>
                <TableCell className="align-top text-sm">
                  {subjectNames.get(row.subjectId) ?? (
                    <span className="text-muted-foreground font-mono text-xs">
                      {row.subjectId || '—'}
                    </span>
                  )}
                </TableCell>
                <TableCell className="align-top text-sm">
                  {topicNames.get(row.topicId) ?? (
                    <span className="text-muted-foreground font-mono text-xs">
                      {row.topicId || '—'}
                    </span>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  <SearchableCombobox
                    value={row.reviewerId}
                    onChange={(v) => onAssignReviewer(row.rowNumber, v)}
                    options={reviewerOptions}
                    disabled={reviewersLoading}
                    placeholder={reviewersLoading ? 'Caricamento…' : 'Assegna revisore'}
                    searchPlaceholder="Cerca revisore…"
                    emptyMessage="Nessun revisore."
                  />
                </TableCell>
                <TableCell className="align-top text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPreview(row)}
                    aria-label="Anteprima domanda"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
