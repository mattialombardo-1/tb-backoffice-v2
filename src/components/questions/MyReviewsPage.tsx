import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, ClipboardCheck, Loader2, ScanEye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DIFFICULTY_LABELS } from '@/lib/types/questions';
import type { QuestionListItem } from '@/lib/types/questions';
import { useMyReviews } from '@/lib/hooks/useMyReviews';

function difficultyLabel(level: QuestionListItem['difficulty']): string {
  return DIFFICULTY_LABELS[level] ?? level;
}

function QuestionRowSkeleton() {
  return (
    <tr className="border-b last:border-0">
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-64 mb-1" />
        <Skeleton className="h-3 w-40" />
      </td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
      <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
      <td className="px-4 py-3" />
    </tr>
  );
}

function QuestionRow({ question }: { question: QuestionListItem }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const preview = question.questionText.replace(/<[^>]+>/g, '').slice(0, 100);

  return (
    <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
      <td className="px-4 py-3 max-w-md">
        <div className="font-medium text-sm line-clamp-2">
          {preview || <span className="text-muted-foreground italic">{t('myReviews.noText')}</span>}
        </div>
        <div className="text-xs text-muted-foreground font-mono mt-0.5">{question.id}</div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {question.materiaName}
        {question.argomentoName && (
          <span className="text-muted-foreground/60"> / {question.argomentoName}</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {difficultyLabel(question.difficulty)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
        {new Date(question.createdAt).toLocaleDateString('it-IT')}
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          className="gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity"
          onClick={() =>
            navigate({
              to: '/questions/$questionId',
              params: { questionId: question.id },
              search: { review: true },
            })
          }
        >
          <ScanEye className="h-4 w-4" />
          {t('myReviews.review')}
        </Button>
      </td>
    </tr>
  );
}

export function MyReviewsPage() {
  const { t } = useTranslation();
  const { questions, total, isLoading, isError, refetch } = useMyReviews();

  if (isError) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{t('myReviews.errorTitle')}</p>
            <p className="text-sm">{t('myReviews.errorDesc')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6" />
            {t('myReviews.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t('myReviews.subtitle')}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => refetch()} title={t('common.retry')}>
          <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {total === 0 && !isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t('myReviews.empty')}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {t('myReviews.table.text')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('myReviews.table.subject')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('myReviews.table.difficulty')}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                    {t('myReviews.table.createdAt')}
                  </th>
                  <th className="w-28" />
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <QuestionRowSkeleton key={i} />)
                  : questions.map((q) => <QuestionRow key={q.id} question={q} />)}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
