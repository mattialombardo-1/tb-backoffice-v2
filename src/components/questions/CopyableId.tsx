import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyableIdProps {
  id: string;
}

export function CopyableId({ id }: CopyableIdProps) {
  const { t } = useTranslation();
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setState('copied');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const Icon = state === 'copied' ? Check : state === 'error' ? X : Copy;

  return (
    <div className="flex items-center gap-1 min-w-0 max-w-30">
      <span className="font-mono text-xs text-muted-foreground truncate max-w-30" title={id}>
        {id}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        onClick={handleCopy}
      >
        <Icon
          className={cn(
            'h-3 w-3',
            state === 'copied' && 'text-emerald-600',
            state === 'error' && 'text-destructive'
          )}
        />
        <span className="sr-only">{t('common.copy')}</span>
      </Button>
    </div>
  );
}
