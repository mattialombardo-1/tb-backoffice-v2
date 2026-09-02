import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClientsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

const DEBOUNCE_MS = 400;

export function ClientsFilters({ search, onSearchChange }: ClientsFiltersProps) {
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

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={t('clients.filters.search')}
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}
