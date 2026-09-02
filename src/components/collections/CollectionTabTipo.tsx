import { Trophy, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CollectionType } from '@/lib/types/collections';

interface TypeOption {
  value: CollectionType;
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}

const TYPE_OPTIONS: TypeOption[] = [
  {
    value: 'SIMULATION',
    label: 'Simulazione',
    Icon: Trophy,
    description: 'Test cronometrato con graduatoria. Un solo tentativo, valido come prova ufficiale.',
  },
  {
    value: 'EXERCISE',
    label: 'Esercitazione',
    Icon: Dumbbell,
    description: 'Allenamento mirato. Tentativi multipli, niente graduatoria.',
  },
];

interface CollectionTabTipoProps {
  value: CollectionType | null;
  onChange: (type: CollectionType) => void;
  onContinue: () => void;
}

export function CollectionTabTipo({ value, onChange, onContinue }: CollectionTabTipoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        {TYPE_OPTIONS.map((option) => {
          const { Icon } = option;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex flex-col gap-3 rounded-lg border p-5 text-left transition-all',
                'hover:border-primary/50 hover:bg-accent/40',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-card',
              )}
            >
              <Icon
                size={28}
                className={cn('text-muted-foreground', isSelected && 'text-primary')}
              />
              <div className="space-y-1">
                <p className="font-semibold">{option.label}</p>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={onContinue} disabled={!value}>
          Continua
        </Button>
      </div>
    </div>
  );
}
