import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { useApiClient } from '@/lib/api/useApiClient';
import { testsService } from '@/lib/services/tests';
import type { SaveStatus } from '@/lib/hooks/useCollectionForm';

const NAME_MAX = 100;

interface CollectionTabNomeTestProps {
  testIds: string[];
  name: string;
  saveStatus: SaveStatus;
  onTestsChange: (ids: string[]) => void;
  onNameChange: (name: string) => void;
  onContinue: () => void;
}

export function CollectionTabNomeTest({
  testIds,
  name,
  saveStatus,
  onTestsChange,
  onNameChange,
  onContinue,
}: CollectionTabNomeTestProps) {
  const client = useApiClient();

  const { data, isLoading } = useQuery({
    queryKey: ['tests', 'all'],
    queryFn: ({ signal }) => testsService.list(client, { page: 1, limit: 1000 }, signal),
    staleTime: 5 * 60 * 1000,
  });

  const testOptions = (data?.tests ?? []).map((t) => ({
    value: t.id,
    label: t.year ? `${t.name} ${t.year}` : t.name,
  }));

  const hasTests = testIds.length > 0;
  const hasName = name.trim().length > 0;
  const canContinue = hasTests && hasName && saveStatus !== 'saving';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="test-target">Test target</Label>
        <MultiSelect
          options={testOptions}
          value={testIds}
          onChange={onTestsChange}
          placeholder={isLoading ? 'Caricamento...' : 'Seleziona un test...'}
          searchPlaceholder="Cerca un test..."
          emptyMessage="Nessun test trovato."
          disabled={isLoading}
          className="max-w-xl"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="collection-name">Nome collection</Label>
          {hasTests && (
            <span className={`text-xs ${name.length >= NAME_MAX ? 'text-destructive' : 'text-muted-foreground'}`}>
              {name.length}/{NAME_MAX}
            </span>
          )}
        </div>
        <Input
          id="collection-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value.slice(0, NAME_MAX))}
          placeholder={hasTests ? 'Nome della collezione...' : 'Seleziona prima un test'}
          disabled={!hasTests}
          maxLength={NAME_MAX}
          className="max-w-xl"
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        {saveStatus === 'error' && (
          <span className="text-sm text-destructive">Errore nel salvataggio della bozza.</span>
        )}
        <Button onClick={onContinue} disabled={!canContinue}>
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvataggio...
            </>
          ) : (
            'Continua'
          )}
        </Button>
      </div>
    </div>
  );
}
