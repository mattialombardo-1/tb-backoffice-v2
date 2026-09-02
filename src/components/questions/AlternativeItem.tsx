import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Check, Circle, ImageIcon, Loader2, X, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichContentEditor } from '@/components/rich-editor';
import type { AvailableImage } from '@/components/rich-editor/EditorToolbar';
import { cn } from '@/lib/utils';
import type { Alternative } from '@/lib/types/questions';
import { useApiClient } from '@/lib/api/useApiClient';
import { questionImagesService } from '@/lib/services/questionImages';
import { ImageBrowserDialog } from './ImageBrowserDialog';

interface AlternativeItemProps {
  alternative: Alternative;
  ordinalLabel: string;
  onTextChange: (text: string) => void;
  onCorrectToggle: () => void;
  onDelete: () => void;
  onImageChange?: (storageUrl: string | undefined, viewUrl?: string) => void;
  disabled?: boolean;
  canDelete: boolean;
  availableImages?: AvailableImage[];
}

export function AlternativeItem({
  alternative,
  ordinalLabel,
  onTextChange,
  onCorrectToggle,
  onDelete,
  onImageChange,
  disabled = false,
  canDelete,
  availableImages,
}: AlternativeItemProps) {
  const { t } = useTranslation();
  const client = useApiClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imgBrowserOpen, setImgBrowserOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: alternative.id,
    disabled,
  });

  const handleAltImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsUploading(true);
    try {
      const entry = await questionImagesService.uploadImage(client, file);
      onImageChange?.(entry.storageUrl, entry.viewUrl);
    } catch {
      // silently fail — user can retry
    } finally {
      setIsUploading(false);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isCorrect = alternative.isCorrect;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-start gap-3 rounded-lg border bg-card p-3 transition-all',
        isDragging && 'opacity-50',
        isCorrect
          ? 'border-2 border-emerald-600 dark:border-emerald-500'
          : 'border-border hover:border-border/80'
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="mt-3 cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Ordinal label + correct answer toggle */}
      <div className="flex shrink-0 flex-col mt-2 items-center gap-1">
        <button
          type="button"
          onClick={onCorrectToggle}
          disabled={disabled}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-all',
            isCorrect
              ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500'
              : 'border-2 border-muted-foreground/30 text-transparent hover:border-muted-foreground/60'
          )}
          title={isCorrect ? t('questions.alternatives.correctTitle') : t('questions.alternatives.markCorrect')}
        >
          {isCorrect ? (
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          ) : (
            <Circle className="h-2 w-2" />
          )}
        </button>
        <span className="text-sm mt-2 font-semibold text-muted-foreground">{ordinalLabel}.</span>
      </div>

      {/* Rich text editor + image */}
      <div className="flex-1 space-y-2">
        <RichContentEditor
          mode="compact"
          value={alternative.text}
          onChange={onTextChange}
          placeholder={t('questions.alternatives.placeholder', { ordinal: ordinalLabel })}
          disabled={disabled}
          minRows={2}
          availableImages={availableImages}
        />

        {/* Standalone alternative image */}
        {alternative.image ? (
          <div className="flex items-center gap-2">
            <img
              src={alternative.imageViewUrl ?? alternative.image}
              alt="immagine alternativa"
              className="h-16 w-16 rounded object-cover border"
            />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground/40 hover:text-destructive"
                onClick={() => onImageChange?.(undefined)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          !disabled && (
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <ImageIcon className="mr-1 h-3 w-3" />
                )}
                Immagine
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                disabled={isUploading}
                onClick={() => setImgBrowserOpen(true)}
              >
                <FolderOpen className="mr-1 h-3 w-3" />
                Sfoglia
              </Button>
            </div>
          )
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAltImageUpload}
        />
        <ImageBrowserDialog
          open={imgBrowserOpen}
          onOpenChange={setImgBrowserOpen}
          onSelect={(entry) => onImageChange?.(entry.storageUrl, entry.viewUrl)}
        />
      </div>

      {/* Delete button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={disabled || !canDelete}
        className="mt-1 text-muted-foreground/40 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
