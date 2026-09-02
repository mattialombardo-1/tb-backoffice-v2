import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApiClient } from '@/lib/api/useApiClient';
import { testsService } from '@/lib/services/tests';
import { queryKeys } from '@/lib/query/queryKeys';
import type { TestFilters } from '@/lib/types/tests';

interface Brand {
  _id: string;
  name: string;
}

interface TestsFiltersProps {
  filters: TestFilters;
  onFilterChange: (patch: Partial<TestFilters>) => void;
  onReset: () => void;
}

export function TestsFilters({ filters, onFilterChange, onReset }: TestsFiltersProps) {
  const client = useApiClient();

  const brandsQuery = useQuery({
    queryKey: ['brands'],
    queryFn: ({ signal }) => client.get<Brand[]>('/brands', { signal }),
    staleTime: 5 * 60 * 1000,
  });
  const brands = brandsQuery.data ?? [];

  const yearsQuery = useQuery({
    queryKey: queryKeys.tests.years,
    queryFn: ({ signal }) => testsService.getYears(client, signal),
    staleTime: 5 * 60 * 1000,
  });
  const years = yearsQuery.data ?? [];

  const hasFilters = !!filters.search || !!filters.brandId || !!filters.year;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Cerca per nome…"
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-8 w-[220px]"
        />
      </div>

      <Select
        value={filters.brandId || '_all'}
        onValueChange={(v) => onFilterChange({ brandId: v === '_all' ? '' : v })}
        disabled={brandsQuery.isLoading}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Tutti i brand</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b._id} value={b._id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.year || '_all'}
        onValueChange={(v) => onFilterChange({ year: v === '_all' ? '' : v })}
        disabled={yearsQuery.isLoading}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Anno" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">Tutti gli anni</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  );
}
