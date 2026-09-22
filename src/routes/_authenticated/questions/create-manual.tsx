import { createFileRoute, redirect } from '@tanstack/react-router';
import { QuestionCreateManualPage } from '@/components/questions/QuestionCreateManualPage';
import { can } from '@/lib/auth';

interface QuestionCreateManualSearch {
  /** Contesto campagna, quando si arriva da "Produci" su una slot — stessi campi di
   *  /questions/create, portati qui identici quando si sceglie il percorso manuale. */
  slotId?: string;
  campaignId?: string;
  campaignName?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  questionType?: string;
  revisorId?: string;
  /** Manuale scelto in AddQuestionDialog — solo per il banner informativo in testa al
   *  contenuto, nessuna logica dipende da questo valore qui. */
  manualeTitle?: string;
}

export const Route = createFileRoute('/_authenticated/questions/create-manual')({
  validateSearch: (raw: Record<string, unknown>): QuestionCreateManualSearch => ({
    slotId: typeof raw.slotId === 'string' ? raw.slotId : undefined,
    campaignId: typeof raw.campaignId === 'string' ? raw.campaignId : undefined,
    campaignName: typeof raw.campaignName === 'string' ? raw.campaignName : undefined,
    subjectId: typeof raw.subjectId === 'string' ? raw.subjectId : undefined,
    topicId: typeof raw.topicId === 'string' ? raw.topicId : undefined,
    difficulty: typeof raw.difficulty === 'string' ? raw.difficulty : undefined,
    questionType: typeof raw.questionType === 'string' ? raw.questionType : undefined,
    revisorId: typeof raw.revisorId === 'string' ? raw.revisorId : undefined,
    manualeTitle: typeof raw.manualeTitle === 'string' ? raw.manualeTitle : undefined,
  }),
  beforeLoad: ({ context }) => {
    // Stesso controllo di /questions/create — vedi il commento lì sul perché aspettare
    // che le capabilities siano pronte prima di eventualmente reindirizzare.
    if (context.capabilities.state !== 'ready') return;
    if (!can(context.capabilities, 'questions', 'CREATE')) {
      throw redirect({ to: '/questions' });
    }
  },
  component: QuestionCreateManualPage,
});
