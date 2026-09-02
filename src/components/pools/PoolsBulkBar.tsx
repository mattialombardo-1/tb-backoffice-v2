import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PoolStatus } from '@/lib/types/pools';

export type PoolBulkAction = Extract<PoolStatus, 'ACTIVE' | 'INACTIVE'>;

interface PoolsBulkBarProps {
  selectedCount: number;
  onAction: (action: PoolBulkAction) => void;
  onClear: () => void;
}

export function PoolsBulkBar({ selectedCount, onAction, onClear }: PoolsBulkBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground shrink-0">
        {t('pools.bulk.selected', { count: selectedCount })}
      </span>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onAction('ACTIVE')}>
          {t('pools.bulk.setActive')}
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAction('INACTIVE')}>
          {t('pools.bulk.setInactive')}
        </Button>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 ml-auto shrink-0"
        onClick={onClear}
        aria-label={t('pools.bulk.deselectAll')}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
