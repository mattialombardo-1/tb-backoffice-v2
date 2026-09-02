import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCommunityRoles } from '@/lib/hooks/useCommunityRoles';
import type { StaffFilters as StaffFiltersType } from '@/lib/types/staff';

interface StaffFiltersProps {
  filters: StaffFiltersType;
  onFilterChange: (patch: Partial<StaffFiltersType>) => void;
}

const DEBOUNCE_MS = 300;

function DebouncedSearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== input) {
      setInput(value);
    }
  }

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (v: string) => {
    setInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange(v);
    }, DEBOUNCE_MS);
  };

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={t('staff.filters.search')}
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}

export function StaffFilters({ filters, onFilterChange }: StaffFiltersProps) {
  const { t } = useTranslation();
  const { roles, isLoading: rolesLoading } = useCommunityRoles();

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <DebouncedSearchInput
        value={filters.search}
        onChange={(v) => onFilterChange({ search: v })}
      />

      <Select
        value={filters.roleId || '_all'}
        onValueChange={(v) => onFilterChange({ roleId: v === '_all' ? '' : v })}
        disabled={rolesLoading}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder={t('staff.filters.allRoles')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">{t('staff.filters.allRoles')}</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role._id} value={role._id}>
              {role.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
