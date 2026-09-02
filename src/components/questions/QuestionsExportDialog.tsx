import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { generateDocx } from '@/lib/export/generateDocx';
import { generatePdf } from '@/lib/export/generatePdf';
import { generateQuestionsCsv } from '@/lib/export/generateQuestionsCsv';
import { generateQuestionsXlsx } from '@/lib/export/generateQuestionsXlsx';
import { resolveImageUrls, resolveQuestionListImageUrls } from '@/lib/export/resolveImageUrls';
import type { QuestionListItem } from '@/lib/types/questions';
import {
  DEFAULT_HEADER_COLOR,
  type AnswerIndexStyle,
  type ExportCollection,
  type ExportMode,
} from '@/lib/types/export';

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

type QuestionsExportFormat = 'docx' | 'pdf' | 'csv' | 'xlsx';

interface QuestionsExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selected question ids, in the order they should appear in the export. */
  questionIds: string[];
  /** Number of selected questions — shown in the title. */
  count: number;
}

export function QuestionsExportDialog({
  open,
  onOpenChange,
  questionIds,
  count,
}: QuestionsExportDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const [format, setFormat] = useState<QuestionsExportFormat>('docx');
  const [exportMode, setExportMode] = useState<ExportMode>('without-explanation');
  const [headerColor, setHeaderColor] = useState(DEFAULT_HEADER_COLOR);
  const [headerColorText, setHeaderColorText] = useState(DEFAULT_HEADER_COLOR);
  const [splitBySubject, setSplitBySubject] = useState(false);
  const [splitByTopic, setSplitByTopic] = useState(false);
  const [answerIndex, setAnswerIndex] = useState<AnswerIndexStyle>('letter');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    success: number;
    failed: number;
    total: number;
  } | null>(null);

  const isSpreadsheet = format === 'csv' || format === 'xlsx';
  const progressPct =
    progress && progress.total > 0 ? Math.round((progress.success / progress.total) * 100) : 0;

  const handleHeaderColorText = (value: string) => {
    setHeaderColorText(value);
    if (HEX_COLOR_RE.test(value)) setHeaderColor(value);
  };

  const handleHeaderColorSwatch = (value: string) => {
    setHeaderColor(value);
    setHeaderColorText(value);
  };

  const handleExport = async () => {
    if (questionIds.length === 0) return;
    setLoading(true);
    setProgress({ success: 0, failed: 0, total: questionIds.length });
    try {
      const { items, missingIds, associationsById } = await questionsService.getExportData(
        client,
        questionIds,
        (success, failed, total) => setProgress({ success, failed, total })
      );

      if (missingIds.length > 0) {
        // Logged so a tester can verify which ids failed (vs. a silent count).
        console.warn(`[export] ${missingIds.length} question(s) skipped:`, missingIds);
        toast.warning(t('questions.toasts.exportMissing', { count: missingIds.length }));
      }

      if (items.length === 0) {
        toast.error(t('questions.exportDialog.empty'));
        return;
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const baseName = `domande-export-${timestamp}`;

      if (isSpreadsheet) {
        // Swap stored S3 keys for presigned view URLs so image columns are
        // fetchable links (valid for 12h — see resolveQuestionListImageUrls).
        const urlMap = await resolveQuestionListImageUrls(client, items);
        const resolveImageUrl = (u: string) => urlMap.get(u) ?? u;
        if (format === 'csv') {
          const csv = generateQuestionsCsv(items, { associationsById, resolveImageUrl });
          download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `${baseName}.csv`);
        } else {
          const blob = await generateQuestionsXlsx(items, { associationsById, resolveImageUrl });
          download(blob, `${baseName}.xlsx`);
        }
      } else {
        const collection = toExportCollection(items);
        // Swap plain S3 keys for presigned view URLs so the generators can fetch images.
        await resolveImageUrls(client, [collection]);
        const opts = { mode: exportMode, headerColor, splitBySubject, splitByTopic, answerIndex };
        if (format === 'docx') {
          const blob = await generateDocx([collection], opts);
          download(blob, `${baseName}.docx`);
        } else {
          const blob = await generatePdf([collection], opts);
          download(blob, `${baseName}.pdf`);
        }
      }

      toast.success(t('questions.toasts.exportSuccess', { count: items.length }));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('questions.toasts.exportError'));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (loading) return;
    if (!v) setProgress(null);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            {t('questions.exportDialog.title')} ({count})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">{t('questions.exportDialog.format')}</p>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as QuestionsExportFormat)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="q-fmt-docx" />
                <Label htmlFor="q-fmt-docx">DOCX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="q-fmt-pdf" />
                <Label htmlFor="q-fmt-pdf">PDF</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="q-fmt-csv" />
                <Label htmlFor="q-fmt-csv">CSV</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="q-fmt-xlsx" />
                <Label htmlFor="q-fmt-xlsx">XLSX</Label>
              </div>
            </RadioGroup>
          </div>

          {!isSpreadsheet && (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium">{t('questions.exportDialog.content')}</p>
                <RadioGroup
                  value={exportMode}
                  onValueChange={(v) => setExportMode(v as ExportMode)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="without-explanation" id="q-mode-no-exp" />
                    <Label htmlFor="q-mode-no-exp">
                      {t('questions.exportDialog.contentQuestions')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="with-explanation" id="q-mode-exp" />
                    <Label htmlFor="q-mode-exp">
                      {t('questions.exportDialog.contentExplanations')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">{t('questions.exportDialog.headerColor')}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={headerColor}
                    onChange={(e) => handleHeaderColorSwatch(e.target.value)}
                    aria-label={t('questions.exportDialog.headerColor')}
                    className="h-10 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-background p-0.5"
                  />
                  <Input
                    value={headerColorText}
                    onChange={(e) => handleHeaderColorText(e.target.value)}
                    placeholder={DEFAULT_HEADER_COLOR}
                    maxLength={7}
                    className="w-28 font-mono uppercase rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">{t('questions.exportDialog.answerIndex')}</p>
                <RadioGroup
                  value={answerIndex}
                  onValueChange={(v) => setAnswerIndex(v as AnswerIndexStyle)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="numeric" id="q-idx-numeric" />
                    <Label htmlFor="q-idx-numeric">
                      {t('questions.exportDialog.answerIndexNumeric')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="letter" id="q-idx-letter" />
                    <Label htmlFor="q-idx-letter">
                      {t('questions.exportDialog.answerIndexLetter')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="q-idx-none" />
                    <Label htmlFor="q-idx-none">
                      {t('questions.exportDialog.answerIndexNone')}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="q-split-by-subject"
                    checked={splitBySubject}
                    onCheckedChange={(checked) => setSplitBySubject(checked === true)}
                  />
                  <Label htmlFor="q-split-by-subject">
                    {t('questions.exportDialog.splitBySubject')}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="q-split-by-topic"
                    checked={splitByTopic}
                    onCheckedChange={(checked) => setSplitByTopic(checked === true)}
                  />
                  <Label htmlFor="q-split-by-topic">
                    {t('questions.exportDialog.splitByTopic')}
                  </Label>
                </div>
              </div>
            </>
          )}
        </div>

        {progress && (
          <div className="space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-[width] duration-200 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {t('questions.exportDialog.progress', {
                  done: progress.success,
                  total: progress.total,
                })}
              </span>
              {progress.failed > 0 && (
                <span className="font-medium text-destructive">
                  {t('questions.exportDialog.progressFailed', { count: progress.failed })}
                </span>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={loading || count === 0}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('questions.exportDialog.generating')}
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                {t('questions.exportDialog.export')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Wraps the selected questions into a single synthetic collection/section so the
 *  shared DOCX/PDF generators (which consume `ExportCollection[]`) can be reused. */
function toExportCollection(items: QuestionListItem[]): ExportCollection {
  return {
    _id: 'questions-export',
    name: 'Domande esportate',
    type: 'QUESTIONS',
    status: 'ACTIVE',
    sections: [
      {
        questions: items.map((q) => ({
          questionId: q.id,
          type: q.type,
          subjectName: q.materiaName || q.subjectName || null,
          topicName: q.argomentoName || q.topicName || null,
          questionText: q.questionText,
          explanationText: q.explanationText ?? '',
          alternatives: [...q.alternatives]
            .sort((a, b) => a.order - b.order)
            .map((a) => ({ text: a.text, image: a.image, correct: a.isCorrect })),
          questionImages: q.questionImages ?? [],
          explanationImages: q.explanationImages ?? [],
        })),
      },
    ],
  };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
