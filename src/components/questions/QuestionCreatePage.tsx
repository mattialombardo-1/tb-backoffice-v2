import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { CheckCircle, Loader2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useHierarchy } from '@/lib/hooks/useHierarchy';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { questionsService } from '@/lib/services/questions';
import type { DifficultyLevel, QuestionType } from '@/lib/types/questions';
import { HierarchySelector } from './HierarchySelector';
import { QuestionContentEditor } from './QuestionContentEditor';
import { QuestionFormActions } from './QuestionFormActions';
import { ReviewerAssignDialog } from './ReviewerAssignDialog';
import { AutosaveIndicator } from './AutosaveIndicator';
import { QuestionStudentPreview } from './QuestionStudentPreview';

const routeApi = getRouteApi('/_authenticated/questions/create');

/** Numeric difficulty (0–5, as stored in campaign slots) → DifficultyLevel string */
const DIFFICULTY_FROM_NUM: Record<number, DifficultyLevel> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

function parseQuestionType(raw: string | undefined): QuestionType | undefined {
  if (raw === 'MULTIPLE_CHOICE' || raw === 'COMPLETION') return raw;
  return undefined;
}

function parseDifficulty(raw: string | undefined): DifficultyLevel | undefined {
  if (!raw) return undefined;
  const asNum = Number(raw);
  if (!Number.isNaN(asNum) && asNum in DIFFICULTY_FROM_NUM) {
    return DIFFICULTY_FROM_NUM[asNum];
  }
  // Accept string form as-is if it matches
  const valid: DifficultyLevel[] = [
    'facile',
    'medio_facile',
    'medio',
    'medio_difficile',
    'difficile',
    'non_ancora_valutata',
  ];
  return valid.includes(raw as DifficultyLevel) ? (raw as DifficultyLevel) : undefined;
}

