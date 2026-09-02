import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Pencil, Check, X, ChevronRight, Eye, GripVertical, ChevronsLeft, ChevronsRight, RotateCcw, AlertCircle, CalendarIcon, ChevronDown } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MultiSelect } from '@/components/ui/multi-select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { useHierarchyMulti } from '@/lib/hooks/useHierarchyMulti';
import { useAuthorsList } from '@/lib/hooks/useAuthorsList';
import { useCollectionsForFilter } from '@/lib/hooks/useCollectionsForFilter';
import { usePoolsForFilter } from '@/lib/hooks/usePoolsForFilter';
import type { CollectionSection } from '@/lib/types/collections';
import type { DifficultyLevel, QuestionLanguage, QuestionListItem, QuestionStatus, QuestionType } from '@/lib/types/questions';
import { DIFFICULTY_LABELS, LANGUAGE_LABELS, QUESTION_TYPE_LABELS, STATUS_LABELS } from '@/lib/types/questions';
import { QuestionsViewDialog } from '@/components/questions/QuestionsViewDialog';
import { QuestionEditOverlay } from '@/components/questions/QuestionEditOverlay';
import { RichQuestionText } from '@/components/questions/RichQuestionText';
import { ListPagination } from '@/components/ui/list-pagination';

const DIFFICULTY_OPTIONS = (
  ['facile', 'medio_facile', 'medio', 'medio_difficile', 'difficile', 'non_ancora_valutata'] as DifficultyLevel[]
).map((v) => ({ value: v, label: DIFFICULTY_LABELS[v] }));

const TYPE_OPTIONS = (['MULTIPLE_CHOICE', 'COMPLETION'] as QuestionType[]).map((v) => ({
  value: v,
  label: QUESTION_TYPE_LABELS[v],
}));

const STATUS_OPTIONS = (['DRAFT', 'ACTIVE', 'TO_REVIEW', 'INACTIVE'] as QuestionStatus[]).map(
  (v) => ({ value: v, label: STATUS_LABELS[v] })
);

const LANGUAGE_OPTIONS = (['IT-it', 'EN-en'] as QuestionLanguage[]).map((v) => ({
  value: v,
  label: LANGUAGE_LABELS[v],
}));

