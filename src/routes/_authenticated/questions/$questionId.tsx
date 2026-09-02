import { createFileRoute, redirect } from '@tanstack/react-router';
import { QuestionEditPage } from '@/components/questions';
import { can } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/questions/$questionId')({
  validateSearch: (search: Record<string, unknown>) => ({
    review: search.review === true || search.review === 'true' ? true : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.capabilities.state !== 'ready') return;
    if (!can(context.capabilities, 'questions', 'UPDATE')) {
      throw redirect({ to: '/questions' });
    }
  },
  component: QuestionEditPage,
});