export function QuestionCreatePage() {
  const { questionId: editId, slotId, campaignId, campaignName, subjectId, topicId, difficulty, questionType, revisorId, reviewMode } =
    routeApi.useSearch();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const client = useApiClient();

  const isEditMode = !!editId;
  const isCampaignMode = !!(slotId && campaignId);
  const initialDifficulty = parseDifficulty(difficulty);
  const initialType = parseQuestionType(questionType);

  const hierarchy = useHierarchy(
    subjectId
      ? { subjectId, topicId: topicId ?? null }
      : undefined
  );

  const form = useQuestionForm(
    editId
      ? editId
      : { initialDifficulty, initialType }
  );
  const { updateHierarchyRef } = form;

  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    updateHierarchyRef(hierarchy.selection);
  }, [hierarchy.selection, updateHierarchyRef]);

  const handleClose = () => {
    if (form.isDirty) {
      setConfirmLeaveOpen(true);
    } else {
      navigate({ to: '/questions' });
    }
  };

  const handleConfirmLeave = () => {
    setConfirmLeaveOpen(false);
    navigate({ to: '/questions' });
  };

  const handleSaveDraft = async () => {
    const savedId = await form.saveDraft(hierarchy.selection);
    if (savedId) {
      toast.success(t('questions.create.draftSaved'));
    } else {
      toast.error(t('questions.create.errorSave'));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(form.validationErrors).length > 0) {
      toast.error(t('questions.create.allFieldsRequired'));
      return;
    }
    // In campaign mode the reviewer is pre-assigned on the slot — skip the picker
    if (isCampaignMode && revisorId) {
      handleConfirmSubmit(revisorId);
      return;
    }
    setReviewerDialogOpen(true);
  };

  const handleConfirmSubmit = async (reviewerId: string) => {
    try {
      const savedQuestionId = await form.submitToReviewer(hierarchy.selection, reviewerId);
      toast.success(t('questions.create.submitted'));

      // If this question was created from a campaign slot, update the slot and navigate back
      if (isCampaignMode && savedQuestionId) {
        try {
          await campaignsService.updateSlot(client, campaignId!, slotId!, {
            status: 'in_review',
            questionId: savedQuestionId,
          });
        } catch {
          // Non-fatal — the question was submitted, slot update is best-effort
          console.error('Failed to update campaign slot after question submission');
        }
        navigate({ to: '/my-slots' });
      }
    } catch {
      toast.error("Errore durante l'invio");
      throw new Error('submit failed');
    }
  };

  /** Review mode: approve question as-is (status → ACTIVE, no edits). */
  const handleApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      // Always save before approving: the Lambda snapshot requires subject.name and
      // topic.name to be non-empty, but older questions may have been saved with
      // empty names. A saveDraft here ensures the DB record is up-to-date.
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      navigate({ to: '/questions/to-review' });
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  /** Review mode: save edited content then approve (status → ACTIVE). */
  const handleSaveAndApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      navigate({ to: '/questions/to-review' });
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  if (form.isLoadingQuestion) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-8">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="mb-4 h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (form.loadError) {
    return (
      <div className="fixed inset-0 z-50 bg-background p-8">
        <h1 className="mb-4 text-2xl font-semibold">Errore</h1>
        <p className="text-muted-foreground">{form.loadError}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b bg-background px-8 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">
              {reviewMode ? t('myReviews.reviewTitle') : isEditMode ? 'Modifica Domanda' : 'Crea Domanda'}
            </h1>
            {form.isReadOnly && !reviewMode && <Badge variant="secondary">{t('questions.readOnly')}</Badge>}
            {reviewMode && form.isReadOnly && <Badge variant="secondary">{t('myReviews.readOnlyBadge')}</Badge>}
            {reviewMode && !form.isReadOnly && <Badge variant="outline" className="border-amber-400 text-amber-600">{t('myReviews.editingBadge')}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator
            status={form.autosaveStatus}
            lastSavedAt={form.lastSavedAt}
            isDirty={form.isDirty}
          />
          {reviewMode ? (
            form.isReadOnly ? (
              /* Read-only review: Approva + Modifica */
              <>
                <Button
                  variant="outline"
                  onClick={() => form.setIsReadOnly(false)}
                  disabled={isApproving}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  {t('myReviews.edit')}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isApproving
                    ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    : <CheckCircle className="h-4 w-4 mr-2" />}
                  {t('myReviews.approve')}
                </Button>
              </>
            ) : (
              /* Editing review: Salva e Approva */
              <Button
                onClick={handleSaveAndApprove}
                disabled={isApproving || Object.keys(form.validationErrors).length > 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isApproving
                  ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  : <CheckCircle className="h-4 w-4 mr-2" />}
                {t('myReviews.saveAndApprove')}
              </Button>
            )
          ) : (
            <QuestionFormActions
              onSaveDraft={handleSaveDraft}
              onSubmit={handleSubmit}
              isSaving={form.autosaveStatus === 'saving'}
              isReadOnly={form.isReadOnly}
              canSaveDraft={hierarchy.isComplete}
              hasValidationErrors={Object.keys(form.validationErrors).length > 0}
            />
          )}
        </div>
      </div>

      {/* Campaign mode banner */}
      {isCampaignMode && (
        <div className="shrink-0 border-b bg-amber-50 px-8 py-2 dark:bg-amber-950/30">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-medium">Stai producendo per la campagna:</span>{' '}
            {campaignName ?? campaignId}
            {' — '}
            La domanda verrà associata automaticamente allo slot quando inviata in revisione.
          </p>
        </div>
      )}

      {/* Two-column content area — single scroll, preview sticky */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-7xl items-start">

          {/* Left: form cards */}
          <div className="flex-1 space-y-6 px-10 py-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Classificazione</CardTitle>
              </CardHeader>
              <CardContent>
                <HierarchySelector hierarchy={hierarchy} disabled={form.isReadOnly} />
              </CardContent>
            </Card>

            {hierarchy.isComplete ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contenuto</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionContentEditor form={form} />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Seleziona brand, materia, argomento e sotto-argomento per abilitare il modulo di
                  creazione.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: sticky student preview at 35% */}
          <div
            className="sticky top-0 w-[35%] shrink-0 overflow-y-auto border-l"
            style={{ maxHeight: 'calc(100dvh - 68px)' }}
          >
            <div className="space-y-4 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Anteprima studente
              </p>
              <QuestionStudentPreview
                questionText={form.questionText}
                type={form.type}
                alternatives={form.alternatives}
                alternativeStyle={form.alternativeStyle}
                completionAnswer={form.completionAnswer}
                questionImages={form.questionImageEntries.map((e) => e.viewUrl)}
                explanationText={form.explanationText}
                explanationImages={form.explanationImageEntries.map((e) => e.viewUrl)}
              />
            </div>
          </div>

        </div>
      </div>

      <ReviewerAssignDialog
        open={reviewerDialogOpen}
        onClose={() => setReviewerDialogOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Vuoi lasciare la pagina?</DialogTitle>
            <DialogDescription>
              Ci sono modifiche non salvate. Se esci ora, andranno perse.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmLeaveOpen(false)}>
              Rimani
            </Button>
            <Button variant="destructive" onClick={handleConfirmLeave}>
              Esci senza salvare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
