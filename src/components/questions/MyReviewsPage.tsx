import { useTranslation } from 'react-i18next';
import { AlertCircle, ClipboardCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReviewBatches } from '@/lib/hooks/useReviewBatches';
import { MyReviewsBatchGroup } from './MyReviewsBatchGroup';

export function MyReviewsPage() {
  const { t } = useTranslation();
  const { batches, isLoading, isError, refetch } = useReviewBatches();

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

      {/* Proposta di design: il "listone" piatto delle revisioni singole è nascosto per
          ora — interfaccia pulita per concentrarsi sui batch generati insieme (stessa
          materia, stesso giorno). Vedi useReviewBatches. */}
      {batches.length > 0 && (
        <div className="space-y-3">
          {batches.map((batch) => (
            <MyReviewsBatchGroup key={batch.key} batch={batch} />
          ))}
        </div>
      )}
    </div>
  );
}
