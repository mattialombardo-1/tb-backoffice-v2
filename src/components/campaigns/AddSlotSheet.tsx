import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useHierarchy } from '@/lib/hooks/useHierarchy';
import { useReviewerList } from '@/lib/hooks/useReviewerList';
import { useApiClient } from '@/lib/api/useApiClient';
import { collectionsService } from '@/lib/services/collections';
import { poolsService } from '@/lib/services/pools';
import { queryKeys } from '@/lib/query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SearchableSelect } from './SearchableSelect';
import type {
  CampaignQuestionSlot,
  CampaignQuestionType,
  NewCampaignQuestionSlot,
} from '@/lib/types/campaigns';

const DIFFICULTY_OPTIONS = [
  { value: '0', labelKey: 'difficulties.non_ancora_valutata' },
  { value: '1', labelKey: 'difficulties.facile' },
  { value: '2', labelKey: 'difficulties.medio_facile' },
  { value: '3', labelKey: 'difficulties.medio' },
  { value: '4', labelKey: 'difficulties.medio_difficile' },
  { value: '5', labelKey: 'difficulties.difficile' },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Add-mode callback */
  onAdd?: (slot: NewCampaignQuestionSlot) => Promise<void>;
  /** Edit-mode props — when provided the sheet pre-fills and calls onEdit on submit */
  editSlot?: CampaignQuestionSlot;
  editIndex?: number;
  onEdit?: (slot: NewCampaignQuestionSlot, index: number) => Promise<void>;
}

function userLabel(u: {
  _id: string;
  name?: string;
  surname?: string;
  email?: string;
  cognitoId: string;
}): string {
  if (u.name || u.surname) return `${u.name ?? ''} ${u.surname ?? ''}`.trim();
  if (u.email) return u.email;
  return u.cognitoId;
}

