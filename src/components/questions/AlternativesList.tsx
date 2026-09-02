import { useTranslation } from 'react-i18next';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlternativeItem } from './AlternativeItem';
import type { Alternative, AlternativeStyle } from '@/lib/types/questions';
import { ALTERNATIVE_STYLE_LABELS } from '@/lib/types/questions';
import type { AvailableImage } from '@/components/rich-editor/EditorToolbar';

interface AlternativesListProps {
  alternatives: Alternative[];
  onChange: (alternatives: Alternative[]) => void;
  altStyle: AlternativeStyle;
  onAltStyleChange: (style: AlternativeStyle) => void;
  disabled?: boolean;
  availableImages?: AvailableImage[];
}

const MAX_ALTERNATIVES = 15;
const MIN_ALTERNATIVES = 2;

const STYLE_KEYS = Object.keys(ALTERNATIVE_STYLE_LABELS) as AlternativeStyle[];

function getOrdinalLabel(index: number, style: AlternativeStyle): string {
  if (style === 'alpha') {
    return String.fromCharCode(65 + index); // A, B, C, ...
  }
  return String(index + 1); // 1, 2, 3, ...
}

export function AlternativesList({
  alternatives,
  onChange,
  altStyle,
  onAltStyleChange,
  disabled = false,
  availableImages,
}: AlternativesListProps) {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = alternatives.findIndex((a) => a.id === active.id);
    const newIndex = alternatives.findIndex((a) => a.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...alternatives];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onChange(reordered.map((a, i) => ({ ...a, order: i })));
  };

  const addAlternative = () => {
    if (alternatives.length >= MAX_ALTERNATIVES) return;
    onChange([
      ...alternatives,
      {
        id: crypto.randomUUID(),
        text: '',
        isCorrect: false,
        order: alternatives.length,
      },
    ]);
  };

  const updateText = (id: string, text: string) => {
    onChange(alternatives.map((a) => (a.id === id ? { ...a, text } : a)));
  };

  const updateImage = (id: string, image: string | undefined, imageViewUrl?: string) => {
    onChange(alternatives.map((a) => (a.id === id ? { ...a, image, imageViewUrl } : a)));
  };

  // Single-correct: only one alternative can be marked correct at a time (radio behavior)
  const setCorrect = (id: string) => {
    onChange(alternatives.map((a) => ({ ...a, isCorrect: a.id === id })));
  };

  const removeAlternative = (id: string) => {
    if (alternatives.length <= MIN_ALTERNATIVES) return;
    const filtered = alternatives.filter((a) => a.id !== id);
    onChange(filtered.map((a, i) => ({ ...a, order: i })));
  };

  return (
    <div className="flex flex-col space-y-4">
      <Label>
        {t('questions.alternatives.label')}
        <span className="ml-0.5 text-destructive">*</span>
      </Label>

      {/* Alternative style tabs */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{t('questions.alternatives.altStyleLabel')}</Label>
        <Tabs value={altStyle} onValueChange={(v) => onAltStyleChange(v as AlternativeStyle)}>
          <TabsList>
            {STYLE_KEYS.map((s) => (
              <TabsTrigger key={s} value={s} disabled={disabled}>
                {ALTERNATIVE_STYLE_LABELS[s]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Alternatives list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={alternatives.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {alternatives.map((alt, idx) => (
              <AlternativeItem
                key={alt.id}
                alternative={alt}
                ordinalLabel={getOrdinalLabel(idx, altStyle)}
                onTextChange={(text) => updateText(alt.id, text)}
                onCorrectToggle={() => setCorrect(alt.id)}
                onDelete={() => removeAlternative(alt.id)}
                onImageChange={(image, viewUrl) => updateImage(alt.id, image, viewUrl)}
                disabled={disabled}
                canDelete={alternatives.length > MIN_ALTERNATIVES}
                availableImages={availableImages}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addAlternative}
        disabled={disabled || alternatives.length >= MAX_ALTERNATIVES}
      >
        <Plus className="mr-1 h-4 w-4" />
        {t('questions.alternatives.add')}
        {alternatives.length >= MAX_ALTERNATIVES && ` ${t('questions.alternatives.maxReached')}`}
      </Button>
    </div>
  );
}
