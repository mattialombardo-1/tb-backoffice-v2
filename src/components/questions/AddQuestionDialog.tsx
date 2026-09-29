import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen, ChevronLeft, PenLine, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

export interface AddQuestionCampaignContext {
  slotId: string;
  campaignId: string;
  campaignName?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  questionType?: string;
  revisorId?: string;
}

interface Manuale {
  id: string;
  title: string;
  /** Decide se il manuale compare nel picker di "Genera massivamente" (solo i `true`, vedi
   *  READY_MANUALI sotto) — mai mostrato in UI come proprietà a sé. Elenco reale (titoli da
   *  manuali_p4m.xlsx, solo "Materia Libro" — niente Argomento: sono libri, non legati alla
   *  gerarchia Materia/Argomento del resto dell'app), flag assegnato in modo deterministico
   *  sull'indice — non c'è nessun dato reale su quali manuali sono "pronti", è un mock come
   *  BatchOutcome. */
  readyForAutoGeneration: boolean;
}

const MANUALE_TITLES = [
  'Chimica',
  'Chirurgia generale',
  'Dermatologia e Chirurgia plastica',
  'Ematologia',
  'Endocrinologia',
  'Ginecologia e ostetricia',
  'Igiene e Medicina preventiva e Statistica sanitaria',
  "Malattie dell'apparato cardiovascolare",
  "Malattie dell'apparato digerente",
  "Malattie dell'apparato respiratorio",
  'Malattie infettive e tropicali',
  'Medicina del Lavoro',
  'Medicina Legale',
  'Nefrologia',
  'Neurologia e Neurochirurgia',
  'Oftalmologia',
  'Oncologia',
  'Ortopedia e traumatologia',
  'Otorinolaringoiatria',
  'Pediatria',
  'Psichiatria',
  'Radiodiagnostica e Radioterapia',
  'Reumatologia e Immunologia',
  'Urologia',
];

const MANUALI: Manuale[] = MANUALE_TITLES.map((title, index) => ({
  id: `manuale-${index}`,
  title,
  readyForAutoGeneration: index % 2 === 0,
}));

// Solo questi compaiono nel picker di "Genera massivamente" — a differenza della proposta
// precedente, qui la distinzione è esplicita fin dal primo step (vedi il commento sul
// componente sotto), quindi non ha più senso mostrare anche i manuali non pronti per poi
// dirottarli altrove in silenzio.
const READY_MANUALI = MANUALI.filter((m) => m.readyForAutoGeneration);

type DialogLevel = 'choice' | 'manuale';

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente quando si apre da una slot di campagna ("Produci") — lo stesso contesto va
   *  portato in qualunque dei due percorsi si scelga, non solo in quello automatico. */
  campaignContext?: AddQuestionCampaignContext;
}

/**
 * Biforcazione dell'ingresso unico "Aggiungi domanda" — primo step: una scelta esplicita tra
 * generazione massiva (AI) e creazione manuale, visibile fin da subito. Solo scegliendo
 * "Genera massivamente" si passa a un secondo step con l'elenco dei manuali, filtrato a
 * quelli su cui il sistema AI è attivo (READY_MANUALI) — "Crea manualmente" non richiede
 * nessun manuale, va dritto al flusso manuale.
 * I due flussi a valle (`/questions/create`, `/questions/create-manual`) restano quelli che
 * sono, bit per bit — nessuna modifica al loro interno, solo a cosa li precede.
 * Vedi design/decisioni per il ragionamento completo.
 */
export function AddQuestionDialog({ open, onOpenChange, campaignContext }: AddQuestionDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [level, setLevel] = useState<DialogLevel>('choice');

  // Il dialog può essere riaperto più volte nella stessa sessione — senza reset tornerebbe
  // sempre al secondo step dell'apertura precedente invece che alla scelta iniziale.
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setLevel('choice');
  };

  const goTo = (to: '/questions/create' | '/questions/create-manual', manualeTitle?: string) => {
    handleOpenChange(false);
    navigate({ to, search: { ...(campaignContext ?? {}), manualeTitle } });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {level === 'manuale' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 -mb-1 w-fit text-muted-foreground hover:text-foreground"
            onClick={() => setLevel('choice')}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('questions.addDialog.back')}
          </Button>
        )}
        <DialogHeader>
          <DialogTitle>
            {level === 'choice'
              ? t('questions.addDialog.title')
              : t('questions.addDialog.manuale.title')}
          </DialogTitle>
          <DialogDescription>
            {level === 'choice'
              ? t('questions.addDialog.desc')
              : t('questions.addDialog.manuale.desc')}
          </DialogDescription>
        </DialogHeader>

        {level === 'choice' ? (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setLevel('manuale')}
              className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
            >
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{t('questions.addDialog.bulkOption.title')}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('questions.addDialog.bulkOption.desc')}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => goTo('/questions/create-manual')}
              className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
            >
              <PenLine className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">{t('questions.addDialog.manualOption.title')}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t('questions.addDialog.manualOption.desc')}
                </p>
              </div>
            </button>
          </div>
        ) : (
          <Command>
            <CommandInput placeholder="Cerca manuale..." />
            {/* height fissa, non maxHeight: con maxHeight la lista (e quindi il dialog) si
                restringeva mentre filtravi digitando, facendolo "saltare" — così resta sempre
                della stessa dimensione, con lo scroll a fare il resto. */}
            <CommandList style={{ height: '320px', overflowY: 'auto' }}>
              <CommandEmpty>Nessun manuale trovato.</CommandEmpty>
              <CommandGroup>
                {READY_MANUALI.map((manuale) => (
                  <CommandItem
                    key={manuale.id}
                    value={manuale.title}
                    onSelect={() => goTo('/questions/create', manuale.title)}
                  >
                    <BookOpen className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                    {manuale.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </DialogContent>
    </Dialog>
  );
}
