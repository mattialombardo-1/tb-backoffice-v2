import { useState } from 'react';
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
import { exportService } from '@/lib/services/export';
import { generateDocx } from '@/lib/export/generateDocx';
import { generatePdf } from '@/lib/export/generatePdf';
import { resolveImageUrls } from '@/lib/export/resolveImageUrls';
import type { CollectionFilters } from '@/lib/types/collections';
import {
  DEFAULT_HEADER_COLOR,
  type ExportCollection,
  type ExportFormat,
  type ExportMode,
} from '@/lib/types/export';

const HEX_COLOR_RE = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

interface CollectionExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass filters for bulk list export, or collectionId for single export. */
  mode: 'single' | 'bulk';
  collectionId?: string;
  filters?: Omit<CollectionFilters, 'page'>;
  /** Explicit collection ids (e.g. checked rows in the list) — takes priority over `filters`. */
  collectionIds?: string[];
  /** Total collections to be exported — shown in the dialog. */
  count: number;
}

export function CollectionExportDialog({
  open,
  onOpenChange,
  mode,
  collectionId,
  filters,
  collectionIds,
  count,
}: CollectionExportDialogProps) {
  const client = useApiClient();
  const [format, setFormat] = useState<ExportFormat>('docx');
  const [exportMode, setExportMode] = useState<ExportMode>('without-explanation');
  const [headerColor, setHeaderColor] = useState(DEFAULT_HEADER_COLOR);
  const [headerColorText, setHeaderColorText] = useState(DEFAULT_HEADER_COLOR);
  const [splitBySubject, setSplitBySubject] = useState(false);
  const [separateFiles, setSeparateFiles] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleHeaderColorText = (value: string) => {
    setHeaderColorText(value);
    if (HEX_COLOR_RE.test(value)) setHeaderColor(value);
  };

  const handleHeaderColorSwatch = (value: string) => {
    setHeaderColor(value);
    setHeaderColorText(value);
  };

  const exportOne = async (collections: ExportCollection[], filename: string) => {
    const opts = { mode: exportMode, headerColor, splitBySubject };
    if (format === 'docx') {
      const blob = await generateDocx(collections, opts);
      download(
        blob,
        `${filename}.docx`,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    } else {
      const blob = await generatePdf(collections, opts);
      download(blob, `${filename}.pdf`, 'application/pdf');
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const data =
        mode === 'single' && collectionId
          ? await exportService.exportById(client, collectionId)
          : collectionIds && collectionIds.length > 0
            ? await exportService.exportByIds(client, collectionIds)
            : await exportService.exportByFilters(client, filters!);

      if (!data.collections.length) {
        toast.error("Nessuna collezione trovata per l'export");
        return;
      }

      // Replace plain S3 URLs with presigned view URLs so the generators
      // can actually fetch the images (plain S3 keys are not public).
      await resolveImageUrls(client, data.collections);

      if (separateFiles && data.collections.length > 1) {
        for (const col of data.collections) {
          await exportOne([col], sanitizeFilename(col.name));
        }
      } else {
        const filename =
          data.collections.length === 1
            ? sanitizeFilename(data.collections[0].name)
            : `export-collezioni-${new Date().toISOString().slice(0, 10)}`;
        await exportOne(data.collections, filename);
      }

      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore durante l'export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Esporta {count} {count === 1 ? 'collezione' : 'collezioni'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="space-y-3">
            <p className="text-sm font-medium">Formato</p>
            <RadioGroup
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="docx" id="fmt-docx" />
                <Label htmlFor="fmt-docx">DOCX</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="fmt-pdf" />
                <Label htmlFor="fmt-pdf">PDF</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Contenuto</p>
            <RadioGroup
              value={exportMode}
              onValueChange={(v) => setExportMode(v as ExportMode)}
              className="flex flex-col gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="without-explanation" id="mode-no-exp" />
                <Label htmlFor="mode-no-exp">Solo domande e alternative</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="with-explanation" id="mode-exp" />
                <Label htmlFor="mode-exp">
                  Solo correzioni commentate (senza domande e alternative)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">Colore intestazioni</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={headerColor}
                onChange={(e) => handleHeaderColorSwatch(e.target.value)}
                aria-label="Colore intestazioni"
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="split-by-subject"
              checked={splitBySubject}
              onCheckedChange={(checked) => setSplitBySubject(checked === true)}
            />
            <Label htmlFor="split-by-subject">Dividi per materia</Label>
          </div>

          {count > 1 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="separate-files"
                checked={separateFiles}
                onCheckedChange={(checked) => setSeparateFiles(checked === true)}
              />
              <Label htmlFor="separate-files">File separati</Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annulla
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generazione…
              </>
            ) : (
              <>
                <FileDown className="h-4 w-4 mr-2" />
                Esporta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '-').trim() || 'collezione';
}

function download(blob: Blob, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([blob], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
