import { useRef } from 'react';
import { Info, Paperclip, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface QuestionAttachmentsFieldProps {
  fileName: string | null;
  onFileNameChange: (name: string | null) => void;
  disabled?: boolean;
}

/**
 * Proposta di design — allegati, separati dalle Note ma sempre dentro
 * "Opzioni aggiuntive". Input file reale (nessun caricamento vero verso un
 * server, come il resto del prototipo): scegliendo un file se ne mostra il
 * nome, per simulare l'effetto senza inventare dati finti.
 */
export function QuestionAttachmentsField({
  fileName,
  onFileNameChange,
  disabled = false,
}: QuestionAttachmentsFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-3">
      <Label>
        Allegati
        <span className="ml-2 text-xs font-normal text-muted-foreground">(facoltativo)</span>
      </Label>

      {fileName ? (
        <div className="flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <Paperclip className="size-4 shrink-0 text-muted-foreground" />
          <span className="max-w-64 truncate">{fileName}</span>
          <button
            type="button"
            onClick={() => onFileNameChange(null)}
            disabled={disabled}
            aria-label="Rimuovi allegato"
            className="text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-fit"
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="mr-1.5 h-4 w-4" />
          Carica allegato
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileNameChange(file.name);
          e.target.value = '';
        }}
      />

      <div className="flex items-start gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>I manuali di riferimento sono già caricati in piattaforma. Usa questo campo solo per eventuale materiale extra.</p>
      </div>
    </div>
  );
}
