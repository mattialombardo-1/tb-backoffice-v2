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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Test } from '@/lib/types/tests';

interface TestsReorderListProps {
  items: Test[];
  onChange: (items: Test[]) => void;
}

interface TestReorderItemProps {
  test: Test;
}

function TestReorderItem({ test }: TestReorderItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: test.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 rounded-lg border bg-card px-4 py-3 transition-all',
        isDragging ? 'opacity-50 shadow-lg' : 'hover:border-border/80'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing shrink-0"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Name */}
      <span className="flex-1 font-medium text-sm">{test.name}</span>

      {/* Year */}
      {test.year != null && (
        <span className="text-sm text-muted-foreground shrink-0">{test.year}</span>
      )}

      {/* Brand badges */}
      {test.brands.length > 0 && (
        <div className="flex gap-1 shrink-0">
          {test.brands.map((brand) => (
            <span
              key={brand.id}
              className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium"
            >
              {brand.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TestsReorderList({ items, onChange }: TestsReorderListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((t) => t.id === active.id);
    const newIndex = items.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    onChange(reordered);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((test) => (
            <TestReorderItem key={test.id} test={test} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