export function AddSlotSheet({ open, onOpenChange, onAdd, editSlot, editIndex, onEdit }: Props) {
  const { t } = useTranslation();
  const client = useApiClient();
  const isEditMode = editSlot != null && editIndex != null;

  // Hierarchy seeded with existing values in edit mode (initial is read only on mount;
  // the parent passes a changing key= to remount when the target slot changes).
  const hierarchy = useHierarchy({
    subjectId: editSlot?.subjectId ?? null,
    topicId: editSlot?.topicId ?? null,
  });

  const { reviewers, isLoading: loadingUsers } = useReviewerList();

  const collectionsQuery = useQuery({
    queryKey: ['collections', 'all'],
    queryFn: ({ signal }) => collectionsService.list(client, { page: 1, limit: 200 }, signal),
    staleTime: 5 * 60_000,
  });

  const poolsQuery = useQuery({
    queryKey: queryKeys.pools.list(),
    queryFn: ({ signal }) => poolsService.listAll(client, signal),
    staleTime: 5 * 60_000,
  });

  // All other state seeded from editSlot on mount (fresh mount guaranteed by key= in parent)
  const [difficulty, setDifficulty] = useState(
    editSlot?.difficulty != null ? String(editSlot.difficulty) : ''
  );
  const [questionType, setQuestionType] = useState<CampaignQuestionType | ''>(
    editSlot?.questionType ?? ''
  );
  const [assigneeId, setAssigneeId] = useState(editSlot?.assigneeId ?? '');
  const [revisorId, setRevisorId] = useState(editSlot?.revisorId ?? '');
  const [collectionId, setCollectionId] = useState(editSlot?.collection ?? '');
  const [poolId, setPoolId] = useState(editSlot?.pool ?? '');
  const [dueDate, setDueDate] = useState(editSlot?.dueDate ? editSlot.dueDate.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSubject = hierarchy.materie.items.find(
    (m) => m.id === hierarchy.selection.subjectId
  );
  const selectedTopic = hierarchy.argomenti.items.find((a) => a.id === hierarchy.selection.topicId);

  const subjectOptions = hierarchy.materie.items.map((m) => ({ value: m.id, label: m.name }));
  const topicOptions = hierarchy.argomenti.items.map((a) => ({ value: a.id, label: a.name }));
  const userOptions = reviewers.map((u) => ({
    value: u._id,
    label: userLabel(u),
    keywords: u.email ? [u.email] : undefined,
  }));
  const collectionOptions = (collectionsQuery.data?.collections ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));
  const poolOptions = (poolsQuery.data ?? []).map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const canSubmit =
    !!hierarchy.selection.subjectId &&
    !!hierarchy.selection.topicId &&
    !!assigneeId &&
    !!revisorId &&
    !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      const slot: NewCampaignQuestionSlot = {
        status: editSlot?.status ?? 'draft',
        subjectId: selectedSubject?.id ?? editSlot?.subjectId ?? hierarchy.selection.subjectId!,
        subjectName: selectedSubject?.name ?? editSlot?.subjectName ?? '',
        topicId: selectedTopic?.id ?? editSlot?.topicId ?? hierarchy.selection.topicId!,
        topicName: selectedTopic?.name ?? editSlot?.topicName ?? '',
        difficulty: difficulty !== '' ? parseInt(difficulty, 10) : undefined,
        questionType: questionType || undefined,
        assigneeId,
        revisorId,
        dueDate: dueDate || undefined,
        collection: collectionId || undefined,
        pool: poolId || undefined,
      };

      if (isEditMode) {
        await onEdit!(slot, editIndex!);
      } else {
        await onAdd!(slot);
      }

      if (!isEditMode) resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('campaigns.addSlotSheet.error'));
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    hierarchy.setMateria(null);
    setDifficulty('');
    setQuestionType('');
    setAssigneeId('');
    setRevisorId('');
    setCollectionId('');
    setPoolId('');
    setDueDate('');
    setError(null);
  }

  function handleOpenChange(v: boolean) {
    if (!saving) {
      onOpenChange(v);
      if (!v && !isEditMode) resetForm();
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full max-w-lg overflow-y-auto p-3">
        <SheetHeader>
          <SheetTitle>
            {isEditMode ? t('campaigns.addSlotSheet.editTitle') : t('campaigns.addSlotSheet.title')}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 px-1">
          {/* Subject */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.subject')} *</Label>
            <SearchableSelect
              value={hierarchy.selection.subjectId ?? ''}
              onValueChange={(v) => hierarchy.setMateria(v || null)}
              options={subjectOptions}
              placeholder={
                hierarchy.materie.isLoading
                  ? t('common.loading')
                  : t('campaigns.addSlotSheet.subjectPlaceholder')
              }
              searchPlaceholder={t('common.search')}
              disabled={hierarchy.materie.isLoading}
            />
          </div>

          {/* Topic */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.topic')} *</Label>
            <SearchableSelect
              value={hierarchy.selection.topicId ?? ''}
              onValueChange={(v) => hierarchy.setArgomento(v || null)}
              options={topicOptions}
              placeholder={
                !hierarchy.selection.subjectId
                  ? t('campaigns.addSlotSheet.subjectFirst')
                  : hierarchy.argomenti.isLoading
                    ? t('common.loading')
                    : t('campaigns.addSlotSheet.topicPlaceholder')
              }
              searchPlaceholder={t('common.search')}
              disabled={!hierarchy.selection.subjectId || hierarchy.argomenti.isLoading}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.difficulty')}</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder={t('campaigns.addSlotSheet.difficultyPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {t(opt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question type */}
          <div className="space-y-1.5">
            <Label>Tipologia domanda</Label>
            <Select
              value={questionType}
              onValueChange={(v) => setQuestionType(v as CampaignQuestionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Qualsiasi tipologia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLE_CHOICE">Risposta chiusa</SelectItem>
                <SelectItem value="COMPLETION">Completamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.assignee')} *</Label>
            <SearchableSelect
              value={assigneeId}
              onValueChange={setAssigneeId}
              options={userOptions}
              placeholder={
                loadingUsers ? t('common.loading') : t('campaigns.addSlotSheet.assigneePlaceholder')
              }
              searchPlaceholder={t('common.search')}
              disabled={loadingUsers}
            />
          </div>

          {/* Revisor */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.revisor')} *</Label>
            <SearchableSelect
              value={revisorId}
              onValueChange={setRevisorId}
              options={userOptions}
              placeholder={
                loadingUsers ? t('common.loading') : t('campaigns.addSlotSheet.revisorPlaceholder')
              }
              searchPlaceholder={t('common.search')}
              disabled={loadingUsers}
            />
          </div>

          {/* Collection (optional) */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.collection')}</Label>
            <SearchableSelect
              value={collectionId}
              onValueChange={setCollectionId}
              options={collectionOptions}
              placeholder={
                collectionsQuery.isLoading
                  ? t('common.loading')
                  : t('campaigns.addSlotSheet.collectionPlaceholder')
              }
              searchPlaceholder={t('common.search')}
              disabled={collectionsQuery.isLoading}
            />
          </div>

          {/* Pool (optional) */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.pool')}</Label>
            <SearchableSelect
              value={poolId}
              onValueChange={setPoolId}
              options={poolOptions}
              placeholder={
                poolsQuery.isLoading
                  ? t('common.loading')
                  : t('campaigns.addSlotSheet.poolPlaceholder')
              }
              searchPlaceholder={t('common.search')}
              disabled={poolsQuery.isLoading}
            />
          </div>

          {/* Due date */}
          <div className="space-y-1.5">
            <Label>{t('campaigns.addSlotSheet.dueDate')}</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <SheetFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={saving}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving
                ? t('common.saving')
                : isEditMode
                  ? t('campaigns.addSlotSheet.save')
                  : t('campaigns.addSlotSheet.add')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
