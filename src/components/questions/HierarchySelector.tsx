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
import { slugify } from '@/lib/utils';

type HierarchyState = ReturnType<typeof useHierarchy>;

/** A fixed label to show in the Materia list; only `enabled` ones are actually selectable. */
export interface FixedMateriaOption {
  label: string;
  enabled?: boolean;
}

interface FieldProps {
  hierarchy: HierarchyState;
  disabled?: boolean;
  /** Omit the built-in label — use when an outer section (e.g. an accordion) already names this field. */
  hideLabel?: boolean;
  /** Fires right after a real selection is made (not on clear/deselect). */
  onSelected?: () => void;
  /** Apre/chiude il menu a tendina da fuori — es. cliccando il tag di riepilogo a
   *  sezione chiusa. Non controlla il campo in modo permanente: onOpenChange(false)
   *  arriva anche dalla chiusura naturale (selezione, click fuori, Escape). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface MateriaFieldProps extends FieldProps {
  /**
   * Design-exploration override: show exactly this list of labels instead of the live
   * subject list. A label with `enabled: true` still needs a matching real subject name
   * to be selectable — the rest render greyed out as coming-soon placeholders.
   */
  fixedOptions?: FixedMateriaOption[];
}

export function MateriaField({
  hierarchy,
  disabled = false,
  hideLabel = false,
  fixedOptions,
  onSelected,
  open,
  onOpenChange,
}: MateriaFieldProps) {
  const { t } = useTranslation();
  const { selection, materie, setMateria } = hierarchy;

  const options = fixedOptions
    ? fixedOptions.map(({ label, enabled }) => {
        const match = materie.items.find((m) => m.name.toLowerCase() === label.toLowerCase());
        return {
          value: enabled && match ? match.id : `__placeholder__${label}`,
          label,
          disabled: !(enabled && match),
        };
      })
    : materie.items.map((m) => ({ value: m.id, label: m.name }));

  return (
    <div className="flex flex-col gap-3">
      {!hideLabel && (
        <Label>
          {t('questions.hierarchy.subjectLabel')}
          <span className="ml-0.5 text-destructive">*</span>
        </Label>
      )}
      {materie.isLoading ? (
        <Skeleton className="h-9 w-full" />
      ) : materie.error ? (
        <p className="text-sm text-destructive">{materie.error}</p>
      ) : (
        <SearchableCombobox
          value={selection.subjectId}
          onChange={(id) => {
            setMateria(id, materie.items.find((m) => m.id === id)?.name);
            if (id) onSelected?.();
          }}
          options={options}
          placeholder="Seleziona materia"
          searchPlaceholder="Cerca materia..."
          disabled={disabled}
          open={open}
          onOpenChange={onOpenChange}
        />
      )}
    </div>
  );
}

interface ArgomentoFieldProps extends FieldProps {
  /**
   * Design-exploration override: a fixed, fully-selectable list of labels, searchable
   * like Materia, replacing the live topic list (which depends on real backend data).
   */
  fixedOptions?: string[];
}

export function ArgomentoField({
  hierarchy,
  disabled = false,
  hideLabel = false,
  fixedOptions,
  onSelected,
  open,
  onOpenChange,
}: ArgomentoFieldProps) {
  const { t } = useTranslation();
  const { selection, argomenti, setArgomento } = hierarchy;

  const label = !hideLabel && (
    <Label>
      {t('questions.hierarchy.topicLabel')}
      <span className="ml-0.5 text-destructive">*</span>
    </Label>
  );

  if (fixedOptions) {
    const options = fixedOptions.map((l) => ({ value: `__fixed__${slugify(l)}`, label: l }));
    return (
      <div className="flex flex-col gap-3">
        {label}
        {!selection.subjectId ? (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={t('questions.hierarchy.selectTopicFirst')} />
            </SelectTrigger>
            <SelectContent />
          </Select>
        ) : (
          <SearchableCombobox
            value={selection.topicId}
            onChange={(id) => {
              setArgomento(id, options.find((o) => o.value === id)?.label);
              if (id) onSelected?.();
            }}
            options={options}
            placeholder="Seleziona argomento"
            searchPlaceholder="Cerca argomento..."
            disabled={disabled}
            open={open}
            onOpenChange={onOpenChange}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {label}
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
          onValueChange={(v) => {
            setArgomento(v || null);
            if (v) onSelected?.();
          }}
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
  );
}

interface SottoArgomentoFieldProps extends FieldProps {
  /**
   * Design-exploration override: sottoargomenti fissi, filtrati in base
   * all'argomento scelto (chiave = etichetta esatta dell'Argomento). Un
   * argomento assente dalla mappa (es. "Altro") non ha sottoargomenti.
   */
  fixedOptionsByArgomento?: Record<string, string[]>;
}

const NONE_VALUE = '__none__';

export function SottoArgomentoField({
  hierarchy,
  disabled = false,
  hideLabel = false,
  onSelected,
  fixedOptionsByArgomento,
  open,
  onOpenChange,
}: SottoArgomentoFieldProps) {
  const { t } = useTranslation();
  const { selection, sottoArgomenti, setSottoArgomento } = hierarchy;

  const label = !hideLabel && <Label>{t('questions.hierarchy.subtopicLabel')}</Label>;

  if (fixedOptionsByArgomento) {
    const subtopics = selection.topicName
      ? (fixedOptionsByArgomento[selection.topicName] ?? [])
      : [];
    const options = [
      { value: NONE_VALUE, label: 'Nessuno' },
      ...subtopics.map((s) => ({ value: `__fixed__${slugify(s)}`, label: s })),
    ];
    return (
      <div className="flex flex-col gap-3">
        {label}
        {!selection.topicId ? (
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder={t('questions.hierarchy.selectSubtopicFirst')} />
            </SelectTrigger>
            <SelectContent />
          </Select>
        ) : (
          <SearchableCombobox
            value={selection.sottoArgomentoId}
            onChange={(id) => {
              setSottoArgomento(id === NONE_VALUE ? null : id);
              if (id) onSelected?.();
            }}
            options={options}
            placeholder="Seleziona sottoargomento"
            searchPlaceholder="Cerca sottoargomento..."
            disabled={disabled}
            open={open}
            onOpenChange={onOpenChange}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {label}
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
          onValueChange={(v) => {
            setSottoArgomento(v || null);
            if (v) onSelected?.();
          }}
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
  );
}

interface HierarchySelectorProps {
  hierarchy: HierarchyState;
  disabled?: boolean;
}

/** Materia + Argomento + Sotto-argomento side by side — used by the edit screen. */
export function HierarchySelector({ hierarchy, disabled = false }: HierarchySelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <MateriaField hierarchy={hierarchy} disabled={disabled} />
      <ArgomentoField hierarchy={hierarchy} disabled={disabled} />
      <SottoArgomentoField hierarchy={hierarchy} disabled={disabled} />
    </div>
  );
}
