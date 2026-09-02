import { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Check, Loader2, RotateCcw, ListPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionsService } from '@/lib/services/questions';
import { poolsService } from '@/lib/services/pools';
import { useHierarchyMulti } from '@/lib/hooks/useHierarchyMulti';
import {
  DIFFICULTY_LABELS,
  LANGUAGE_LABELS,
  QUESTION_TYPE_LABELS,
} from '@/lib/types/questions';
import type {
  DifficultyLevel,
  QuestionLanguage,
  QuestionListItem,
  QuestionType,
} from '@/lib/types/questions';
import { cn } from '@/lib/utils';

const DIFFICULTY_CONFIG: Record<string, { className: string }> = {
  facile: { className: 'border-emerald-500 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  medio_facile: { className: 'border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300' },
  medio: { className: 'border-amber-500 bg-amber-100 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  medio_difficile: { className: 'border-violet-500 bg-violet-100 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300' },
  difficile: { className: 'border-rose-500 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300' },
  non_ancora_valutata: { className: 'border-zinc-400 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400' },
};

const DIFFICULTY_OPTIONS = (Object.keys(DIFFICULTY_LABELS) as DifficultyLevel[]).map((d) => ({
  value: d,
  label: DIFFICULTY_LABELS[d],
}));

const TYPE_OPTIONS = (Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => ({
  value: t,
  label: QUESTION_TYPE_LABELS[t],
}));

const LANGUAGE_OPTIONS = (Object.keys(LANGUAGE_LABELS) as QuestionLanguage[]).map((l) => ({
  value: l,
  label: LANGUAGE_LABELS[l],
}));

const PER_PAGE = 20;

interface Filters {
  search: string;
  subjectIds: string[];
  topicIds: string[];
  difficulties: DifficultyLevel[];
  types: QuestionType[];
  languages: QuestionLanguage[];
  page: number;
}

const INITIAL_FILTERS: Filters = {
  search: '',
  subjectIds: [],
  topicIds: [],
  difficulties: [],
  types: [],
  languages: [],
  page: 1,
};

interface PoolQuestionsPickerContentProps {
  poolId: string;
  onAdded: () => void;
}

export function PoolQuestionsPickerContent({ poolId, onAdded }: PoolQuestionsPickerContentProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkAdding, setBulkAdding] = useState(false);

  const hierarchy = useHierarchyMulti({ materiaIds: filters.subjectIds });

  const queryKey = [
    'questions', 'list', 'pool-picker',
    filters.search, filters.subjectIds, filters.topicIds, filters.difficulties,
    filters.types, filters.languages, filters.page,
  ];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: ({ signal }) =>
      questionsService.list(
        client,
        {
          search: filters.search.trim() || undefined,
          subjectIds: filters.subjectIds.length ? filters.subjectIds : undefined,
          topicIds: filters.topicIds.length ? filters.topicIds : undefined,
          difficulties: filters.difficulties.length ? filters.difficulties : undefined,
          types: filters.types.length ? filters.types : undefined,
          languages: filters.languages.length ? filters.languages : undefined,
          statuses: ['ACTIVE'],
          page: filters.page,
          perPage: PER_PAGE,
        },
        signal
      ),
    staleTime: 30_000,
  });

  const questions: QuestionListItem[] = data?.questions ?? [];

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const patch = (p: Partial<Filters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...p };
      if (!('page' in p)) next.page = 1;
      return next;
    });
  };

  const hasFilters =
    filters.search.trim().length > 0 ||
    filters.subjectIds.length > 0 ||
    filters.topicIds.length > 0 ||
    filters.difficulties.length > 0 ||
    filters.types.length > 0 ||
    filters.languages.length > 0;

  const handleAdd = async (question: QuestionListItem) => {
    const qid = question.id;
    setLoadingIds((s) => new Set(s).add(qid));
    try {
      await poolsService.addQuestion(client, poolId, qid);
      setAddedIds((s) => new Set(s).add(qid));
      toast.success(t('pools.questions.picker.addSuccess'));
      onAdded();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.toLowerCase().includes('409') || msg.toLowerCase().includes('already')) {
        toast.info(t('pools.questions.picker.alreadyInPool'));
        setAddedIds((s) => new Set(s).add(qid));
      } else {
        toast.error(msg || t('pools.questions.picker.addError'));
      }
    } finally {
      setLoadingIds((s) => {
        const next = new Set(s);
        next.delete(qid);
        return next;
      });
    }
  };

  const handleBulkAdd = async () => {
    setBulkAdding(true);
    setBulkConfirmOpen(false);
    try {
      const allIds: string[] = [];
      let page = 1;
      while (true) {
        const result = await questionsService.list(client, {
          search: filters.search.trim() || undefined,
          subjectIds: filters.subjectIds.length ? filters.subjectIds : undefined,
          topicIds: filters.topicIds.length ? filters.topicIds : undefined,
          difficulties: filters.difficulties.length ? filters.difficulties : undefined,
          types: filters.types.length ? filters.types : undefined,
          languages: filters.languages.length ? filters.languages : undefined,
          statuses: ['ACTIVE'],
          page,
          perPage: 100,
        });
        result.questions.forEach((q) => allIds.push(q.id));
        if (allIds.length >= result.total || result.questions.length === 0) break;
        page++;
      }

      const { added, alreadyIn, notFound } = await poolsService.bulkAddQuestions(client, poolId, allIds);
      const failed = notFound;

      setAddedIds((s) => new Set([...s, ...allIds]));
      onAdded();

      if (failed > 0) {
        toast.warning(t('pools.questions.picker.bulkWarning', { added, alreadyIn, failed }));
      } else if (alreadyIn > 0) {
        toast.success(t('pools.questions.picker.bulkPartial', { added, alreadyIn }));
      } else {
        toast.success(t('pools.questions.picker.bulkSuccess', { added }));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('pools.questions.picker.bulkError'));
    } finally {
      setBulkAdding(false);
    }
  };

  const argomentiOptions = hierarchy.argomenti.items.map((a) => ({
    value: a.id,
    label: a.name,
  }));

  return (
    <>
      <div className="flex-1 flex flex-col min-h-0">
        {/* Filters */}
        <div className="border-b px-6 py-4 space-y-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('pools.questions.picker.search')}
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
              className="pl-8"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <MultiSelect
              options={hierarchy.materie.items.map((m) => ({ value: m.id, label: m.name }))}
              value={filters.subjectIds}
              onChange={(vals) => patch({ subjectIds: vals, topicIds: [] })}
              placeholder={hierarchy.materie.isLoading ? t('pools.loading') : t('pools.questions.filters.subject')}
              disabled={hierarchy.materie.isLoading}
              className="w-[180px]"
            />
            <MultiSelect
              options={argomentiOptions}
              value={filters.topicIds}
              onChange={(v) => patch({ topicIds: v })}
              placeholder={t('pools.questions.filters.topic')}
              disabled={filters.subjectIds.length === 0 || hierarchy.argomenti.isLoading}
              className="w-[180px]"
            />
            <MultiSelect
              options={DIFFICULTY_OPTIONS}
              value={filters.difficulties}
              onChange={(v) => patch({ difficulties: v as DifficultyLevel[] })}
              placeholder={t('pools.questions.filters.difficulty')}
              className="w-[160px]"
            />
            <MultiSelect
              options={TYPE_OPTIONS}
              value={filters.types}
              onChange={(v) => patch({ types: v as QuestionType[] })}
              placeholder={t('pools.questions.filters.type')}
              className="w-[160px]"
            />
            <MultiSelect
              options={LANGUAGE_OPTIONS}
              value={filters.languages}
              onChange={(v) => patch({ languages: v as QuestionLanguage[] })}
              placeholder={t('pools.questions.filters.language')}
              className="w-[120px]"
            />
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => patch({ search: '', subjectIds: [], topicIds: [], difficulties: [], types: [], languages: [] })}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                {t('pools.filters.reset')}
              </Button>
            )}
            {hasFilters && total > 0 && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setBulkConfirmOpen(true)}
                disabled={bulkAdding || isLoading}
              >
                {bulkAdding ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <ListPlus className="h-3.5 w-3.5 mr-1.5" />
                )}
                {t('pools.questions.picker.addAll', { count: total.toLocaleString('it-IT') })}
              </Button>
            )}
          </div>
        </div>

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-7 w-20 shrink-0" />
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm text-muted-foreground">{t('pools.questions.picker.noResults')}</p>
            </div>
          ) : (
            <div className="divide-y">
              {questions.map((q) => {
                const isAdded = addedIds.has(q.id);
                const isLoadingThis = loadingIds.has(q.id);
                const diffConfig = DIFFICULTY_CONFIG[q.difficulty] ?? DIFFICULTY_CONFIG['non_ancora_valutata'];

                return (
                  <div
                    key={q.id}
                    className={cn(
                      'flex items-start gap-3 px-6 py-3 transition-colors',
                      isAdded && 'bg-muted/40'
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm line-clamp-2 leading-snug">{q.questionText}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{q.materiaName}</span>
                        {q.argomentoName && (
                          <span className="text-xs text-muted-foreground">· {q.argomentoName}</span>
                        )}
                        <Badge variant="outline" className={cn('text-xs px-1.5 py-0', diffConfig.className)}>
                          {DIFFICULTY_LABELS[q.difficulty]}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {QUESTION_TYPE_LABELS[q.type]}
                        </span>
                        {q.language === 'EN-en' && (
                          <span className="text-xs text-muted-foreground uppercase">EN</span>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={isAdded ? 'secondary' : 'outline'}
                      className="shrink-0 h-7 text-xs"
                      onClick={() => !isAdded && handleAdd(q)}
                      disabled={isAdded || isLoadingThis}
                    >
                      {isLoadingThis ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isAdded ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          {t('pools.questions.picker.added')}
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          {t('pools.questions.picker.add')}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PER_PAGE && (
          <div className="border-t px-6 py-3 flex items-center justify-between text-sm shrink-0">
            <span className="text-muted-foreground">
              {t('pools.questions.picker.pageInfo', { total: total.toLocaleString('it-IT'), page: filters.page, totalPages })}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ page: filters.page - 1 })}
                disabled={filters.page <= 1}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => patch({ page: filters.page + 1 })}
                disabled={filters.page >= totalPages}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={bulkConfirmOpen} onOpenChange={setBulkConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('pools.questions.picker.bulkConfirmTitle')}</DialogTitle>
            <DialogDescription asChild>
              <span>
                <Trans
                  i18nKey="pools.questions.picker.bulkConfirmDesc"
                  values={{ count: total.toLocaleString('it-IT') }}
                  components={{ strong: <strong /> }}
                />
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkConfirmOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleBulkAdd}>
              {t('pools.questions.picker.bulkConfirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
