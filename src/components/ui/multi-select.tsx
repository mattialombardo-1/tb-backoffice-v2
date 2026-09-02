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

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  /** Allow adding arbitrary typed values not present in options */
  allowCreate?: boolean;
  /** Show a select-all / deselect-all button at the top of the list */
  showSelectAll?: boolean;
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleziona...',
  searchPlaceholder = 'Cerca...',
  emptyMessage = 'Nessun risultato.',
  disabled = false,
  className,
  allowCreate = false,
  showSelectAll = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const allSelected = options.length > 0 && options.every((o) => value.includes(o.value));
  const handleSelectAll = () => onChange(options.map((o) => o.value));
  const handleDeselectAll = () => onChange([]);

  const trimmedSearch = search.trim();
  const canCreate =
    allowCreate && trimmedSearch.length > 0 && !value.includes(trimmedSearch);

  const toggle = (optValue: string) => {
    onChange(
      value.includes(optValue) ? value.filter((v) => v !== optValue) : [...value, optValue]
    );
  };

  const create = () => {
    if (!canCreate) return;
    onChange([...value, trimmedSearch]);
    setSearch('');
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
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList onWheel={(e) => e.stopPropagation()}>
            {!canCreate && <CommandEmpty>{emptyMessage}</CommandEmpty>}
            {showSelectAll && options.length > 0 && (
              <CommandGroup>
                <CommandItem
                  value="__select_all__"
                  onSelect={allSelected ? handleDeselectAll : handleSelectAll}
                  className="text-muted-foreground italic"
                >
                  <Check className="size-4 shrink-0 opacity-0" />
                  {allSelected ? 'Deseleziona tutte' : 'Seleziona tutte'}
                </CommandItem>
              </CommandGroup>
            )}
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
              {canCreate && (
                <CommandItem value={`__create__${trimmedSearch}`} onSelect={create}>
                  <span className="text-muted-foreground mr-1">Aggiungi</span>
                  <span className="font-medium">&ldquo;{trimmedSearch}&rdquo;</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
