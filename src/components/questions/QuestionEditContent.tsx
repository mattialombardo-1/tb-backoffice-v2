import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { CheckCircle, Loader2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useHierarchy } from '@/lib/hooks/useHierarchy';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { HierarchySelector } from './HierarchySelector';
import { QuestionContentEditor } from './QuestionContentEditor';
import { QuestionFormActions } from './QuestionFormActions';
import { ReviewerAssignDialog } from './ReviewerAssignDialog';
import { AutosaveIndicator } from './AutosaveIndicator';
import { QuestionStudentPreview } from './QuestionStudentPreview';

export interface QuestionEditContentProps {
  form: ReturnType<typeof useQuestionForm>;
  subjectId: string;
  subjectName: string | null;
  topicId: string | null;
  topicName: string | null;
  isReviewMode: boolean;
  /** Called when the user closes the editor (X button, or "Esci senza salvare"). */
  onClose: () => void;
  /** Called after every successful save (draft, submit, approve) so the caller can refresh its own cached copy. */
  onSaved?: () => void;
  /** Called after a successful approve / save-and-approve. Defaults to onClose. */
  onApproved?: () => void;
  /** Overrides the `z-50` on the fixed overlay wrapper — lets callers stack this above another full-screen surface. */
  zIndexClassName?: string;
}

export function QuestionEditContent({
  form,
  subjectId,
  subjectName,
  topicId,
  topicName,
  isReviewMode,
  onClose,
  onSaved,
  onApproved,
  zIndexClassName = 'z-50',
}: QuestionEditContentProps) {
  const { t } = useTranslation();
  const client = useApiClient();

  // All four values are available synchronously when this component mounts →
  // useHierarchy initialises correctly from the very first render, no async seeding needed.
  const hierarchy = useHierarchy({
    subjectId,
    subjectName: subjectName ?? undefined,
    topicId: topicId ?? null,
    topicName: topicName ?? undefined,
  });

  // Keep autosave ref and reactive validation in sync with the current selection.
  const { updateHierarchyRef } = form;
  useEffect(() => {
    updateHierarchyRef(hierarchy.selection);
  }, [hierarchy.selection, updateHierarchyRef]);

  const [reviewerDialogOpen, setReviewerDialogOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const handleClose = () => {
    if (form.isDirty) {
      setConfirmLeaveOpen(true);
    } else {
      onClose();
    }
  };

  const handleSaveDraft = async () => {
    const savedId = await form.saveDraft(hierarchy.selection);
    if (savedId) {
      toast.success(t('questions.create.draftSaved'));
      onSaved?.();
    } else {
      toast.error(t('questions.create.errorSave'));
    }
  };

  const handleSubmit = () => {
    if (Object.keys(form.validationErrors).length > 0) {
      toast.error(t('questions.create.allFieldsRequired'));
      return;
    }
    setReviewerDialogOpen(true);
  };

  const handleConfirmSubmit = async (reviewerId: string) => {
    try {
      await form.submitToReviewer(hierarchy.selection, reviewerId);
      toast.success(t('questions.create.submitted'));
      onSaved?.();
    } catch {
      toast.error("Errore durante l'invio");
      throw new Error('submit failed');
    }
  };

  const handleApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      onSaved?.();
      (onApproved ?? onClose)();
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  const handleSaveAndApprove = async () => {
    if (!form.questionId) return;
    setIsApproving(true);
    try {
      await form.saveDraft(hierarchy.selection);
      await questionsService.approve(client, form.questionId);
      toast.success(t('myReviews.approved'));
      onSaved?.();
      (onApproved ?? onClose)();
    } catch {
      toast.error(t('common.error'));
      setIsApproving(false);
    }
  };

  return (
    <div className={cn('fixed inset-0 flex flex-col bg-background', zIndexClassName)}>
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
            <h1 className="text-xl font-semibold">Modifica Domanda</h1>
            {form.isReadOnly && <Badge variant="secondary">{t('questions.readOnly')}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AutosaveIndicator
            status={form.autosaveStatus}
            lastSavedAt={form.lastSavedAt}
            isDirty={form.isDirty}
          />
          {form.isReadOnly ? (
            <>
              <Button variant="outline" onClick={() => form.setIsReadOnly(false)}>
                <Pencil className="h-4 w-4 mr-2" />
                Modifica
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isApproving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Approva
              </Button>
            </>
          ) : isReviewMode ? (
            <Button
              onClick={handleSaveAndApprove}
              disabled={isApproving || Object.keys(form.validationErrors).length > 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {t('myReviews.saveAndApprove')}
            </Button>
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

      {/* Two-column content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-7xl items-start">
          {/* Left: form */}
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
                  Seleziona brand, materia e argomento per modificare il contenuto.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: sticky preview */}
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
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmLeaveOpen(false);
                onClose();
              }}
            >
              Esci senza salvare
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
