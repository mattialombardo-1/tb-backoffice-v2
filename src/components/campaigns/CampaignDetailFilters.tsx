import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { DIFFICULTY_LABELS } from '@/lib/types/questions';
import type { DifficultyLevel } from '@/lib/types/questions';
import type { CampaignQuestionSlot, CampaignQuestionStatus } from '@/lib/types/campaigns';
import type { CommunityUser } from '@/lib/types/staff';

export interface CampaignDetailFiltersState {
  statuses: CampaignQuestionStatus[];
  subjectNames: string[];
  topicNames: string[];
  difficulties: string[];
  assigneeIds: string[];
  revisorIds: string[];
}

export const EMPTY_CAMPAIGN_FILTERS: CampaignDetailFiltersState = {
  statuses: [],
  subjectNames: [],
  topicNames: [],
  difficulties: [],
  assigneeIds: [],
  revisorIds: [],
};

const STATUS_LABELS: Record<CampaignQuestionStatus, string> = {
  draft: 'Bozza',
  in_review: 'In Revisione',
  approved: 'Approvata',
  rejected: 'Rifiutata',
};

const DIFFICULTY_FROM_NUM: Record<number, DifficultyLevel> = {
  0: 'non_ancora_valutata',
  1: 'facile',
  2: 'medio_facile',
  3: 'medio',
  4: 'medio_difficile',
  5: 'difficile',
};

const STATUS_OPTIONS = (
  ['draft', 'in_review', 'approved', 'rejected'] as CampaignQuestionStatus[]
).map((s) => ({ value: s, label: STATUS_LABELS[s] }));

interface CampaignDetailFiltersProps {
  slots: CampaignQuestionSlot[];
  reviewers: CommunityUser[];
  filters: CampaignDetailFiltersState;
  onChange: (filters: CampaignDetailFiltersState) => void;
}

export function CampaignDetailFilters({
  slots,
  reviewers,
  filters,
  onChange,
}: CampaignDetailFiltersProps) {
  const hasActiveFilters = Object.values(filters).some((v) => v.length > 0);

  // Derive options from the actual slots data
  const subjectOptions = useMemo(() => {
    const seen = new Set<string>();
    return slots
      .filter((s) => s.subjectName && !seen.has(s.subjectName) && seen.add(s.subjectName))
      .map((s) => ({ value: s.subjectName, label: s.subjectName }));
  }, [slots]);

  const topicOptions = useMemo(() => {
    const seen = new Set<string>();
    const source =
      filters.subjectNames.length > 0
        ? slots.filter((s) => filters.subjectNames.includes(s.subjectName))
        : slots;
    return source
      .filter((s) => s.topicName && !seen.has(s.topicName) && seen.add(s.topicName))
      .map((s) => ({ value: s.topicName, label: s.topicName }));
  }, [slots, filters.subjectNames]);

  const difficultyOptions = useMemo(() => {
    const seen = new Set<number>();
    return slots
      .filter((s) => s.difficulty != null && !seen.has(s.difficulty!) && seen.add(s.difficulty!))
      .sort((a, b) => (a.difficulty ?? 0) - (b.difficulty ?? 0))
      .map((s) => {
        const key = DIFFICULTY_FROM_NUM[s.difficulty!];
        return {
          value: String(s.difficulty),
          label: key ? DIFFICULTY_LABELS[key] : String(s.difficulty),
        };
      });
  }, [slots]);

  const reviewerOptions = useMemo(
    () =>
      reviewers.map((r) => ({
        value: r._id,
        label: `${r.name} ${r.surname}`.trim() || r.email || r._id,
      })),
    [reviewers]
  );

  function patch(partial: Partial<CampaignDetailFiltersState>) {
    onChange({ ...filters, ...partial });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <MultiSelect
        options={STATUS_OPTIONS}
        value={filters.statuses}
        onChange={(v) => patch({ statuses: v as CampaignQuestionStatus[] })}
        placeholder="Stato"
        searchPlaceholder="Cerca stato..."
        className="w-40"
      />

      <MultiSelect
        options={subjectOptions}
        value={filters.subjectNames}
        onChange={(v) => patch({ subjectNames: v, topicNames: [] })}
        placeholder="Materia"
        searchPlaceholder="Cerca materia..."
        className="w-44"
      />

      <MultiSelect
        options={topicOptions}
        value={filters.topicNames}
        onChange={(v) => patch({ topicNames: v })}
        placeholder="Argomento"
        searchPlaceholder="Cerca argomento..."
        className="w-44"
        disabled={subjectOptions.length === 0}
      />

      <MultiSelect
        options={difficultyOptions}
        value={filters.difficulties}
        onChange={(v) => patch({ difficulties: v })}
        placeholder="Difficoltà"
        searchPlaceholder="Cerca difficoltà..."
        className="w-40"
      />

      <MultiSelect
        options={reviewerOptions}
        value={filters.assigneeIds}
        onChange={(v) => patch({ assigneeIds: v })}
        placeholder="Produttore"
        searchPlaceholder="Cerca produttore..."
        className="w-48"
      />

      <MultiSelect
        options={reviewerOptions}
        value={filters.revisorIds}
        onChange={(v) => patch({ revisorIds: v })}
        placeholder="Revisore"
        searchPlaceholder="Cerca revisore..."
        className="w-48"
      />

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_CAMPAIGN_FILTERS)}
          className="gap-1.5 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      )}
    </div>
  );
}

/** Apply filters to a list of slots. All active filter arrays must match (AND logic). */
export function applyFilters(
  slots: CampaignQuestionSlot[],
  filters: CampaignDetailFiltersState
): CampaignQuestionSlot[] {
  return slots.filter((s) => {
    if (filters.statuses.length && !filters.statuses.includes(s.status)) return false;
    if (filters.subjectNames.length && !filters.subjectNames.includes(s.subjectName)) return false;
    if (filters.topicNames.length && !filters.topicNames.includes(s.topicName)) return false;
    if (
      filters.difficulties.length &&
      (s.difficulty == null || !filters.difficulties.includes(String(s.difficulty)))
    )
      return false;
    if (filters.assigneeIds.length && !filters.assigneeIds.includes(s.assigneeId)) return false;
    if (filters.revisorIds.length && !filters.revisorIds.includes(s.revisorId)) return false;
    return true;
  });
}
