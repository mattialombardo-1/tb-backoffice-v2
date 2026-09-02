import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SearchField = 'name' | 'id' | 'code';

interface PackagesFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchField: SearchField;
  onSearchFieldChange: (field: SearchField) => void;
  codeLabel: string;
}

const DEBOUNCE_MS = 400;

export function PackagesFilters({
  search,
  onSearchChange,
  searchField,
  onSearchFieldChange,
  codeLabel,
}: PackagesFiltersProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setInput(search);
  }, [search]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const handleChange = (v: string) => {
    setInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(v), DEBOUNCE_MS);
  };

  const handleFieldChange = (field: SearchField) => {
    clearTimeout(debounceRef.current);
    setInput('');
    onSearchFieldChange(field);
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={searchField} onValueChange={(v) => handleFieldChange(v as SearchField)}>
        <SelectTrigger className="w-[130px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">{t('packages.searchFieldName')}</SelectItem>
          <SelectItem value="id">ID</SelectItem>
          <SelectItem value="code">{codeLabel}</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => handleChange(e.target.value)}
          className="pl-9 w-[220px] h-9 text-sm"
        />
      </div>
    </div>
  );
}
