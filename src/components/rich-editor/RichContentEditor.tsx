import { useCallback, useRef, useState } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useInsertSnippet } from '@/lib/hooks/useInsertSnippet';
import { EditorToolbar, type AvailableImage } from './EditorToolbar';
import { MathKeyboard } from './MathKeyboard';
import { TableConfigDialog } from './TableConfigDialog';

interface RichContentEditorProps {
  mode: 'full' | 'compact';
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  minRows?: number;
  textareaClassName?: string;
  availableImages?: AvailableImage[];
}

export function RichContentEditor({
  mode,
  value,
  onChange,
  label,
  required = false,
  placeholder,
  disabled = false,
  minRows = 4,
  textareaClassName,
  availableImages,
}: RichContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  const insertSnippet = useInsertSnippet({ textareaRef, value, onChange, disabled });

  const handleKeyboardInsert = useCallback(
    (latex: string) => insertSnippet(latex, ''),
    [insertSnippet]
  );

  const handleTableInsert = useCallback(
    (latex: string) => insertSnippet(latex, ''),
    [insertSnippet]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      if (e.key === 'b') {
        e.preventDefault();
        insertSnippet('<b>', '</b>', 'testo');
      } else if (e.key === 'i') {
        e.preventDefault();
        insertSnippet('<em>', '</em>', 'testo');
      }
    },
    [insertSnippet, disabled]
  );

  return (
    <div className={mode === 'full' ? 'space-y-2' : 'space-y-1'}>
      {label && (
        <Label>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </Label>
      )}

      <TooltipProvider delayDuration={300}>
        <EditorToolbar
          disabled={disabled}
          onInsertSnippet={insertSnippet}
          showKeyboard={showKeyboard}
          onToggleKeyboard={() => setShowKeyboard((v) => !v)}
          onTableInsert={() => setShowTableDialog(true)}
          availableImages={availableImages}
          hasUnreferencedImages={availableImages?.some((img) => !value.includes(`&&${img.id}&&`))}
        />
      </TooltipProvider>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={minRows}
        className={cn('font-mono text-sm', textareaClassName)}
      />

      {showKeyboard && <MathKeyboard onInsert={handleKeyboardInsert} disabled={disabled} />}

      <TableConfigDialog
        open={showTableDialog}
        onOpenChange={setShowTableDialog}
        onInsert={handleTableInsert}
      />
    </div>
  );
}
