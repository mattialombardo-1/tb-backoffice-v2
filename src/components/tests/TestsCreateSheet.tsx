import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, ChevronRight, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/campaigns/SearchableSelect';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { testsService } from '@/lib/services/tests';
import { queryKeys } from '@/lib/query';
import type { CreateTestPayload, TestSyllabusItem } from '@/lib/types/tests';

interface Brand {
  _id: string;
  name: string;
}

interface SyllabusEntryDraft {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  subtopicId: string;
  subtopicName: string;
}

const EMPTY_DRAFT: SyllabusEntryDraft = {
  subjectId: '',
  subjectName: '',
  topicId: '',
  topicName: '',
  subtopicId: '',
  subtopicName: '',
};

interface TestsCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function TestsCreateSheet({ open, onOpenChange, onSuccess }: TestsCreateSheetProps) {
  const client = useApiClient();

  // ── Form state (declared first so queries can reference draft) ────────────
  const [name, setName] = useState('');
  const [year, setYear] = useState('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<string[]>([]);
  const [scores, setScores] = useState({ correct: '', empty: '', wrong: '' });
  const [syllabus, setSyllabus] = useState<TestSyllabusItem[]>([]);
  const [draft, setDraft] = useState<SyllabusEntryDraft>(EMPTY_DRAFT);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Brand query ──────────────────────────────────────────────────────────
  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: ({ signal }) => client.get<Brand[]>('/brands', { signal }),
    enabled: open,
    staleTime: 5 * 60_000,
  });
  const brands: Brand[] = brandsQuery.data ?? [];

  // ── Hierarchy queries ─────────────────────────────────────────────────────
  const materieQuery = useQuery({
    queryKey: queryKeys.questions.materie,
    queryFn: ({ signal }) => questionsService.getMaterie(client, signal),
    enabled: open,
    staleTime: 5 * 60_000,
  });
  const materie = materieQuery.data ?? [];

  const argomentiQuery = useQuery({
    queryKey: queryKeys.questions.argomenti(draft.subjectId || '__none__'),
    queryFn: ({ signal }) => questionsService.getArgomenti(client, draft.subjectId, signal),
    enabled: open && !!draft.subjectId,
    staleTime: 5 * 60_000,
  });
  const argomenti = argomentiQuery.data ?? [];

  const sottoArgomentiQuery = useQuery({
    queryKey: queryKeys.questions.sottoArgomenti(draft.subjectId || '__none__', draft.topicId || '__none__'),
    queryFn: ({ signal }) =>
      questionsService.getSottoArgomenti(client, draft.subjectId, draft.topicId, signal),
    enabled: open && !!draft.subjectId && !!draft.topicId,
    staleTime: 5 * 60_000,
  });
  const sottoArgomenti = sottoArgomentiQuery.data ?? [];

  const reset = () => {
    setName('');
    setYear('');
    setSelectedBrandIds([]);
    setScores({ correct: '', empty: '', wrong: '' });
    setSyllabus([]);
    setDraft(EMPTY_DRAFT);
    setIsSubmitting(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !isSubmitting) reset();
    onOpenChange(next);
  };

  // ── Brand toggle ──────────────────────────────────────────────────────────
  const toggleBrand = (id: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  // ── Syllabus draft helpers ────────────────────────────────────────────────
  const setDraftSubject = (id: string) => {
    const found = materie.find((m) => m.id === id);
    setDraft({ subjectId: id, subjectName: found?.name ?? '', topicId: '', topicName: '', subtopicId: '', subtopicName: '' });
  };

  const setDraftTopic = (id: string) => {
    const found = argomenti.find((a) => a.id === id);
    setDraft((prev) => ({ ...prev, topicId: id, topicName: found?.name ?? '', subtopicId: '', subtopicName: '' }));
  };

  const setDraftSubtopic = (id: string) => {
    const found = sottoArgomenti.find((s) => s.id === id);
    setDraft((prev) => ({ ...prev, subtopicId: id, subtopicName: found?.name ?? '' }));
  };

  const canAddEntry = !!draft.subjectId && !!draft.topicId;

  const addEntry = () => {
    if (!canAddEntry) return;
    const entry: TestSyllabusItem = {
      baseSubject: draft.subjectId,
      baseTopic: draft.topicId,
      ...(draft.subtopicId ? { baseSubtopic: draft.subtopicId } : {}),
      displaySubject: draft.subjectName,
      displayTopic: draft.topicName,
      ...(draft.subtopicName ? { displaySubtopic: draft.subtopicName } : {}),
    };
    setSyllabus((prev) => [...prev, entry]);
    setDraft(EMPTY_DRAFT);
  };

  const removeEntry = (index: number) => {
    setSyllabus((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const scoresValid =
    scores.correct !== '' &&
    scores.empty !== '' &&
    scores.wrong !== '' &&
    !isNaN(Number(scores.correct)) &&
    !isNaN(Number(scores.empty)) &&
    !isNaN(Number(scores.wrong));

  const canSubmit =
    !isSubmitting &&
    name.trim().length > 0 &&
    selectedBrandIds.length > 0 &&
    scoresValid;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);

    const payload: CreateTestPayload = {
      name: name.trim(),
      ...(year.trim() ? { year: parseInt(year.trim(), 10) } : {}),
      brands: selectedBrandIds.map((id) => {
        const brand = brands.find((b) => b._id === id)!;
        return { id, name: brand.name };
      }),
      syllabus,
      defaultScores: {
        correct: Number(scores.correct),
        empty: Number(scores.empty),
        wrong: Number(scores.wrong),
      },
    };

    try {
      await testsService.create(client, payload);
      toast.success(`Test "${payload.name}" creato con successo`);
      onSuccess();
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Errore durante la creazione');
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl flex flex-col p-0">
        <SheetHeader className="border-b px-6 py-4 shrink-0">
          <SheetTitle>Crea nuovo test</SheetTitle>
          <SheetDescription>
            Compila tutti i campi obbligatori e aggiungi almeno una voce al syllabus.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* ── Info base ── */}
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="test-name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input
                id="test-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Es. Medicina 2025"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="test-year">Anno</Label>
              <Input
                id="test-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Es. 2025"
                className="w-28"
              />
            </div>
          </div>

          <Separator />

          {/* ── Brand ── */}
          <div className="space-y-2">
            <Label>
              Brand <span className="text-destructive">*</span>
            </Label>
            {brandsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Caricamento brand…</p>
            ) : brands.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nessun brand disponibile</p>
            ) : (
              <div className="space-y-2 rounded-md border px-3 py-2 max-h-40 overflow-y-auto">
                {brands.map((b) => (
                  <div key={b._id} className="flex items-center gap-2">
                    <Checkbox
                      id={`brand-${b._id}`}
                      checked={selectedBrandIds.includes(b._id)}
                      onCheckedChange={() => toggleBrand(b._id)}
                      disabled={isSubmitting}
                    />
                    <label htmlFor={`brand-${b._id}`} className="text-sm cursor-pointer select-none">
                      {b.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* ── Punteggi default ── */}
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
                  placeholder="Es. 1"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vuota</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={scores.empty}
                  onChange={(e) => setScores((s) => ({ ...s, empty: e.target.value }))}
                  placeholder="Es. 0"
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sbagliata</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={scores.wrong}
                  onChange={(e) => setScores((s) => ({ ...s, wrong: e.target.value }))}
                  placeholder="Es. -0.25"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* ── Syllabus ── */}
          <div className="space-y-3">
            <div>
              <Label>
                Syllabus
              </Label>
            </div>

            {/* Entry list */}
            {syllabus.length > 0 && (
              <div className="space-y-1.5">
                {syllabus.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-1 flex-wrap min-w-0">
                      <Badge variant="secondary" className="text-xs font-normal shrink-0">
                        {entry.displaySubject}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                      <Badge variant="secondary" className="text-xs font-normal shrink-0">
                        {entry.displayTopic}
                      </Badge>
                      {entry.displaySubtopic && (
                        <>
                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                          <Badge variant="secondary" className="text-xs font-normal shrink-0">
                            {entry.displaySubtopic}
                          </Badge>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(i)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add entry form */}
            <div className="rounded-md border p-3 space-y-3 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground">Aggiungi voce</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {/* Materia */}
                <div className="space-y-1">
                  <Label className="text-xs">Materia</Label>
                  {materieQuery.isLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <SearchableSelect
                      value={draft.subjectId}
                      onValueChange={setDraftSubject}
                      options={materie.map((m) => ({ value: m.id, label: m.name }))}
                      placeholder="Seleziona materia"
                      searchPlaceholder="Cerca materia…"
                      disabled={isSubmitting}
                    />
                  )}
                </div>

                {/* Argomento */}
                <div className="space-y-1">
                  <Label className="text-xs">Argomento</Label>
                  {argomentiQuery.isLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <SearchableSelect
                      value={draft.topicId}
                      onValueChange={setDraftTopic}
                      options={argomenti.map((a) => ({ value: a.id, label: a.name }))}
                      placeholder={draft.subjectId ? 'Seleziona argomento' : 'Prima seleziona materia'}
                      searchPlaceholder="Cerca argomento…"
                      disabled={!draft.subjectId || isSubmitting}
                    />
                  )}
                </div>

                {/* Sotto-argomento */}
                <div className="space-y-1">
                  <Label className="text-xs">Sotto-argomento</Label>
                  {sottoArgomentiQuery.isLoading ? (
                    <Skeleton className="h-9 w-full" />
                  ) : (
                    <SearchableSelect
                      value={draft.subtopicId}
                      onValueChange={setDraftSubtopic}
                      options={sottoArgomenti.map((s) => ({ value: s.id, label: s.name }))}
                      placeholder={
                        !draft.topicId
                          ? 'Prima seleziona argomento'
                          : sottoArgomenti.length === 0
                          ? 'Nessuno disponibile'
                          : 'Opzionale'
                      }
                      searchPlaceholder="Cerca sotto-argomento…"
                      disabled={!draft.topicId || sottoArgomenti.length === 0 || isSubmitting}
                    />
                  )}
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={addEntry}
                disabled={!canAddEntry || isSubmitting}
                className="w-full"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Aggiungi voce
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t px-6 py-4 flex justify-end gap-2 shrink-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Annulla
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? <Loader className='animate-spin' /> : 'Crea test'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
