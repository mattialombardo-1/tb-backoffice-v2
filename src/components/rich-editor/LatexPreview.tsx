import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { renderLatex } from './latex-utils';

interface LatexPreviewProps {
  value: string;
  className?: string;
}

export function LatexPreview({ value, className }: LatexPreviewProps) {
  const renderedHtml = useMemo(() => renderLatex(value), [value]);

  return (
    <div
      className={cn(
        'min-h-[100px] rounded-md border p-3 text-sm',
        !value && 'text-muted-foreground',
        className
      )}
      dangerouslySetInnerHTML={{
        __html: value ? renderedHtml : 'Anteprima',
      }}
    />
  );
}
