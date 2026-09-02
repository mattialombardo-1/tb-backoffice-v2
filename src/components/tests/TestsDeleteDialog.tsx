import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Test } from '@/lib/types/tests';

interface TestsDeleteDialogProps {
  test: Test | null;
  onConfirm: (test: Test) => Promise<void>;
  onCancel: () => void;
}

export function TestsDeleteDialog({ test, onConfirm, onCancel }: TestsDeleteDialogProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onCancel();
  };

  return (
    <Dialog open={!!test} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina test</DialogTitle>
          <DialogDescription>
            Stai per eliminare <b>{test?.name}</b>
            {test?.year ? ` (${test.year})` : ''}. Questa operazione è irreversibile e non è
            possibile se il test è associato a delle collections.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button variant="destructive" onClick={() => test && onConfirm(test)}>
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