function parseLocalDate(s: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const PAGE_SIZE = 20;

const SECTION_COLORS = [
  '#60a5fa',
  '#34d399',
  '#a78bfa',
  '#fbbf24',
  '#f87171',
  '#22d3ee',
];

function getSectionColor(index: number): string {
  return SECTION_COLORS[index % SECTION_COLORS.length];
}

function makeMinimalListItem(id: string, questionText = ''): QuestionListItem {
  return {
    id,
    subjectId: '', subjectName: '', topicId: '', topicName: '', sottoArgomentoId: '',
    type: 'MULTIPLE_CHOICE',
    difficulty: 'non_ancora_valutata',
    questionText,
    explanationText: '',
    alternatives: [],
    completionAnswer: '',
    questionImages: [],
    explanationImages: [],
    status: 'DRAFT',
    reviewerId: null,
    reviewerEmail: null,
    language: 'IT-it',
    createdAt: '',
    updatedAt: '',
    materiaName: '',
    argomentoName: '',
    sottoArgomentoName: '',
  };
}

// ── Sortable question row ────────────────────────────────────────────────────

interface SortableQuestionRowProps {
  qId: string;
  qIdx: number;
  sectionId: string;
  color: string;
  qData: QuestionListItem | undefined;
  /** True while the collection's question details are still being backfilled — shows a skeleton instead of the raw id fallback. */
  isLoadingDetails: boolean;
  positionEdit: { sectionId: string; qId: string; value: string } | null;
  totalInSection: number;
  onPositionClick: (sectionId: string, qId: string, currentIdx: number) => void;
  onPositionChange: (value: string) => void;
  onPositionCommit: () => void;
  onView: (qId: string) => void;
  onEdit: (qId: string) => void;
  onRemove: (sectionId: string, qId: string) => void;
}

function SortableQuestionRow({
  qId,
  qIdx,
  sectionId,
  color,
  qData,
  isLoadingDetails,
  positionEdit,
  totalInSection,
  onPositionClick,
  onPositionChange,
  onPositionCommit,
  onView,
  onEdit,
  onRemove,
}: SortableQuestionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: qId });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    borderLeft: `3px solid ${color}`,
  };

  const isEditingPos =
    positionEdit?.sectionId === sectionId && positionEdit?.qId === qId;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-1.5 px-2 py-1.5 text-xs bg-background"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-0.5 shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Position badge / input */}
      {isEditingPos ? (
        <input
          autoFocus
          type="number"
          min={1}
          max={totalInSection}
          className="w-8 h-4 text-xs font-mono text-center border rounded bg-background shrink-0 mt-0.5 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          value={positionEdit.value}
          onChange={(e) => onPositionChange(e.target.value)}
          onBlur={onPositionCommit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onPositionCommit();
            if (e.key === 'Escape') onPositionCommit();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <button
          className="text-muted-foreground shrink-0 mt-0.5 font-mono hover:text-foreground hover:underline transition-colors cursor-pointer"
          title="Clicca per cambiare posizione"
          onClick={(e) => {
            e.stopPropagation();
            onPositionClick(sectionId, qId, qIdx);
          }}
        >
          #{qIdx + 1}
        </button>
      )}

      <div className="flex-1 min-w-0">
        {qData ? (
          <>
            <RichQuestionText html={qData.questionText} className="line-clamp-2 leading-snug" />
            {qData.materiaName && (
              <p className="text-muted-foreground mt-0.5 truncate">{qData.materiaName}</p>
            )}
          </>
        ) : isLoadingDetails ? (
          <div className="space-y-1 py-0.5">
            <Skeleton className="h-2.5 w-full" />
            <Skeleton className="h-2.5 w-2/3" />
          </div>
        ) : (
          <p className="font-mono text-muted-foreground">{qId.slice(-10).toUpperCase()}</p>
        )}
      </div>

      <button
        className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted transition-colors shrink-0 mt-0.5"
        title="Visualizza domanda"
        onClick={(e) => { e.stopPropagation(); onView(qId); }}
      >
        <Eye className="h-3 w-3 text-muted-foreground" />
      </button>
      <button
        className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted transition-colors shrink-0 mt-0.5"
        title="Modifica domanda"
        onClick={(e) => { e.stopPropagation(); onEdit(qId); }}
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </button>
      <button
        className="h-4 w-4 flex items-center justify-center rounded hover:bg-muted transition-colors shrink-0 mt-0.5"
        title="Rimuovi domanda"
        onClick={(e) => { e.stopPropagation(); onRemove(sectionId, qId); }}
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
    </div>
  );
}

// ── Sortable section card ────────────────────────────────────────────────────

