import { useMemo } from 'react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { KEYBOARD_SECTIONS, type KeyboardKey } from './constants';
import { tryRenderKatex } from './latex-utils';

interface MathKeyboardProps {
  onInsert: (latex: string) => void;
  disabled?: boolean;
  className?: string;
}

function KeyButton({
  keyDef,
  onInsert,
  disabled,
}: {
  keyDef: KeyboardKey;
  onInsert: (latex: string) => void;
  disabled?: boolean;
}) {
  const renderedDisplay = useMemo(() => {
    if (keyDef.displayIsLatex) {
      return tryRenderKatex(keyDef.display, false);
    }
    return null;
  }, [keyDef.display, keyDef.displayIsLatex]);

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md border bg-background text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50'
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        onInsert(keyDef.latex);
      }}
      aria-label={keyDef.latex}
    >
      {renderedDisplay ? (
        <span
          className="pointer-events-none [&_.katex]:text-xs"
          dangerouslySetInnerHTML={{ __html: renderedDisplay }}
        />
      ) : (
        <span className="font-mono text-xs">{keyDef.display}</span>
      )}
    </button>
  );
}

export function MathKeyboard({ onInsert, disabled, className }: MathKeyboardProps) {
  return (
    <div className={cn('w-full rounded-md border bg-muted/30 p-2', className)}>
      {KEYBOARD_SECTIONS.map((section, i) => (
        <div key={section.id}>
          {i > 0 && <Separator className="my-2" />}
          <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {section.label}
          </p>
          <div className="flex flex-wrap gap-1">
            {section.keys.map((key, j) => (
              <KeyButton
                key={`${section.id}-${key.latex}-${j}`}
                keyDef={key}
                onInsert={onInsert}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
