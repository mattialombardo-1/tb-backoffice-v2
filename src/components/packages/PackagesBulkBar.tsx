import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type BulkAction = 'setActive' | 'setInactive' | 'setFree' | 'setPaid' | 'delete';

interface PackagesBulkBarProps {
  selectedCount: number;
  onAction: (action: BulkAction) => void;
  onClear: () => void;
}

export function PackagesBulkBar({ selectedCount, onAction, onClear }: PackagesBulkBarProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) return null;

  const actions: { action: BulkAction; label: string; destructive?: boolean }[] = [
    { action: 'setActive', label: t('packages.packageBulk.activate') },
    { action: 'setInactive', label: t('packages.packageBulk.deactivate') },
    { action: 'setFree', label: t('packages.packageBulk.free') },
    { action: 'setPaid', label: t('packages.packageBulk.paid') },
    { action: 'delete', label: t('packages.packageBulk.delete'), destructive: true },
  ];

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
      <span className="text-sm font-medium text-muted-foreground shrink-0">
        {t('packages.packageBulk.selected', { count: selectedCount })}
      </span>

      <div className="flex items-center gap-2 flex-wrap">
        {actions.map(({ action, label, destructive }) => (
          <Button
            key={action}
            variant="outline"
            size="sm"
            className={destructive ? 'text-destructive border-destructive hover:bg-destructive/10' : ''}
            onClick={() => onAction(action)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 ml-auto shrink-0"
        onClick={onClear}
        aria-label={t('packages.packageBulk.deselectAll')}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
