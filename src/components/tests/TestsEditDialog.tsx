import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApiClient } from '@/lib/api/useApiClient';
import { testsService } from '@/lib/services/tests';
import type { Test, UpdateTestPayload } from '@/lib/types/tests';

interface Brand {
  _id: string;
  name: string;
}

interface DefaultScores {
  correct: string;
  empty: string;
  wrong: string;
}

interface TestsEditDialogProps {
  test: Test | null;
  onSuccess: (updated: Test) => void;
  onCancel: () => void;
}

export function TestsEditDialog({ test, onSuccess, onCancel }: TestsEditDialogProps) {
  const client = useApiClient();

  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: () => client.get<Brand[]>('/brands'),
    staleTime: 5 * 60_000,
  });
  const brands: Brand[] = brandsQuery.data ?? [];

  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [scores, setScores] = useState<DefaultScores>({ correct: '', empty: '', wrong: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync form when target test changes
  useEffect(() => {
    if (!test) return;
    setName(test.name);
    setYear(test.year != null ? String(test.year) : '');
    setSelectedBrandIds(test.brands.map((b) => b.id));
    setScores({
      correct: String(test.defaultScores.correct),
      empty: String(test.defaultScores.empty),
      wrong: String(test.defaultScores.wrong),
    });
    setIsSubmitting(false);
  }, [test]);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmitting) onCancel();
  };

  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const scoresValid =
    scores.correct !== '' &&
    scores.empty !== '' &&
    scores.wrong !== '' &&
    !isNaN(Number(scores.correct)) &&
    !isNaN(Number(scores.empty)) &&
    !isNaN(Number(scores.wrong));

  const canSubmit =
    !isSubmitting && name.trim().length > 0 && selectedBrandIds.length > 0 && scoresValid;

  const handleSubmit = async () => {
    if (!test || !canSubmit) return;
    setIsSubmitting(true);

    const payload: UpdateTestPayload = {
      name: name.trim(),
      ...(year.trim() ? { year: parseInt(year.trim(), 10) } : {}),
      brands: selectedBrandIds.map((id) => {
        const brand = brands.find((b) => b._id === id)!;
        return { id, name: brand.name };
      }),
      defaultScores: {
        correct: Number(scores.correct),
        empty: Number(scores.empty),
        wrong: Number(scores.wrong),
      },
    };

    try {
      const updated = await testsService.update(client, test.id, payload);
      toast.success(`Test "${updated.name}" aggiornato`);
      onSuccess(updated);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Errore durante l'aggiornamento";
      toast.error(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={!!test} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg flex flex-col">
        <DialogHeader>
          <DialogTitle>Modifica test</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* ── Basic info ── */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label>
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Anno</Label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-28"
              />
            </div>
          </div>

          {/* ── Brands ── */}
          <div className="space-y-2">
            <Label>
              Brand <span className="text-destructive">*</span>
            </Label>
            {brandsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Caricamento brand…</p>
            ) : brands.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun brand disponibile</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {brands.map((b) => (
                  <label key={b._id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedBrandIds.includes(b._id)}
                      onCheckedChange={() => toggleBrand(b._id)}
                    />
                    <span className="text-sm">{b.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* ── Default scores ── */}
          <div className="space-y-2">
            <Label>
              Punteggi default <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Corretta</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={scores.correct}
                  onChange={(e) => setScores((s) => ({ ...s, correct: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vuota</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={scores.empty}
                  onChange={(e) => setScores((s) => ({ ...s, empty: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sbagliata</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={scores.wrong}
                  onChange={(e) => setScores((s) => ({ ...s, wrong: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? 'Salvataggio…' : 'Salva'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
