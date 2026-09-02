import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Collection } from '@/lib/types/collections';

interface CollectionArchiveDialogProps {
  collection: Collection | null;
  /** Current state of the target: archived rows trigger a restore, active rows an archive. */
  archived: boolean;
  isLoading: boolean;
  onConfirm: (collection: Collection) => void;
  onCancel: () => void;
}

export function CollectionArchiveDialog({
  collection,
  archived,
  isLoading,
  onConfirm,
  onCancel,
}: CollectionArchiveDialogProps) {
  return (
    <Dialog
      open={!!collection}
      onOpenChange={(open) => {
        if (!open && !isLoading) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{archived ? 'Ripristina collezione' : 'Archivia collezione'}</DialogTitle>
          <DialogDescription>
            {archived
              ? `Stai per ripristinare «${collection?.name}». Tornerà tra le collezioni attive.`
              : `Stai per archiviare «${collection?.name}». Non sarà più attiva, ma potrà essere ripristinata in seguito.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Annulla
          </Button>
          <Button
            variant={archived ? 'default' : 'destructive'}
            onClick={() => collection && onConfirm(collection)}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {archived ? 'Ripristina' : 'Archivia'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
