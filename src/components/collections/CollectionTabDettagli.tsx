import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { CollectionDetails } from '@/lib/types/collections';
import type { CollectionType } from '@/lib/types/collections';
import { CollectionAttributesSection } from './CollectionAttributesSection';

interface Props {
  type: CollectionType | null;
  details: CollectionDetails;
  isEditMode?: boolean;
  onDetailsChange: (patch: Partial<CollectionDetails>) => void;
  attributeValues: Record<string, unknown>;
  onAttributeValuesChange: (values: Record<string, unknown>) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export function CollectionTabDettagli({
  type,
  details,
  isEditMode = false,
  onDetailsChange,
  attributeValues,
  onAttributeValuesChange,
  onSubmit,
  onBack,
}: Props) {
  const isSim = type === 'SIMULATION';

  function numericInput(value: number, onChange: (n: number) => void, min = 0) {
    return (
      <Input
        type="number"
        min={min}
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value, 10);
          if (!isNaN(n) && n >= min) onChange(n);
        }}
        className="max-w-xs"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Durata — solo SIMULATION */}
      {isSim && (
        <div className="space-y-1.5">
          <Label htmlFor="duration">Durata per sezione (in minuti, il valore inserito è il minutaggio applicato ad ogni sezione)</Label>
          <p className="text-xs text-muted-foreground">
            Durata, validità e visibilità. I valori sono pre-popolati dal test scelto.
          </p>
          {numericInput(details.durationMinutes, (n) => onDetailsChange({ durationMinutes: n }), 1)}
        </div>
      )}

      {/* Pausabile */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pausabile</span>
          <Switch
            checked={details.pausable}
            onCheckedChange={(checked) => onDetailsChange({ pausable: checked })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Se attivo, gli utenti possono mettere in pausa la sessione.
        </p>
      </div>

      {/* Correzione commentata */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Abilita correzione commentata</span>
          <Switch
            checked={details.enableCorrection}
            onCheckedChange={(checked) => onDetailsChange({ enableCorrection: checked })}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Se attivo, gli utenti potranno consultare la correzione commentata al termine della prova.
        </p>
      </div>

      {/* Validità */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="valid-from">Validità dal</Label>
          <Input
            id="valid-from"
            type="date"
            value={details.validFrom}
            onChange={(e) => onDetailsChange({ validFrom: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="valid-to">Validità al</Label>
          <Input
            id="valid-to"
            type="date"
            value={details.validTo}
            onChange={(e) => onDetailsChange({ validTo: e.target.value })}
          />
        </div>
      </div>

      {/* Visibilità */}
      <div className="rounded-lg border p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Visibilità</span>
          <div className="flex items-center gap-2 text-sm">
            <span className={details.status === 'DRAFT' ? 'font-medium' : 'text-muted-foreground'}>
              Bozza
            </span>
            <Switch
              checked={details.status === 'ACTIVE'}
              onCheckedChange={(checked) =>
                onDetailsChange({ status: checked ? 'ACTIVE' : 'DRAFT' })
              }
            />
            <span className={details.status === 'ACTIVE' ? 'font-medium' : 'text-muted-foreground'}>
              Pubblicata
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {details.status === 'DRAFT'
            ? 'Bozza: non visibile ai corsisti. Puoi modificarla e pubblicarla quando vuoi.'
            : 'Pubblicata: visibile ai corsisti in base alle date di validità.'}
        </p>
      </div>

      {/* Tentativi multipli */}
      <div className="space-y-1.5">
        <Label htmlFor="max-attempts">Tentativi multipli</Label>
        <p className="text-xs text-muted-foreground">
          Numero massimo di tentativi consentiti. Imposta 0 per tentativi illimitati.
        </p>
        {numericInput(details.maxAttempts, (n) => onDetailsChange({ maxAttempts: n }))}
      </div>

      {/* Punteggi uniformi */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Punteggi uniformi</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Applica gli stessi punteggi a tutte le domande della collection.
            </p>
          </div>
          <Switch
            checked={details.uniformScores}
            onCheckedChange={(checked) => onDetailsChange({ uniformScores: checked })}
          />
        </div>

        {details.uniformScores && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Risposta corretta</Label>
                <Input
                  type="number"
                  value={details.scoreCorrect}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    if (!isNaN(n)) onDetailsChange({ scoreCorrect: n });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Risposta errata</Label>
                <Input
                  type="number"
                  value={details.scoreWrong}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    if (!isNaN(n)) onDetailsChange({ scoreWrong: n });
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Risposta vuota</Label>
                <Input
                  type="number"
                  value={details.scoreEmpty}
                  onChange={(e) => {
                    const n = parseFloat(e.target.value);
                    if (!isNaN(n)) onDetailsChange({ scoreEmpty: n });
                  }}
                />
              </div>
            </div>

            <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold">Attenzione:</span> i punteggi qui specificati hanno
              priorità sui punteggi delle singole domande.
            </div>
          </>
        )}
      </div>

      {/* Template */}
      <Separator />
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium">Template</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Applica un template predefinito alla collezione.
          </p>
        </div>
        <div className="rounded-lg border p-4 flex items-center justify-between">
          <div>
            <Label htmlFor="template-ssm" className="cursor-pointer">Template SSM</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Abilita il template SSM per questa collezione.
            </p>
          </div>
          <Switch
            id="template-ssm"
            checked={attributeValues['template'] === 'SSM'}
            onCheckedChange={(checked) => {
              const next = { ...attributeValues };
              if (checked) {
                next['template'] = 'SSM';
              } else {
                delete next['template'];
              }
              onAttributeValuesChange(next);
            }}
          />
        </div>
      </div>

      {/* Attributi personalizzati */}
      <Separator />
      <CollectionAttributesSection
        values={attributeValues}
        onChange={onAttributeValuesChange}
      />

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onBack}>
          Indietro
        </Button>
        <Button onClick={onSubmit}>{isEditMode ? 'Aggiorna collezione' : 'Crea collezione'}</Button>
      </div>
    </div>
  );
}