interface SortableSectionCardProps {
  section: CollectionSection;
  idx: number;
  isActive: boolean;
  isCollapsed: boolean;
  editingSection: { id: string; value: string } | null;
  positionEdit: { sectionId: string; qId: string; value: string } | null;
  questionCache: Map<string, QuestionListItem>;
  isLoadingDetails: boolean;
  onActivate: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onRenameStart: (id: string, name: string) => void;
  onRenameChange: (value: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onDelete: (id: string) => void;
  onQuestionDragEnd: (sectionId: string, event: DragEndEvent) => void;
  onPositionClick: (sectionId: string, qId: string, currentIdx: number) => void;
  onPositionChange: (value: string) => void;
  onPositionCommit: () => void;
  onView: (qId: string) => void;
  onEdit: (qId: string) => void;
  onRemove: (sectionId: string, qId: string) => void;
}

function SortableSectionCard({
  section,
  idx,
  isActive,
  isCollapsed,
  editingSection,
  positionEdit,
  questionCache,
  isLoadingDetails,
  onActivate,
  onToggleCollapse,
  onRenameStart,
  onRenameChange,
  onRenameCommit,
  onRenameCancel,
  onDelete,
  onQuestionDragEnd,
  onPositionClick,
  onPositionChange,
  onPositionCommit,
  onView,
  onEdit,
  onRemove,
}: SortableSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const color = getSectionColor(idx);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    border: isActive ? `2px solid ${color}` : '1px solid hsl(var(--border))',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg overflow-hidden cursor-pointer transition-all bg-card"
      onClick={() => onActivate(section.id)}
    >
      {/* Section header */}
      <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-border/60">
        {/* Section drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        {editingSection?.id === section.id ? (
          <Input
            autoFocus
            className="h-6 text-sm flex-1 px-1 min-w-0"
            value={editingSection.value}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameCommit();
              if (e.key === 'Escape') onRenameCancel();
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 text-sm font-medium truncate min-w-0">{section.name}</span>
        )}

        <Badge variant="secondary" className="text-xs px-1.5 shrink-0 h-5">
          {section.questionIds.length}
        </Badge>
        <button
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-colors shrink-0"
          title="Rinomina sezione"
          onClick={(e) => { e.stopPropagation(); onRenameStart(section.id, section.name); }}
        >
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted transition-colors shrink-0"
          title={isCollapsed ? 'Espandi sezione' : 'Collassa sezione'}
          onClick={(e) => { e.stopPropagation(); onToggleCollapse(section.id); }}
        >
          {isCollapsed
            ? <ChevronRight className="h-3 w-3 text-muted-foreground" />
            : <ChevronDown className="h-3 w-3 text-muted-foreground" />}
        </button>
        <button
          className="h-5 w-5 flex items-center justify-center rounded hover:bg-destructive/10 transition-colors shrink-0"
          title="Elimina sezione"
          onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </button>
      </div>

      {/* Questions list with D&D */}
      {!isCollapsed && section.questionIds.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => onQuestionDragEnd(section.id, e)}
        >
          <SortableContext items={section.questionIds} strategy={verticalListSortingStrategy}>
            <div className="divide-y divide-border/60">
              {section.questionIds.map((qId, qIdx) => (
                <SortableQuestionRow
                  key={qId}
                  qId={qId}
                  qIdx={qIdx}
                  sectionId={section.id}
                  color={color}
                  qData={questionCache.get(qId)}
                  isLoadingDetails={isLoadingDetails}
                  positionEdit={positionEdit}
                  totalInSection={section.questionIds.length}
                  onPositionClick={onPositionClick}
                  onPositionChange={onPositionChange}
                  onPositionCommit={onPositionCommit}
                  onView={onView}
                  onEdit={onEdit}
                  onRemove={onRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

interface Props {
  /** Id of the collection being edited — undefined when creating a new one. */
  collectionId?: string;
  sections: CollectionSection[];
  onSectionsChange: (sections: CollectionSection[]) => void;
  onContinue: () => void;
  onBack: () => void;
}

const MEMBER_HYDRATE_PAGE_SIZE = 200;

export function CollectionTabDomande({
  collectionId,
  sections,
  onSectionsChange,
  onContinue,
  onBack,
}: Props) {
  const client = useApiClient();
  const queryClient = useQueryClient();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(() => sections[0]?.id ?? null);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);

  const toggleCollapse = useCallback((sectionId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId);
      return next;
    });
  }, []);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [page, setPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<QuestionStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<DifficultyLevel[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<QuestionLanguage[]>([]);
  const [selectedMaterias, setSelectedMaterias] = useState<string[]>([]);
  const [selectedArgomenti, setSelectedArgomenti] = useState<string[]>([]);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [selectedCollectionIdsMode, setSelectedCollectionIdsMode] = useState<'include' | 'exclude'>('include');
  const [selectedPoolIds, setSelectedPoolIds] = useState<string[]>([]);
  const [selectedPoolIdsMode, setSelectedPoolIdsMode] = useState<'include' | 'exclude'>('include');
  const [unpublishedOnly, setUnpublishedOnly] = useState(false);
  const [editingSection, setEditingSection] = useState<{ id: string; value: string } | null>(null);

  const authors = useAuthorsList();
  const collections = useCollectionsForFilter();
  const pools = usePoolsForFilter();
  const hierarchy = useHierarchyMulti({ materiaIds: selectedMaterias });
  const [positionEdit, setPositionEdit] = useState<{ sectionId: string; qId: string; value: string } | null>(null);
  const [viewQuestionId, setViewQuestionId] = useState<string | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionCache, setQuestionCache] = useState<Map<string, QuestionListItem>>(new Map());
  // True while the collection-members hydration below is fetching — lets the "Selezionate"
  // sidebar show a skeleton instead of the raw-id fallback for rows not yet in questionCache.
  const [isMembersLoading, setIsMembersLoading] = useState(!!collectionId);

  // After editing a question in the overlay, refresh just that row — same tab, no cross-tab
  // sync needed since the Collection editor never navigates away while the overlay is open.
  const refreshQuestionInCache = useCallback(
    async (questionId: string) => {
      try {
        const fresh = await questionsService.get(client, questionId);
        setQuestionCache((prev) => {
          const next = new Map(prev);
          next.set(questionId, {
            ...(next.get(questionId) ?? makeMinimalListItem(questionId)),
            ...fresh,
            materiaName: fresh.subjectName,
            argomentoName: fresh.topicName,
          });
          return next;
        });
      } catch {
        // Best-effort refresh — cached row just stays stale until the next list fetch.
      }
      queryClient.invalidateQueries({
        queryKey: ['questions', 'list-for-collection'],
      });
    },
    [client, queryClient]
  );

  // Edit mode: the collection load only returns questionIds (no text/materia/difficulty),
  // and the browse query above only covers whatever page/filter is currently shown on the
  // left. Backfill full details for every question already in this collection via the
  // same collectionIds filter the "Collection" browse filter already uses, so rows in the
  // "Selezionate" panel don't fall back to showing the raw id.
  useEffect(() => {
    if (!collectionId) return;
    const controller = new AbortController();

    (async () => {
      let memberPage = 1;
      let fetched = 0;
      let total = Infinity;
      while (fetched < total) {
        const res = await questionsService.listAdmin(
          client,
          {
            collectionIds: [collectionId],
            page: memberPage,
            perPage: MEMBER_HYDRATE_PAGE_SIZE,
          },
          controller.signal
        );
        if (controller.signal.aborted) return;
        total = res.total;
        fetched += res.questions.length;
        if (res.questions.length === 0) break;
        setQuestionCache((prev) => {
          const next = new Map(prev);
          res.questions.forEach((q) => next.set(q.id, q));
          return next;
        });
        memberPage += 1;
      }
    })()
      .catch((err) => {
        if ((err as Error)?.name === 'AbortError') return;
        // Best-effort hydration — rows without cached data just fall back to showing the raw id.
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsMembersLoading(false);
      });

    return () => controller.abort();
  }, [client, collectionId]);

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(value); setPage(1); }, 400);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['questions', 'list-for-collection', {
      page, search,
      statuses: selectedStatuses, types: selectedTypes, difficulties: selectedDifficulties,
      languages: selectedLanguages, materias: selectedMaterias, argomenti: selectedArgomenti,
      authors: selectedAuthors, tags: selectedTags, dateFrom, dateTo,
      collectionIds: selectedCollectionIds, collectionIdsMode: selectedCollectionIdsMode,
      poolIds: selectedPoolIds, poolIdsMode: selectedPoolIdsMode, unpublishedOnly,
    }],
    queryFn: ({ signal }) =>
      questionsService.listAdmin(client, {
        page,
        perPage: PAGE_SIZE,
        statuses: selectedStatuses.length ? selectedStatuses : undefined,
        types: selectedTypes.length ? selectedTypes : undefined,
        difficulties: selectedDifficulties.length ? selectedDifficulties : undefined,
        languages: selectedLanguages.length ? selectedLanguages : undefined,
        subjectIds: selectedMaterias.length ? selectedMaterias : undefined,
        topicIds: selectedArgomenti.length ? selectedArgomenti : undefined,
        authors: selectedAuthors.length ? selectedAuthors : undefined,
        tags: selectedTags.length ? selectedTags : undefined,
        collectionIds: selectedCollectionIds.length ? selectedCollectionIds : undefined,
        collectionIdsMode: selectedCollectionIds.length ? selectedCollectionIdsMode : undefined,
        poolIds: selectedPoolIds.length ? selectedPoolIds : undefined,
        poolIdsMode: selectedPoolIds.length ? selectedPoolIdsMode : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search.trim() || undefined,
        unpublished: unpublishedOnly || undefined,
      }, signal),
    staleTime: 2 * 60 * 1000,
  });

  const questions = data?.questions ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    if (!questions.length) return;
    setQuestionCache((prev) => {
      const next = new Map(prev);
      questions.forEach((q) => next.set(q.id, q));
      return next;
    });
  }, [questions]);

  const filtered = questions;

  const allAssignedIds = useMemo(() => {
    const set = new Set<string>();
    sections.forEach((s) => s.questionIds.forEach((id) => set.add(id)));
    return set;
  }, [sections]);

  const questionSectionIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    sections.forEach((s, idx) => s.questionIds.forEach((id) => map.set(id, idx)));
    return map;
  }, [sections]);

  // ── Section operations ──

  const addSection = useCallback(() => {
    const id = crypto.randomUUID();
    const next = [...sections, { id, name: `Sezione ${sections.length + 1}`, questionIds: [] }];
    onSectionsChange(next);
    setActiveSectionId(id);
  }, [sections, onSectionsChange]);

  const deleteSection = useCallback((sectionId: string) => {
    const next = sections.filter((s) => s.id !== sectionId);
    onSectionsChange(next);
    if (activeSectionId === sectionId) setActiveSectionId(next[0]?.id ?? null);
  }, [sections, onSectionsChange, activeSectionId]);

  const commitSectionRename = useCallback(() => {
    if (!editingSection) return;
    onSectionsChange(sections.map((s) =>
      s.id === editingSection.id ? { ...s, name: editingSection.value.trim() || s.name } : s
    ));
    setEditingSection(null);
  }, [sections, onSectionsChange, editingSection]);

  const handleSectionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = sections.findIndex((s) => s.id === active.id);
    const newIdx = sections.findIndex((s) => s.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onSectionsChange(arrayMove(sections, oldIdx, newIdx));
  }, [sections, onSectionsChange]);

  const handleQuestionDragEnd = useCallback((sectionId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const oldIdx = section.questionIds.indexOf(String(active.id));
    const newIdx = section.questionIds.indexOf(String(over.id));
    if (oldIdx === -1 || newIdx === -1) return;
    onSectionsChange(sections.map((s) =>
      s.id === sectionId ? { ...s, questionIds: arrayMove(s.questionIds, oldIdx, newIdx) } : s
    ));
  }, [sections, onSectionsChange]);

  // ── Question position manual edit ──

  const handlePositionClick = useCallback((sectionId: string, qId: string, currentIdx: number) => {
    setPositionEdit({ sectionId, qId, value: String(currentIdx + 1) });
  }, []);

  const commitPositionEdit = useCallback(() => {
    if (!positionEdit) return;
    const { sectionId, qId, value } = positionEdit;
    const section = sections.find((s) => s.id === sectionId);
    if (section) {
      const currentIdx = section.questionIds.indexOf(qId);
      const newPos = parseInt(value, 10);
      if (!isNaN(newPos) && newPos >= 1 && newPos <= section.questionIds.length && newPos - 1 !== currentIdx) {
        onSectionsChange(sections.map((s) =>
          s.id === sectionId ? { ...s, questionIds: arrayMove(s.questionIds, currentIdx, newPos - 1) } : s
        ));
      }
    }
    setPositionEdit(null);
  }, [positionEdit, sections, onSectionsChange]);

  // ── Question operations ──

  const toggleQuestion = useCallback((questionId: string) => {
    if (!activeSectionId) return;
    const ownerSection = sections.find((s) => s.questionIds.includes(questionId));
    if (ownerSection) {
      onSectionsChange(sections.map((s) =>
        s.id === ownerSection.id ? { ...s, questionIds: s.questionIds.filter((id) => id !== questionId) } : s
      ));
    } else {
      onSectionsChange(sections.map((s) =>
        s.id === activeSectionId ? { ...s, questionIds: [...s.questionIds, questionId] } : s
      ));
    }
  }, [sections, onSectionsChange, activeSectionId]);

  const removeFromSection = useCallback((sectionId: string, questionId: string) => {
    onSectionsChange(sections.map((s) =>
      s.id === sectionId ? { ...s, questionIds: s.questionIds.filter((id) => id !== questionId) } : s
    ));
  }, [sections, onSectionsChange]);

  const addAllVisible = useCallback(() => {
    if (!activeSectionId) return;
    const idsToAdd = filtered.map((q) => q.id);
    onSectionsChange(sections.map((s) => {
      if (s.id !== activeSectionId) return s;
      return { ...s, questionIds: [...new Set([...s.questionIds, ...idsToAdd])] };
    }));
  }, [activeSectionId, filtered, sections, onSectionsChange]);

  const totalSelected = sections.reduce((acc, s) => acc + s.questionIds.length, 0);
  const activeSection = sections.find((s) => s.id === activeSectionId);
  const hasFilters =
    selectedStatuses.length > 0 || selectedTypes.length > 0 || selectedDifficulties.length > 0 ||
    selectedLanguages.length > 0 || selectedMaterias.length > 0 || selectedArgomenti.length > 0 ||
    selectedAuthors.length > 0 || selectedTags.length > 0 || !!dateFrom || !!dateTo ||
    selectedCollectionIds.length > 0 || selectedPoolIds.length > 0 || unpublishedOnly;

  const resetFilters = () => {
    setSelectedStatuses([]); setSelectedTypes([]); setSelectedDifficulties([]);
    setSelectedLanguages([]); setSelectedMaterias([]); setSelectedArgomenti([]);
    setSelectedAuthors([]); setSelectedTags([]); setDateFrom(''); setDateTo('');
    setSelectedCollectionIds([]); setSelectedCollectionIdsMode('include');
    setSelectedPoolIds([]); setSelectedPoolIdsMode('include');
    setUnpublishedOnly(false);
    setPage(1);
  };

  const selectedRange: DateRange | undefined =
    dateFrom || dateTo
      ? { from: parseLocalDate(dateFrom), to: parseLocalDate(dateTo) }
      : undefined;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateFrom(range?.from ? format(range.from, 'yyyy-MM-dd') : '');
    setDateTo(range?.to ? format(range.to, 'yyyy-MM-dd') : '');
    setPage(1);
  };

  const periodLabel =
    dateFrom || dateTo ? (
      <>
        {dateFrom ? format(parseLocalDate(dateFrom)!, 'dd/MM/yy') : '…'}
        {' → '}
        {dateTo ? format(parseLocalDate(dateTo)!, 'dd/MM/yy') : '…'}
      </>
    ) : (
      <span className="text-muted-foreground">Periodo</span>
    );

  return (
    <div className="flex gap-4">
      {/* ── LEFT: questions browser ── */}
      <div className="flex flex-col gap-3 flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9"
            placeholder="Cerca per ID o testo della domanda..."
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <MultiSelect
            options={STATUS_OPTIONS}
            value={selectedStatuses}
            onChange={(v) => { setSelectedStatuses(v as QuestionStatus[]); setPage(1); }}
            placeholder="Stato"
            className="w-[150px]"
          />
          <MultiSelect
            options={TYPE_OPTIONS}
            value={selectedTypes}
            onChange={(v) => { setSelectedTypes(v as QuestionType[]); setPage(1); }}
            placeholder="Tipo"
            className="w-[150px]"
          />
          <MultiSelect
            options={authors.options}
            value={selectedAuthors}
            onChange={(v) => { setSelectedAuthors(v); setPage(1); }}
            placeholder={authors.isLoading ? 'Caricamento...' : 'Autore'}
            disabled={authors.isLoading}
            className="w-[170px]"
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="h-9 w-[190px] justify-between font-normal gap-2 text-sm border-input bg-background hover:bg-background"
              >
                <span className="truncate">{periodLabel}</span>
                <CalendarIcon className="text-muted-foreground/80 shrink-0" size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-2">
              <Calendar mode="range" selected={selectedRange} onSelect={handleDateRangeSelect} />
              {(dateFrom || dateTo) && (
                <div className="px-1 pb-1">
                  <Button variant="ghost" size="sm" className="w-full h-7 text-xs"
                    onClick={() => { setDateFrom(''); setDateTo(''); setPage(1); }}>
                    <X className="h-3 w-3 mr-1" />
                    Rimuovi periodo
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <div className="flex items-center gap-1">
            <MultiSelect
              options={hierarchy.materie.items.map((m) => ({ value: m.id, label: m.name }))}
              value={selectedMaterias}
              onChange={(v) => { setSelectedMaterias(v); setSelectedArgomenti([]); setPage(1); }}
              placeholder={hierarchy.materie.isLoading ? 'Caricamento...' : 'Materia'}
              disabled={hierarchy.materie.isLoading || !!hierarchy.materie.error}
              className="w-[170px]"
            />
            {hierarchy.materie.error && (
              <Button variant="ghost" size="icon" onClick={hierarchy.retryMaterie} title={hierarchy.materie.error}>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-1">
            <MultiSelect
              options={hierarchy.argomenti.items.map((a) => ({ value: a.id, label: a.name }))}
              value={selectedArgomenti}
              onChange={(v) => { setSelectedArgomenti(v); setPage(1); }}
              placeholder={selectedMaterias.length === 0 ? 'Argomento' : hierarchy.argomenti.isLoading ? 'Caricamento...' : 'Argomento'}
              disabled={selectedMaterias.length === 0 || hierarchy.argomenti.isLoading || !!hierarchy.argomenti.error}
              className="w-[170px]"
            />
            {selectedMaterias.length > 0 && hierarchy.argomenti.error && (
              <Button variant="ghost" size="icon" onClick={hierarchy.retryArgomenti} title={hierarchy.argomenti.error}>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
          <MultiSelect
            options={DIFFICULTY_OPTIONS}
            value={selectedDifficulties}
            onChange={(v) => { setSelectedDifficulties(v as DifficultyLevel[]); setPage(1); }}
            placeholder="Difficoltà"
            className="w-[170px]"
          />
          <MultiSelect
            options={LANGUAGE_OPTIONS}
            value={selectedLanguages}
            onChange={(v) => { setSelectedLanguages(v as QuestionLanguage[]); setPage(1); }}
            placeholder="Lingua"
            className="w-[130px]"
          />
          <MultiSelect
            options={[]}
            value={selectedTags}
            onChange={(v) => { setSelectedTags(v); setPage(1); }}
            placeholder="Tag"
            allowCreate
            className="w-[150px]"
          />
          <div className="flex items-center gap-1">
            <MultiSelect
              options={collections.options}
              value={selectedCollectionIds}
              onChange={(v) => {
                setSelectedCollectionIds(v);
                if (v.length === 0) setSelectedCollectionIdsMode('include');
                setPage(1);
              }}
              placeholder={collections.isLoading ? 'Caricamento...' : 'Collection'}
              searchPlaceholder="Cerca collection..."
              disabled={collections.isLoading}
              showSelectAll
              className="w-[200px]"
            />
            <Button
              variant={selectedCollectionIdsMode === 'exclude' ? 'destructive' : 'outline'}
              size="sm"
              className="h-9 px-2 text-xs shrink-0"
              onClick={() => setSelectedCollectionIdsMode((m) => m === 'exclude' ? 'include' : 'exclude')}
              title={selectedCollectionIdsMode === 'exclude' ? 'NON in queste collection — clicca per invertire' : 'IN queste collection — clicca per invertire'}
            >
              {selectedCollectionIdsMode === 'exclude' ? 'NON IN' : 'IN'}
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <MultiSelect
              options={pools.options}
              value={selectedPoolIds}
              onChange={(v) => {
                setSelectedPoolIds(v);
                if (v.length === 0) setSelectedPoolIdsMode('include');
                setPage(1);
              }}
              placeholder={pools.isLoading ? 'Caricamento...' : 'Pool'}
              searchPlaceholder="Cerca pool..."
              disabled={pools.isLoading}
              showSelectAll
              className="w-[200px]"
            />
            <Button
              variant={selectedPoolIdsMode === 'exclude' ? 'destructive' : 'outline'}
              size="sm"
              className="h-9 px-2 text-xs shrink-0"
              onClick={() => setSelectedPoolIdsMode((m) => m === 'exclude' ? 'include' : 'exclude')}
              title={selectedPoolIdsMode === 'exclude' ? 'NON in questi pool — clicca per invertire' : 'IN questi pool — clicca per invertire'}
            >
              {selectedPoolIdsMode === 'exclude' ? 'NON IN' : 'IN'}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="unpublished-switch"
              checked={unpublishedOnly}
              onCheckedChange={(checked) => {
                setUnpublishedOnly(checked);
                if (checked) {
                  setSelectedCollectionIds([]);
                  setSelectedCollectionIdsMode('include');
                  setSelectedPoolIds([]);
                  setSelectedPoolIdsMode('include');
                }
                setPage(1);
              }}
            />
            <Label htmlFor="unpublished-switch" className="text-sm font-medium cursor-pointer select-none">
              Inedite
            </Label>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={resetFilters}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reimposta
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {total} domande disponibili
            {allAssignedIds.size > 0 && ` · ${allAssignedIds.size} già usate`}
          </span>
          <Button variant="outline" size="sm" className="h-7 text-xs"
            disabled={!activeSectionId || filtered.length === 0} onClick={addAllVisible}>
            <Plus className="h-3 w-3" />
            Aggiungi tutte
          </Button>
        </div>

        <div className="overflow-y-auto border rounded-lg max-h-[50vh]">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/90 backdrop-blur-sm border-b z-10">
              <tr>
                <th className="w-10 px-3 py-2.5 text-left font-medium text-muted-foreground" />
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-16">ID</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground">Testo</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-28">Materia</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-32">Argomento</th>
                <th className="px-3 py-2.5 text-left font-medium text-muted-foreground w-28">Difficoltà</th>
                <th className="w-14 px-3 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Caricamento...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">Nessuna domanda trovata.</td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const sectionIdx = questionSectionIndexMap.get(q.id);
                  const isAssigned = allAssignedIds.has(q.id);
                  const sectionColor = sectionIdx !== undefined ? getSectionColor(sectionIdx) : undefined;
                  return (
                    <tr
                      key={q.id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      style={{ borderLeft: sectionColor ? `3px solid ${sectionColor}` : '3px solid transparent' }}
                      onClick={() => toggleQuestion(q.id)}
                    >
                      <td className="px-3 py-2.5">
                        <div className={cn('h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0', isAssigned ? 'bg-primary border-primary' : 'border-muted-foreground/40 bg-background')}>
                          {isAssigned && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">{q.id.slice(-6).toUpperCase()}</td>
                      <td className="px-3 py-2.5">
                        <RichQuestionText
                          html={q.questionText}
                          className="text-sm line-clamp-2 leading-snug"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{q.materiaName}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{q.argomentoName}</td>
                      <td className="px-3 py-2.5 text-xs text-muted-foreground">{DIFFICULTY_LABELS[q.difficulty]}</td>
                      <td className="px-3 py-2.5">
                        <button
                          className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors"
                          title="Modifica domanda"
                          onClick={(e) => { e.stopPropagation(); setEditingQuestionId(q.id); }}
                        >
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <ListPagination page={page} total={total} perPage={PAGE_SIZE} onPageChange={setPage} />
      </div>

      {/* ── RIGHT: sections manager ── */}
      <div className={cn('flex flex-col gap-3 shrink-0 transition-all duration-200', isPanelExpanded ? 'w-[560px]' : 'w-72')}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Selezionate ({totalSelected})
          </span>
          <div className="flex items-center gap-1.5">
          {activeSection && (
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: getSectionColor(sections.findIndex((s) => s.id === activeSectionId)),
                background: `${getSectionColor(sections.findIndex((s) => s.id === activeSectionId))}18`,
              }}
            >
              {activeSection.name}
            </span>
          )}
          <button
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground"
            title={isPanelExpanded ? 'Riduci colonna' : 'Espandi colonna'}
            onClick={() => setIsPanelExpanded((v) => !v)}
          >
            {isPanelExpanded
              ? <ChevronsRight className="h-3.5 w-3.5" />
              : <ChevronsLeft className="h-3.5 w-3.5" />}
          </button>
          </div>
        </div>

        <div className="overflow-y-auto space-y-2 max-h-[50vh] pr-0.5">
          {sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
              <p>Nessuna sezione creata.</p>
              <p className="text-xs mt-1">Aggiungi una sezione per iniziare.</p>
            </div>
          ) : (
            <DndContext
              sensors={sectionSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                {sections.map((section, idx) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    idx={idx}
                    isActive={section.id === activeSectionId}
                    isCollapsed={collapsedSections.has(section.id)}
                    editingSection={editingSection}
                    positionEdit={positionEdit}
                    questionCache={questionCache}
                    isLoadingDetails={isMembersLoading}
                    onActivate={setActiveSectionId}
                    onToggleCollapse={toggleCollapse}
                    onRenameStart={(id, name) => setEditingSection({ id, value: name })}
                    onRenameChange={(value) => setEditingSection((prev) => prev ? { ...prev, value } : prev)}
                    onRenameCommit={commitSectionRename}
                    onRenameCancel={() => setEditingSection(null)}
                    onDelete={deleteSection}
                    onQuestionDragEnd={handleQuestionDragEnd}
                    onPositionClick={handlePositionClick}
                    onPositionChange={(value) => setPositionEdit((prev) => prev ? { ...prev, value } : prev)}
                    onPositionCommit={commitPositionEdit}
                    onView={setViewQuestionId}
                    onEdit={setEditingQuestionId}
                    onRemove={removeFromSection}
                  />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        <Button variant="outline" size="sm" className="w-full" onClick={addSection}>
          <Plus className="h-4 w-4" />
          Aggiungi sezione
        </Button>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={onBack}>Indietro</Button>
          <Button size="sm" className="flex-1" disabled={totalSelected === 0 || sections.length === 0} onClick={onContinue}>
            Continua
          </Button>
        </div>
      </div>

      <QuestionsViewDialog
        question={viewQuestionId ? (questionCache.get(viewQuestionId) ?? makeMinimalListItem(viewQuestionId)) : null}
        onClose={() => setViewQuestionId(null)}
      />

      {editingQuestionId && (
        <QuestionEditOverlay
          questionId={editingQuestionId}
          onClose={() => setEditingQuestionId(null)}
          onSaved={() => refreshQuestionInCache(editingQuestionId)}
        />
      )}
    </div>
  );
}
