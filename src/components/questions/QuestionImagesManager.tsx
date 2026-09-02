import { useRef, useState } from 'react';
import { Loader2, Trash2, FolderOpen, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionImagesService, type QuestionImageEntry } from '@/lib/services/questionImages';
import { ImageBrowserDialog } from './ImageBrowserDialog';
import { cn } from '@/lib/utils';

interface QuestionImagesManagerProps {
  entries: QuestionImageEntry[];
  onAddImage: (entry: QuestionImageEntry) => void;
  onRemoveImage: (index: number) => void;
  disabled?: boolean;
  label?: string;
}

export function QuestionImagesManager({
  entries,
  onAddImage,
  onRemoveImage,
  disabled = false,
  label = 'Immagini della domanda',
}: QuestionImagesManagerProps) {
  const client = useApiClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [browserOpen, setBrowserOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsUploading(true);
    setUploadError(null);
    try {
      const entry = await questionImagesService.uploadImage(client, file);
      onAddImage(entry);
    } catch {
      setUploadError('Errore durante il caricamento');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nessuna immagine aggiunta. Le immagini caricate saranno richiamabili con{' '}
          <span className="font-mono">&&image1&&</span>, <span className="font-mono">&&image2&&</span>…
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((entry, idx) => (
            <div
              key={`${entry.storageUrl}-${idx}`}
              className={cn(
                'flex items-center gap-3 rounded-lg border bg-card p-2',
                disabled && 'opacity-60'
              )}
            >
              <img
                src={entry.viewUrl}
                alt={`image${idx + 1}`}
                className="h-12 w-12 shrink-0 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).parentElement?.classList.add('opacity-50');
                }}
              />
              <div className="flex-1 min-w-0">
                <span className="font-mono text-sm font-semibold">&&image{idx + 1}&&</span>
                <p className="truncate text-xs text-muted-foreground">
                  {entry.storageUrl.split('/').pop()}
                </p>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-muted-foreground/40 hover:text-destructive"
                  onClick={() => onRemoveImage(idx)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {uploadError && (
        <p className="text-xs text-destructive">{uploadError}</p>
      )}

      {!disabled && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-4 w-4" />
            )}
            Carica immagine
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isUploading}
            onClick={() => setBrowserOpen(true)}
          >
            <FolderOpen className="mr-1.5 h-4 w-4" />
            Sfoglia immagini
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      <ImageBrowserDialog
        open={browserOpen}
        onOpenChange={setBrowserOpen}
        onSelect={(entry) => {
          onAddImage(entry);
          setBrowserOpen(false);
        }}
      />
    </div>
  );
}
