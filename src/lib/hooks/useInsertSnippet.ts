import { useCallback, type RefObject } from 'react';

interface UseInsertSnippetOptions {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function useInsertSnippet({
  textareaRef,
  value,
  onChange,
  disabled,
}: UseInsertSnippetOptions) {
  return useCallback(
    (before: string, after: string, placeholder?: string) => {
      const el = textareaRef.current;
      if (!el || disabled) return;

      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.slice(start, end);
      const insert = selected || placeholder || '';

      const newValue = value.slice(0, start) + before + insert + after + value.slice(end);
      onChange(newValue);

      requestAnimationFrame(() => {
        el.focus();
        const cursorStart = start + before.length;
        const cursorEnd = cursorStart + insert.length;
        el.setSelectionRange(cursorStart, cursorEnd);
      });
    },
    [textareaRef, value, onChange, disabled]
  );
}
