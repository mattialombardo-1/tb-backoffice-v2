import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** How multiple selected values should be combined when filtering. */
export type FilterMode = 'OR' | 'AND';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectWithModeProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  /** Current combination mode (OR = any, AND = all). */
  mode: FilterMode;
  onModeChange: (mode: FilterMode) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Labels for the OR / AND toggle. */
  orLabel?: string;
  andLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Multi-select combobox with search (built on the same Command/Popover base as
 * `MultiSelect`) plus an OR/AND toggle that lets the user pick how the selected
 * values should be combined when filtering. Generic and reusable.
 */
export function MultiSelectWithMode({
  options,
  value,
  onChange,
  mode,
  onModeChange,
  placeholder = 'Seleziona...',
  searchPlaceholder = 'Cerca...',
  emptyMessage = 'Nessun risultato.',
  orLabel = 'Almeno uno',
  andLabel = 'Tutti',
  disabled = false,
  className,
}: MultiSelectWithModeProps) {
  const [open, setOpen] = React.useState(false);

  const toggle = (optValue: string) => {
    onChange(value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]);
  };

  const remove = (optValue: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(value.filter((v) => v !== optValue));
  };

  const getLabel = (val: string) => options.find((o) => o.value === val)?.label ?? val;

  const MAX_VISIBLE = 2;
  const visible = value.slice(0, MAX_VISIBLE);
  const overflow = value.length - MAX_VISIBLE;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn('h-auto min-h-9 justify-between font-normal gap-1', className)}
        >
          <div className="flex gap-1 flex-wrap items-center min-w-0">
            {value.length === 0 && (
              <span className="text-muted-foreground truncate">{placeholder}</span>
            )}
            {visible.map((val) => (
              <Badge key={val} variant="secondary" className="text-xs py-0 px-1.5 gap-0.5 shrink-0">
                <span className="max-w-[80px] truncate">{getLabel(val)}</span>
                <button
                  type="button"
                  className="rounded-full outline-none hover:opacity-70 focus-visible:ring-1 focus-visible:ring-ring"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => remove(val, e)}
                  aria-label={`Rimuovi ${getLabel(val)}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
            {overflow > 0 && (
              <Badge variant="secondary" className="text-xs py-0 px-1.5 shrink-0">
                +{overflow}
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0"
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        align="start"
      >
        <div className="flex flex-col gap-1 border-b p-1.5">
          <span className="px-1 text-xs text-muted-foreground">Corrispondenza</span>
          <div className="flex gap-1">
            {(['OR', 'AND'] as const).map((m) => (
              <Button
                key={m}
                type="button"
                variant={mode === m ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 flex-1 px-2 text-xs"
                onClick={() => onModeChange(m)}
              >
                {m === 'OR' ? orLabel : andLabel}
              </Button>
            ))}
          </div>
        </div>
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList onWheel={(e) => e.stopPropagation()}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => toggle(option.value)}
                >
                  <Check
                    className={cn(
                      'size-4 shrink-0',
                      value.includes(option.value) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
