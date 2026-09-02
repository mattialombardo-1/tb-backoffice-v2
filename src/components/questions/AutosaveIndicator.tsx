import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudOff, Loader2, Check } from 'lucide-react';

interface AutosaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  isDirty: boolean;
}

export function AutosaveIndicator({ status, lastSavedAt, isDirty }: AutosaveIndicatorProps) {
  const { t } = useTranslation();

  if (status === 'saving') {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Loader2 className="h-3 w-3 animate-spin" />
        {t('questions.autosave.saving')}
      </Badge>
    );
  }

  if (status === 'error') {
    return (
      <Badge variant="destructive" className="gap-1.5">
        <CloudOff className="h-3 w-3" />
        {t('questions.autosave.error')}
      </Badge>
    );
  }

  if (status === 'saved' && !isDirty) {
    const time = lastSavedAt
      ? new Date(lastSavedAt).toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null;

    return (
      <Badge variant="secondary" className="gap-1.5">
        <Check className="h-3 w-3" />
        {time ? t('questions.autosave.savedAt', { time }) : t('questions.autosave.saved')}
      </Badge>
    );
  }

  if (isDirty) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <Cloud className="h-3 w-3" />
        {t('questions.autosave.unsaved')}
      </Badge>
    );
  }

  return null;
}
