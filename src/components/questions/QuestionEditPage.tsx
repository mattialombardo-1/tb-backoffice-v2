import { getRouteApi, useNavigate } from '@tanstack/react-router';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuestionForm } from '@/lib/hooks/useQuestionForm';
import { QuestionEditContent } from './QuestionEditContent';

const routeApi = getRouteApi('/_authenticated/questions/$questionId');

// ---------------------------------------------------------------------------
// Shell — owns the form hook, shows skeleton while loading, then mounts content
// ---------------------------------------------------------------------------

export function QuestionEditPage() {
  const { questionId } = routeApi.useParams();
  const { review } = routeApi.useSearch();
  const navigate = useNavigate();
  const form = useQuestionForm({ editQuestionId: questionId, initialReadOnly: review === true });

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

  // By this point the question has loaded and loadedSubjectId is set.
  // QuestionEditContent mounts fresh here, so useHierarchy is initialized
  // synchronously with the correct subjectId/topicId.
  return (
    <QuestionEditContent
      form={form}
      subjectId={form.loadedSubjectId ?? ''}
      subjectName={form.loadedSubjectName}
      topicId={form.loadedTopicId}
      topicName={form.loadedTopicName}
      isReviewMode={review === true}
      onClose={() => navigate({ to: review === true ? '/questions/to-review' : '/questions' })}
      onApproved={() => navigate({ to: '/questions/to-review' })}
    />
  );
}
