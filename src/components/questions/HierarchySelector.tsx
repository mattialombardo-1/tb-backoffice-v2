import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchableCombobox } from '@/components/ui/searchable-combobox';
import type { useHierarchy } from '@/lib/hooks/useHierarchy';

type HierarchyState = ReturnType<typeof useHierarchy>;

interface HierarchySelectorProps {
  hierarchy: HierarchyState;
  disabled?: boolean;
}

export function HierarchySelector({ hierarchy, disabled = false }: HierarchySelectorProps) {
  const { t } = useTranslation();
  const {
    selection,
    materie,
    argomenti,
    sottoArgomenti,
    setMateria,
    setArgomento,
    setSottoArgomento,
  } = hierarchy;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Materia */}
      <div className="space-y-2">
        <Label>
          {t('questions.hierarchy.subjectLabel')}
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        {materie.isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : materie.error ? (
          <p className="text-sm text-destructive">{materie.error}</p>
        ) : (
          <SearchableCombobox
            value={selection.subjectId}
            onChange={(id) => setMateria(id, materie.items.find((m) => m.id === id)?.name)}
            options={materie.items.map((m) => ({ value: m.id, label: m.name }))}
            placeholder="Seleziona materia"
            searchPlaceholder="Cerca materia..."
            disabled={disabled}
          />
        )}
      </div>

      {/* Argomento */}
      <div className="space-y-2">
        <Label>
          {t('questions.hierarchy.topicLabel')}
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
        {argomenti.isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : !selection.subjectId ? (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={t('questions.hierarchy.selectTopicFirst')} />
            </SelectTrigger>
            <SelectContent />
          </Select>
        ) : argomenti.error ? (
          <p className="text-sm text-destructive">{argomenti.error}</p>
        ) : (
          <Select
            value={selection.topicId ?? ''}
            onValueChange={(v) => setArgomento(v || null)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('questions.hierarchy.selectTopic')} />
            </SelectTrigger>
            <SelectContent>
              {argomenti.items.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Sotto-argomento */}
      <div className="space-y-2">
        <Label>{t('questions.hierarchy.subtopicLabel')}</Label>
        {sottoArgomenti.isLoading ? (
          <Skeleton className="h-9 w-full" />
        ) : !selection.topicId ? (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={t('questions.hierarchy.selectSubtopicFirst')} />
            </SelectTrigger>
            <SelectContent />
          </Select>
        ) : sottoArgomenti.error ? (
          <p className="text-sm text-destructive">{sottoArgomenti.error}</p>
        ) : (
          <Select
            value={selection.sottoArgomentoId ?? ''}
            onValueChange={(v) => setSottoArgomento(v || null)}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('questions.hierarchy.selectSubtopic')} />
            </SelectTrigger>
            <SelectContent>
              {sottoArgomenti.items.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
