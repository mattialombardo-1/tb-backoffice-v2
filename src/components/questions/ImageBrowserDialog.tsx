import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionImagesService, type QuestionImage, type QuestionImageEntry } from '@/lib/services/questionImages';
import { cn } from '@/lib/utils';

interface ImageBrowserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (entry: QuestionImageEntry) => void;
}

export function ImageBrowserDialog({ open, onOpenChange, onSelect }: ImageBrowserDialogProps) {
  const client = useApiClient();
  const [images, setImages] = useState<QuestionImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setError(null);
    const controller = new AbortController();
    questionImagesService
      .listImages(client, controller.signal)
      .then((imgs) => {
        setImages(imgs);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setError('Impossibile caricare le immagini');
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [client, open, refreshTick]);

  const filtered = images
    .filter((img) => img.key.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const ta = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const tb = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return tb - ta;
    });

  const handleConfirm = () => {
    if (!selectedKey) return;
    const img = filtered.find((i) => i.key === selectedKey);
    if (!img) return;
    onSelect({ storageUrl: img.imageUrl ?? img.url.split('?')[0], viewUrl: img.url });
    onOpenChange(false);
    setSelectedKey(null);
    setSearch('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>Sfoglia immagini</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Cerca per nome file..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRefreshTick((t) => t + 1)}
            disabled={isLoading}
            title="Aggiorna lista"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <p className="py-4 text-center text-sm text-destructive">{error}</p>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">Nessuna immagine trovata</p>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="grid max-h-[480px] grid-cols-4 gap-2 overflow-y-auto pr-1">
            {filtered.map((img) => (
              <div key={img.key} className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className={cn(
                    'group relative overflow-hidden rounded-lg border-2 transition-all',
                    selectedKey === img.key
                      ? 'border-primary'
                      : 'border-transparent hover:border-primary/50'
                  )}
                  style={{ paddingBottom: '100%', height: 0 }}
                  onClick={() => setSelectedKey(img.key === selectedKey ? null : img.key)}
                >
                  <img
                    src={img.url}
                    alt={img.key}
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </button>
                <p className="truncate text-[10px] font-mono text-muted-foreground leading-tight px-0.5">
                  {img.key.split('/').pop()}
                </p>
                {img.lastModified && (
                  <p className="text-[9px] text-muted-foreground leading-none px-0.5">
                    {new Date(img.lastModified).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => { onOpenChange(false); setSelectedKey(null); }}>
            Annulla
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedKey}>
            Usa immagine
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
