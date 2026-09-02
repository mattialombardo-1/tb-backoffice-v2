import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SkusBulkBarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
}

export function SkusBulkBar({ selectedCount, onDelete, onClear }: SkusBulkBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground shrink-0">
        {t('packages.skuBulk.selected', { count: selectedCount })}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive border-destructive hover:bg-destructive/10"
        onClick={onDelete}
      >
        {t('packages.skuBulk.delete')}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 ml-auto shrink-0"
        onClick={onClear}
        aria-label={t('packages.skuBulk.deselectAll')}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
