import { useEffect, useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AttributeItem, AttributeType } from '@/lib/types/attributes';

const ATTRIBUTE_TYPES: AttributeType[] = [
  'boolean',
  'string',
  'number',
  'select',
  'multiSelect',
  'date',
];

interface AttributeDialogProps {
  open: boolean;
  initial?: AttributeItem;
  onClose: () => void;
  onConfirm: (item: AttributeItem) => Promise<void>;
}

export function AttributeDialog({ open, initial, onClose, onConfirm }: AttributeDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [type, setType] = useState<AttributeType | ''>('');
  const [values, setValues] = useState<string[]>([]);
  const [valueInput, setValueInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '');
      setType(initial?.type ?? '');
      setValues(initial?.values ?? []);
      setValueInput('');
    }
  }, [open, initial]);

  const addValue = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed && !values.includes(trimmed)) setValues((v) => [...v, trimmed]);
    setValueInput('');
  };

  const removeValue = (val: string) => setValues((v) => v.filter((x) => x !== val));

  const handleValueKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addValue(valueInput);
    } else if (e.key === 'Backspace' && !valueInput && values.length > 0) {
      removeValue(values[values.length - 1]);
    }
  };

  const handleOpenChange = (o: boolean) => {
    if (!o && !isSubmitting) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm({
        name: trimmed,
        ...(type ? { type } : {}),
        ...(type === 'multiSelect' && values.length ? { values } : {}),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!initial;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('attributes.editDialog.title') : t('attributes.addDialog.title')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attr-name">{t('attributes.addDialog.nameLabel')}</Label>
            {isEdit ? (
              <p className="text-sm px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground">{name}</p>
            ) : (
              <Input
                id="attr-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('attributes.addDialog.namePlaceholder')}
                autoFocus
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attr-type">{t('attributes.addDialog.typeLabel')}</Label>
            {isEdit ? (
              <p className="text-sm px-3 py-2 rounded-md border border-input bg-muted text-muted-foreground">
                {type ? t(`attributes.types.${type}`) : '—'}
              </p>
            ) : (
              <Select
                value={type}
                onValueChange={(v) => setType(v as AttributeType)}
              >
                <SelectTrigger id="attr-type">
                  <SelectValue placeholder={t('attributes.addDialog.typePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {ATTRIBUTE_TYPES.map((at) => (
                    <SelectItem key={at} value={at}>
                      {t(`attributes.types.${at}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {type === 'multiSelect' && (
            <div className="space-y-2">
              <Label>{t('attributes.addDialog.valuesLabel')}</Label>
              <div className="flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-within:ring-1 focus-within:ring-ring">
                {values.map((val) => (
                  <Badge key={val} variant="secondary" className="gap-1 pr-1">
                    {val}
                    <button
                      type="button"
                      onClick={() => removeValue(val)}
                      className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                      aria-label={`Rimuovi ${val}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <input
                  value={valueInput}
                  onChange={(e) => setValueInput(e.target.value)}
                  onKeyDown={handleValueKeyDown}
                  onBlur={() => { if (valueInput.trim()) addValue(valueInput); }}
                  placeholder={values.length === 0 ? t('attributes.addDialog.valuesPlaceholder') : ''}
                  className="flex-1 min-w-16 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting
                ? t('common.saving')
                : isEdit
                  ? t('attributes.editDialog.save')
                  : t('attributes.addDialog.add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
