import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { AlertCircle, ChevronRight, Loader2, Pencil, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DIFFICULTY_LABELS } from '@/lib/types/questions';
import type { CampaignQuestionStatus, CampaignSlotWithContext } from '@/lib/types/campaigns';
import { useMySlots } from '@/lib/hooks/useMySlots';
import { cn } from '@/lib/utils';

const DIFFICULTY_FROM_NUM: Record<number, keyof typeof DIFFICULTY_LABELS> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

function difficultyLabel(value?: number): string {
  if (value === undefined || value === null) return '—';
  const key = DIFFICULTY_FROM_NUM[value];
  return key ? DIFFICULTY_LABELS[key] : String(value);
}

const STATUS_VARIANT: Record<CampaignQuestionStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

function StatusBadge({ status }: { status: CampaignQuestionStatus }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_VARIANT[status]
      )}
    >
      {t(`campaigns.status.${status}`)}
    </span>
  );
}

function SlotRow({ slot }: { slot: CampaignSlotWithContext }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function handleProduce() {
    navigate({
      to: '/questions/create',
      search: {
        slotId: slot.id,
        campaignId: slot.campaignId,
        campaignName: slot.campaignName,
        subjectId: slot.subjectId,
        topicId: slot.topicId,
        difficulty: slot.difficulty !== undefined ? String(slot.difficulty) : undefined,
        questionType: slot.questionType ?? undefined,
        revisorId: slot.revisorId || undefined,
      },
    });
  }

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent/30">
      {/* Main info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{slot.subjectName}</span>
          {slot.topicName && (
            <>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{slot.topicName}</span>
            </>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <StatusBadge status={slot.status} />
          {slot.difficulty !== undefined && <span>{difficultyLabel(slot.difficulty)}</span>}
          {slot.dueDate && (
            <span>
              {t('mySlots.dueDate')}: {new Date(slot.dueDate).toLocaleDateString('it-IT')}
            </span>
          )}
        </div>
      </div>

      {/* Produce button */}
      <Button onClick={handleProduce} size="sm" className="shrink-0 gap-1.5">
        <PlayCircle className="h-4 w-4" />
        {t('mySlots.produce')}
      </Button>
    </div>
  );
}

export function MySlotsPage() {
  const { t } = useTranslation();
  const { groups, total, isLoading, isError, refetch } = useMySlots();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{t('mySlots.errorTitle')}</p>
            <p className="text-sm">{t('mySlots.errorDesc')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t('common.retry')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Pencil />
          <h1 className="text-2xl font-semibold">{t('mySlots.title')}</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{t('mySlots.subtitle')}</p>
      </div>

      {total === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">{t('mySlots.empty')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.campaignId}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{group.campaignName}</CardTitle>
                  <Badge variant="secondary">
                    {t('mySlots.slotsCount', { count: group.slots.length })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {group.slots.map((slot) => (
                  <SlotRow key={slot.id} slot={slot} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
