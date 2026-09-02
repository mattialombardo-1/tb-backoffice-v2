import { createFileRoute, redirect } from '@tanstack/react-router';
import { QuestionsImportPage } from '@/components/questions';
import { can } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/questions/import')({
  beforeLoad: ({ context }) => {
    // Mirror /questions/create: only redirect once we definitively know the
    // user lacks the capability (avoid bouncing while the snapshot loads).
    if (context.capabilities.state !== 'ready') return;
    if (!can(context.capabilities, 'questions', 'CREATE')) {
      throw redirect({ to: '/questions' });
    }
  },
  component: QuestionsImportPage,
});
