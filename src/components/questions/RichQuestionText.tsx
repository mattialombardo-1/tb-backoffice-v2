import { useLayoutEffect, useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { renderHtmlWithLatex } from '@/components/rich-editor/latex-utils';

interface RichQuestionTextProps {
  html: string;
  /** Classes for the clamped text container — controls line-clamp, size, leading, etc. */
  className?: string;
}

/**
 * Renders question text with LaTeX formulas parsed to KaTeX, clamped to the given
 * className's line-clamp, and shows the full unclamped content in a tooltip when
 * the text actually overflows.
 */
export function RichQuestionText({ html, className }: RichQuestionTextProps) {
  const rendered = renderHtmlWithLatex(html);
  const ref = useRef<HTMLDivElement>(null);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el) setIsClamped(el.scrollHeight > el.clientHeight);
  }, [rendered]);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={isClamped ? undefined : false}>
        <TooltipTrigger asChild>
          <div
            ref={ref}
            className={cn('[&_.katex]:text-sm', className)}
            dangerouslySetInnerHTML={{ __html: rendered }}
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-xl whitespace-normal [&_.katex]:text-sm" side="bottom">
          <div dangerouslySetInnerHTML={{ __html: rendered }} />
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
