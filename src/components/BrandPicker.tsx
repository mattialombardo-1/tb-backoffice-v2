import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBrand } from '@/lib/brand';

export function BrandPicker() {
  const { brands, selectedBrandId, setSelectedBrandId, loading, error } = useBrand();

  return (
    <div className="border-b px-6 py-3 space-y-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Brand</Label>
      {error ? (
        <p className="text-xs text-destructive">Errore nel caricamento dei brand</p>
      ) : (
        <Select
          value={selectedBrandId ?? ''}
          onValueChange={(value) => setSelectedBrandId(value || null)}
          disabled={loading || brands.length === 0}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={loading ? 'Caricamento...' : 'Seleziona un brand'} />
          </SelectTrigger>
          <SelectContent>
            {brands.map((b) => (
              <SelectItem key={b._id} value={b._id} className="text-xs">
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
