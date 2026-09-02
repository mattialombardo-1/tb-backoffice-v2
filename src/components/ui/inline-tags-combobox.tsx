import { useState, useCallback } from 'react';
import { Check, Plus, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Tag } from '@/lib/types/collections';

interface InlineTagsComboboxProps {
  selectedTags: Tag[];
  allTags: Tag[];
  onChange: (newTags: Tag[]) => Promise<void>;
  onCreateTag: (value: string) => Promise<Tag>;
  disabled?: boolean;
  className?: string;
}

export function InlineTagsCombobox({
  selectedTags,
  allTags,
  onChange,
  onCreateTag,
  disabled = false,
  className,
}: InlineTagsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [localTags, setLocalTags] = useState<Tag[]>(selectedTags);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const selectedIds = new Set(localTags.map((t) => t.id));
  const trimmed = search.trim();
  const trimmedLower = trimmed.toLowerCase();

  const filteredTags = allTags.filter((t) => t.value.toLowerCase().includes(trimmedLower));
  const exactMatch = allTags.some((t) => t.value.toLowerCase() === trimmedLower);
  const canCreate = trimmed.length > 0 && !exactMatch;

  const commit = useCallback(
    async (nextTags: Tag[]) => {
      setLocalTags(nextTags);
      setBusy(true);
      try {
        await onChange(nextTags);
      } catch {
        setLocalTags(localTags);
      } finally {
        setBusy(false);
      }
    },
    [localTags, onChange]
  );

  const handleToggle = useCallback(
    (tag: Tag) => {
      if (busy) return;
      const next = selectedIds.has(tag.id)
        ? localTags.filter((t) => t.id !== tag.id)
        : [...localTags, tag];
      commit(next);
    },
    [busy, selectedIds, localTags, commit]
  );

  const handleCreate = useCallback(async () => {
    if (busy || !canCreate) return;
    setBusy(true);
    try {
      const newTag = await onCreateTag(trimmed);
      const next = [...localTags, newTag];
      setLocalTags(next);
      await onChange(next);
      setSearch('');
    } catch {
      // no-op — error handling is caller responsibility
    } finally {
      setBusy(false);
    }
  }, [busy, canCreate, trimmed, localTags, onCreateTag, onChange]);

  const handleRemove = useCallback(
    (tagId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (busy) return;
      commit(localTags.filter((t) => t.id !== tagId));
    },
    [busy, localTags, commit]
  );

  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      {localTags.map((tag) => (
        <Badge key={tag.id} variant="secondary" className="text-xs font-normal gap-1 pr-1 h-5">
          {tag.value}
          <button
            type="button"
            disabled={disabled || busy}
            className="rounded-sm opacity-50 hover:opacity-100 disabled:pointer-events-none"
            onClick={(e) => handleRemove(tag.id, e)}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              'inline-flex items-center gap-1 rounded border border-dashed px-1.5 py-0.5',
              'text-xs text-muted-foreground hover:text-foreground hover:border-solid transition-colors',
              'disabled:pointer-events-none disabled:opacity-50'
            )}
          >
            {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            Tag
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={4} className="w-52 p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Cerca o crea tag..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {canCreate && (
                <CommandGroup>
                  <CommandItem disabled={busy} onSelect={handleCreate}>
                    <Plus className="mr-2 h-3.5 w-3.5 shrink-0" />
                    Crea &ldquo;{trimmed}&rdquo;
                  </CommandItem>
                </CommandGroup>
              )}
              {filteredTags.length > 0 ? (
                <CommandGroup heading={canCreate ? 'Esistenti' : undefined}>
                  {filteredTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      value={tag.value}
                      disabled={busy}
                      onSelect={() => handleToggle(tag)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-3.5 w-3.5 shrink-0',
                          selectedIds.has(tag.id) ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {tag.value}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : !canCreate ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Nessun tag trovato.
                </div>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
