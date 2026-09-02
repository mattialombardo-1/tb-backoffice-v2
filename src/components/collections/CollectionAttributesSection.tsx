import { useState, type KeyboardEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAttributesByResource } from '@/lib/hooks/useAttributesByResource';
import type { AttributeItem, AttributeType } from '@/lib/types/attributes';

interface Props {
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

// --- Value controls per type ---

function BooleanField({ item, value, onChange }: {
  item: AttributeItem; value: unknown; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <Switch
        id={`attr-${item.name}`}
        checked={!!value}
        onCheckedChange={onChange}
      />
    </div>
  );
}

function StringField({ item, value, onChange }: {
  item: AttributeItem; value: unknown; onChange: (v: string) => void;
}) {
  return (
    <Input
      id={`attr-${item.name}`}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={item.name}
      className="max-w-xs"
    />
  );
}

function NumberField({ item, value, onChange }: {
  item: AttributeItem; value: unknown; onChange: (v: number) => void;
}) {
  return (
    <Input
      id={`attr-${item.name}`}
      type="number"
      value={typeof value === 'number' ? value : ''}
      onChange={(e) => {
        const n = parseFloat(e.target.value);
        if (!isNaN(n)) onChange(n);
      }}
      placeholder="0"
      className="max-w-xs"
    />
  );
}

function DateField({ item, value, onChange }: {
  item: AttributeItem; value: unknown; onChange: (v: string) => void;
}) {
  return (
    <Input
      id={`attr-${item.name}`}
      type="date"
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      className="max-w-xs"
    />
  );
}

function SelectField({ item, value, onChange }: {
  item: AttributeItem; value: unknown; onChange: (v: string) => void;
}) {
  return (
    <Input
      id={`attr-${item.name}`}
      value={typeof value === 'string' ? value : ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Valore..."
      className="max-w-xs"
    />
  );
}

function MultiSelectField({ item, value, onChange }: {
  item?: AttributeItem; value: unknown; onChange: (v: string[]) => void;
}) {
  const tags = Array.isArray(value) ? (value as string[]) : [];
  const enumValues = item?.values ?? [];

  if (enumValues.length > 0) {
    const options = enumValues.map((v) => ({ value: v, label: v }));
    return (
      <MultiSelect
        options={options}
        value={tags}
        onChange={onChange}
        className="w-64"
      />
    );
  }

  // Fallback: free-form tag input when no enum values are defined
  const [input, setInput] = useState('');

  const addTag = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput('');
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap gap-1.5 min-h-9 w-full max-w-xs rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="rounded-full hover:bg-muted-foreground/20 p-0.5"
            aria-label={`Rimuovi ${tag}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => { if (input.trim()) addTag(input); }}
        placeholder={tags.length === 0 ? 'Digita e premi Invio...' : ''}
        className="flex-1 min-w-16 bg-transparent outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function AttributeValueControl({ item, value, onChange }: {
  item: AttributeItem; value: unknown; onChange: (v: unknown) => void;
}) {
  const type: AttributeType = item.type ?? 'string';
  switch (type) {
    case 'boolean':   return <BooleanField item={item} value={value} onChange={onChange} />;
    case 'number':    return <NumberField item={item} value={value} onChange={onChange} />;
    case 'date':      return <DateField item={item} value={value} onChange={(v) => onChange(v)} />;
    case 'select':    return <SelectField item={item} value={value} onChange={(v) => onChange(v)} />;
    case 'multiSelect': return <MultiSelectField item={item} value={value} onChange={(v) => onChange(v)} />;
    case 'string':
    default:          return <StringField item={item} value={value} onChange={(v) => onChange(v)} />;
  }
}

// --- Main component ---

export function CollectionAttributesSection({ values, onChange }: Props) {
  const { data, isLoading, error } = useAttributesByResource('collections');
  const allAttributes = data?.attributes ?? [];

  // Which attribute names have been added by the user
  const addedNames = Object.keys(values);
  const addedAttributes = allAttributes.filter((a) => addedNames.includes(a.name));
  const availableToAdd = allAttributes.filter((a) => !addedNames.includes(a.name));

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  if (error || allAttributes.length === 0) return null;

  const handleAdd = (attr: AttributeItem) => {
    onChange({ ...values, [attr.name]: undefined });
  };

  const handleRemove = (name: string) => {
    const next = { ...values };
    delete next[name];
    onChange(next);
  };

  const handleValueChange = (name: string, val: unknown) => {
    onChange({ ...values, [name]: val });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Attributi</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Aggiungi gli attributi che vuoi valorizzare per questa collezione.
        </p>
      </div>

      {/* Added attributes */}
      {addedAttributes.length > 0 && (
        <div className="space-y-3">
          {addedAttributes.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <Label htmlFor={`attr-${item.name}`} className="w-32 shrink-0 text-sm">
                {item.name}
              </Label>
              <AttributeValueControl
                item={item}
                value={values[item.name]}
                onChange={(v) => handleValueChange(item.name, v)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(item.name)}
                aria-label={`Rimuovi attributo ${item.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add button */}
      {availableToAdd.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Aggiungi attributo
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availableToAdd.map((attr) => (
              <DropdownMenuItem key={attr.name} onSelect={() => handleAdd(attr)}>
                <span>{attr.name}</span>
                {attr.type && (
                  <span className="ml-auto pl-4 text-xs text-muted-foreground">{attr.type}</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
