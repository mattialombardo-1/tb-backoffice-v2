import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { QuestionEditContent } from './QuestionEditContent';

interface QuestionEditOverlayProps {
  questionId: string;
  onClose: () => void;
  /** Called after every successful save so the caller can refresh its own cached copy of the question. */
  onSaved?: () => void;
  /** Stacks this above another fixed full-screen surface (e.g. the Collection editor). */
  zIndexClassName?: string;
}

/**
 * Route-agnostic version of QuestionEditPage — same full-screen editor, but driven by a
 * `questionId` prop instead of the router, so it can be mounted as an overlay from anywhere
 * (e.g. on top of the Collection editor) without navigating away from the calling context.
 */
export function QuestionEditOverlay({
  questionId,
  onClose,
  onSaved,
  zIndexClassName = 'z-[60]',
}: QuestionEditOverlayProps) {
  const form = useQuestionForm({ editQuestionId: questionId });

  if (form.isLoadingQuestion) {
    return (
      <div className={cn('fixed inset-0 bg-background p-8', zIndexClassName)}>
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="mb-4 h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (form.loadError) {
    return (
      <div className={cn('fixed inset-0 bg-background p-8', zIndexClassName)}>
        <h1 className="mb-4 text-2xl font-semibold">Errore</h1>
        <p className="text-muted-foreground">{form.loadError}</p>
      </div>
    );
  }

  return (
    <QuestionEditContent
      form={form}
      subjectId={form.loadedSubjectId ?? ''}
      subjectName={form.loadedSubjectName}
      topicId={form.loadedTopicId}
      topicName={form.loadedTopicName}
      isReviewMode={false}
      onClose={onClose}
      onSaved={onSaved}
      zIndexClassName={zIndexClassName}
    />
  );
}
