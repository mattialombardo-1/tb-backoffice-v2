import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApiClient } from '@/lib/api/useApiClient';
import { collectionsService } from '@/lib/services/collections';
import type { Collection } from '@/lib/types/collections';

interface CollectionDuplicateDialogProps {
  collection: Collection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDuplicated: () => void;
}

export function CollectionDuplicateDialog({
  collection,
  open,
  onOpenChange,
  onDuplicated,
}: CollectionDuplicateDialogProps) {
  const client = useApiClient();
  const [name, setName] = useState('');
  const [duplicating, setDuplicating] = useState(false);

  // Pre-fill the name with a "(copia)" suffix whenever a new collection is targeted.
  useEffect(() => {
    if (collection) {
      setName(`${collection.name} (copia)`);
    }
  }, [collection]);

  const canDuplicate = name.trim().length > 0 && name.trim() !== collection?.name;

  const handleDuplicate = async () => {
    if (!collection || !canDuplicate || duplicating) return;
    setDuplicating(true);
    try {
      await collectionsService.duplicate(client, collection.id, name.trim());
      toast.success('Collezione duplicata');
      onDuplicated();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Impossibile duplicare la collezione');
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !duplicating && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplica collezione</DialogTitle>
          <DialogDescription>
            Verrà creata una copia identica di «{collection?.name}». Scegli un nome per la nuova
            collezione.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="duplicate-name">
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="duplicate-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDuplicate()}
            autoFocus
            disabled={duplicating}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={duplicating}>
            Annulla
          </Button>
          <Button onClick={handleDuplicate} disabled={!canDuplicate || duplicating}>
            {duplicating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Duplica
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
