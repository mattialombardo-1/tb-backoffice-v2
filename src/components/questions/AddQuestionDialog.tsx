import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';
import { BookOpen } from 'lucide-react';
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
  /** Mai mostrato in UI — decide solo su quale dei due flussi esistenti si finisce (vedi
   *  handleSelectManuale sotto). Elenco reale (titoli da manuali_p4m.xlsx, solo "Materia
   *  Libro" — niente Argomento: sono libri, non legati alla gerarchia Materia/Argomento
   *  del resto dell'app), flag assegnato in modo deterministico sull'indice — non c'è
   *  nessun dato reale su quali manuali sono "pronti", è un mock come BatchOutcome. */
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

interface AddQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente quando si apre da una slot di campagna ("Produci") — lo stesso contesto va
   *  portato in qualunque dei due percorsi si scelga, non solo in quello automatico. */
  campaignContext?: AddQuestionCampaignContext;
}

/**
 * Biforcazione dell'ingresso unico "Aggiungi domanda" — non più una scelta esplicita tra
 * generazione automatica e creazione manuale (le due card di prima): la scelta del manuale
 * è ora il primo step, e decide da sola, in silenzio, quale dei due flussi esistenti segue.
 * L'utente non sa (e non deve sapere) che alcuni manuali sono "pronti" per la generazione a
 * batch e altri no — vede solo un elenco di manuali, tutti ugualmente selezionabili.
 * I due flussi a valle (`/questions/create`, `/questions/create-manual`) restano quelli che
 * sono, bit per bit — nessuna modifica al loro interno, solo a cosa li precede.
 * Vedi design/decisioni per il ragionamento completo.
 */
export function AddQuestionDialog({ open, onOpenChange, campaignContext }: AddQuestionDialogProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const goTo = (to: '/questions/create' | '/questions/create-manual', manualeTitle: string) => {
    onOpenChange(false);
    navigate({ to, search: { ...(campaignContext ?? {}), manualeTitle } });
  };

  const handleSelectManuale = (manuale: Manuale) => {
    goTo(
      manuale.readyForAutoGeneration ? '/questions/create' : '/questions/create-manual',
      manuale.title
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('questions.addDialog.title')}</DialogTitle>
          <DialogDescription>{t('questions.addDialog.desc')}</DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Cerca manuale..." />
          {/* height fissa, non maxHeight: con maxHeight la lista (e quindi il dialog) si
              restringeva mentre filtravi digitando, facendolo "saltare" — così resta sempre
              della stessa dimensione, con lo scroll a fare il resto. */}
          <CommandList style={{ height: '320px', overflowY: 'auto' }}>
            <CommandEmpty>Nessun manuale trovato.</CommandEmpty>
            <CommandGroup>
              {MANUALI.map((manuale) => (
                <CommandItem
                  key={manuale.id}
                  value={manuale.title}
                  onSelect={() => handleSelectManuale(manuale)}
                >
                  <BookOpen className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  {manuale.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
