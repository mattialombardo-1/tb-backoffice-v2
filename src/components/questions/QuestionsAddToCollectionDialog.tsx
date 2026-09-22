import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, Check, FolderPlus, Layers, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { useCan } from '@/lib/auth';
import { useCollectionsForFilter } from '@/lib/hooks/useCollectionsForFilter';
import { useCollectionSections } from '@/lib/hooks/useCollectionSections';
import { collectionsService, planQuestionsForSection } from '@/lib/services/collections';
import { queryKeys } from '@/lib/query';
import type { SectionPoints } from '@/lib/services/collections';

/** `NEW_SECTION` is the sentinel for "append a brand-new section" (a collection can have none). */
const NEW_SECTION = -1;

const DEFAULT_POINTS: SectionPoints = { correctPoint: 1, wrongPoint: 0, emptyPoint: 0 };

type Step = 1 | 2 | 3;

interface QuestionsAddToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Selected question ids, in the order they should be appended. */
  questionIds: string[];
  /** Called after a successful write so the caller can clear its selection. */
  onSuccess?: () => void;
}

export function QuestionsAddToCollectionDialog({
  open,
  onOpenChange,
  questionIds,
  onSuccess,
}: QuestionsAddToCollectionDialogProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(1);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [sectionIdx, setSectionIdx] = useState<number | null>(null);
  const [points, setPoints] = useState<SectionPoints>(DEFAULT_POINTS);
  const [submitting, setSubmitting] = useState(false);

  const collections = useCollectionsForFilter();
  const sections = useCollectionSections(open ? collectionId : null);
  // `POST /collections/:id/sections` is guarded by collections:CREATE on the backend,
  // while appending to an existing section only needs collections:UPDATE.
  const canCreateSection = useCan('collections', 'CREATE');

  // Every close funnels through here (footer buttons, Esc, overlay click, post-submit)
  // so a previous run's collection and scores never leak into the next one.
  const close = useCallback(() => {
    setStep(1);
    setCollectionId(null);
    setSectionIdx(null);
    setPoints(DEFAULT_POINTS);
    setSubmitting(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const collectionName =
    collections.options.find((o) => o.value === collectionId)?.label ?? collectionId ?? '';

  const selectedSection =
    sectionIdx !== null && sectionIdx !== NEW_SECTION
      ? sections.sections.find((s) => s.index === sectionIdx)
      : undefined;

  // A brand-new section takes every selected question except those already used by
  // another section of the same collection (the backend 409s on the whole request).
  const plan = useMemo(() => {
    if (sectionIdx === null) return null;
    return planQuestionsForSection(sections.sections, sectionIdx, questionIds);
  }, [sections.sections, sectionIdx, questionIds]);

  const handleSectionPick = (idx: number) => {
    setSectionIdx(idx);
    // Pre-fill with the section's own scores when they're uniform, so an import into an
    // existing section doesn't silently introduce a second scoring scheme.
    const uniform = sections.sections.find((s) => s.index === idx)?.uniformPoints;
    setPoints(uniform ?? DEFAULT_POINTS);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!collectionId || sectionIdx === null || !plan) return;
    setSubmitting(true);
    try {
      let addedIds = plan.toAdd;
      if (sectionIdx === NEW_SECTION) {
        await collectionsService.addSection(client, collectionId, {
          rules: { pausable: false },
          questions: plan.toAdd.map((questionId) => ({ questionId, points })),
        });
      } else {
        // Re-reads the collection server-side before merging, so the returned plan is
        // authoritative — it can differ from the preview if someone edited meanwhile.
        const applied = await collectionsService.addQuestionsToSection(
          client,
          collectionId,
          sectionIdx,
          questionIds,
          points
        );
        addedIds = applied.toAdd;
        if (addedIds.length === 0) {
          toast.warning(t('questions.addToCollection.nothingAdded'));
          close();
          return;
        }
      }

      queryClient.invalidateQueries({ queryKey: queryKeys.collections.all });
      // Each added question now belongs to one more collection — refresh its badge.
      addedIds.forEach((id) =>
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.associations(id) })
      );

      toast.success(
        t('questions.addToCollection.success', {
          count: addedIds.length,
          collection: collectionName,
        })
      );
      onSuccess?.();
      close();
    } catch (err) {
      setSubmitting(false);
      toast.error(err instanceof Error ? err.message : t('questions.addToCollection.error'), {
        action: { label: t('common.retry'), onClick: () => void handleSubmit() },
      });
    }
  };

  const handleOpenChange = (v: boolean) => {
    // Never yank the dialog away mid-write — the section PUT is a read-modify-write.
    if (submitting) return;
    if (!v) close();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderPlus className="h-5 w-5" />
            {t('questions.addToCollection.title')}
          </DialogTitle>
          <DialogDescription>
            {t('questions.addToCollection.subtitle', { count: questionIds.length })}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator step={step} />

        <div className="min-h-[220px] py-2">
          {step === 1 && (
            <div className="space-y-3">
              <Label>{t('questions.addToCollection.step1Label')}</Label>
              <SearchableCombobox
                value={collectionId}
                onChange={(v) => {
                  setCollectionId(v);
                  setSectionIdx(null);
                }}
                options={collections.options}
                placeholder={
                  collections.isLoading
                    ? t('common.loading')
                    : t('questions.addToCollection.selectCollection')
                }
                searchPlaceholder={t('questions.addToCollection.searchCollection')}
                disabled={collections.isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {t('questions.addToCollection.step1Hint')}
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <Label>{t('questions.addToCollection.step2Label')}</Label>

              {sections.isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : sections.error ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {t('questions.addToCollection.sectionsError')}
                  </span>
                  <Button variant="ghost" size="sm" onClick={sections.refetch}>
                    {t('common.retry')}
                  </Button>
                </div>
              ) : (
                <div className="max-h-[240px] space-y-2 overflow-y-auto pr-0.5">
                  {sections.sections.map((s) => {
                    const preview = planQuestionsForSection(
                      sections.sections,
                      s.index,
                      questionIds
                    );
                    return (
                      <button
                        key={s.index}
                        type="button"
                        onClick={() => handleSectionPick(s.index)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
                          sectionIdx === s.index && 'border-primary bg-primary/5'
                        )}
                      >
                        <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{s.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {t('questions.addToCollection.sectionQuestions', {
                              count: s.questionIds.length,
                            })}
                            {preview.toAdd.length !== questionIds.length && (
                              <>
                                {' · '}
                                {t('questions.addToCollection.sectionAddable', {
                                  count: preview.toAdd.length,
                                })}
                              </>
                            )}
                          </p>
                        </div>
                        {s.uniformPoints && (
                          <Badge variant="secondary" className="shrink-0 font-mono text-[10px]">
                            {s.uniformPoints.correctPoint} / {s.uniformPoints.wrongPoint} /{' '}
                            {s.uniformPoints.emptyPoint}
                          </Badge>
                        )}
                      </button>
                    );
                  })}

                  {sections.sections.length === 0 && !canCreateSection && (
                    <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                      {t('questions.addToCollection.noSections')}
                    </p>
                  )}

                  {/* Appending a section goes through POST …/sections, which the backend
                      guards with collections:CREATE rather than UPDATE. */}
                  {canCreateSection && (
                    <button
                      type="button"
                      onClick={() => handleSectionPick(NEW_SECTION)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
                        sectionIdx === NEW_SECTION && 'border-primary bg-primary/5'
                      )}
                    >
                      <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {t('questions.addToCollection.newSection')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t('questions.addToCollection.newSectionHint', {
                            index: sections.sections.length + 1,
                          })}
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && plan && (
            <div className="space-y-5">
              <div className="space-y-3">
                <Label>{t('questions.addToCollection.step3Label')}</Label>
                <div className="grid grid-cols-3 gap-3">
                  <PointField
                    id="atc-correct"
                    label={t('questions.addToCollection.pointsCorrect')}
                    value={points.correctPoint}
                    onChange={(v) => setPoints((p) => ({ ...p, correctPoint: v }))}
                  />
                  <PointField
                    id="atc-wrong"
                    label={t('questions.addToCollection.pointsWrong')}
                    value={points.wrongPoint}
                    onChange={(v) => setPoints((p) => ({ ...p, wrongPoint: v }))}
                  />
                  <PointField
                    id="atc-empty"
                    label={t('questions.addToCollection.pointsEmpty')}
                    value={points.emptyPoint}
                    onChange={(v) => setPoints((p) => ({ ...p, emptyPoint: v }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('questions.addToCollection.pointsHint')}
                </p>
              </div>

              <div className="space-y-1.5 rounded-lg border bg-muted/30 px-3 py-2.5 text-sm">
                <SummaryRow
                  label={t('questions.addToCollection.summaryCollection')}
                  value={collectionName}
                />
                <SummaryRow
                  label={t('questions.addToCollection.summarySection')}
                  value={
                    sectionIdx === NEW_SECTION
                      ? t('questions.addToCollection.newSection')
                      : (selectedSection?.label ?? '')
                  }
                />
                <SummaryRow
                  label={t('questions.addToCollection.summaryAdding')}
                  value={String(plan.toAdd.length)}
                />
                {plan.alreadyPresent.length > 0 && (
                  <p className="pt-1 text-xs text-muted-foreground">
                    {t('questions.addToCollection.summaryAlreadyPresent', {
                      count: plan.alreadyPresent.length,
                    })}
                  </p>
                )}
                {plan.inOtherSection.length > 0 && (
                  <p className="flex items-start gap-1.5 pt-1 text-xs text-amber-600 dark:text-amber-500">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {t('questions.addToCollection.summaryInOtherSection', {
                      count: plan.inOtherSection.length,
                    })}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => (s === 1 ? s : ((s - 1) as Step)))}
            disabled={step === 1 || submitting}
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={close} disabled={submitting}>
              {t('common.cancel')}
            </Button>
            {step === 1 && (
              <Button onClick={() => setStep(2)} disabled={!collectionId}>
                {t('common.next')}
              </Button>
            )}
            {step === 2 && (
              <Button
                onClick={() => sectionIdx !== null && setStep(3)}
                disabled={sectionIdx === null}
              >
                {t('common.next')}
              </Button>
            )}
            {step === 3 && (
              <Button
                onClick={handleSubmit}
                disabled={submitting || !plan || plan.toAdd.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('questions.addToCollection.adding')}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t('questions.addToCollection.confirm', { count: plan?.toAdd.length ?? 0 })}
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const { t } = useTranslation();
  const labels = [
    t('questions.addToCollection.step1'),
    t('questions.addToCollection.step2'),
    t('questions.addToCollection.step3'),
  ];

  return (
    <div className="flex items-center gap-2">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const done = n < step;
        const active = n === step;
        return (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors',
                done && 'border-primary bg-primary text-primary-foreground',
                active && !done && 'border-primary text-primary',
                !done && !active && 'border-muted-foreground/30 text-muted-foreground'
              )}
            >
              {done ? <Check className="h-3 w-3" /> : n}
            </div>
            <span
              className={cn(
                'truncate text-xs',
                active ? 'font-medium text-foreground' : 'text-muted-foreground'
              )}
            >
              {label}
            </span>
            {i < labels.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        );
      })}
    </div>
  );
}

function PointField({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        step="0.25"
        value={value}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          // Keep the last valid number while the field is mid-edit (empty, "-", "1.").
          if (e.target.value !== '' && !Number.isNaN(parsed)) onChange(parsed);
        }}
        className="font-mono"
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="truncate text-sm font-medium">{value}</span>
    </div>
  );
}
