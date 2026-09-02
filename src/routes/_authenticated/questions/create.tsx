import { createFileRoute, redirect } from '@tanstack/react-router';
import { QuestionCreatePage } from '@/components/questions';
import { can } from '@/lib/auth';

interface QuestionCreateSearch {
  questionId?: string;
  /** Campaign slot pre-fill params */
  slotId?: string;
  campaignId?: string;
  campaignName?: string;
  subjectId?: string;
  topicId?: string;
  difficulty?: string;
  questionType?: string;
  /** Pre-assigned reviewer from campaign slot — skips the reviewer picker dialog */
  revisorId?: string;
  /** Opens the question in review mode: read-only with Approve / Edit actions */
  reviewMode?: boolean;
}

export const Route = createFileRoute('/_authenticated/questions/create')({
  validateSearch: (raw: Record<string, unknown>): QuestionCreateSearch => ({
    questionId: typeof raw.questionId === 'string' ? raw.questionId : undefined,
    slotId: typeof raw.slotId === 'string' ? raw.slotId : undefined,
    campaignId: typeof raw.campaignId === 'string' ? raw.campaignId : undefined,
    campaignName: typeof raw.campaignName === 'string' ? raw.campaignName : undefined,
    subjectId: typeof raw.subjectId === 'string' ? raw.subjectId : undefined,
    topicId: typeof raw.topicId === 'string' ? raw.topicId : undefined,
    difficulty: typeof raw.difficulty === 'string' ? raw.difficulty : undefined,
    questionType: typeof raw.questionType === 'string' ? raw.questionType : undefined,
    revisorId: typeof raw.revisorId === 'string' ? raw.revisorId : undefined,
    reviewMode: raw.reviewMode === true || raw.reviewMode === 'true',
  }),
  beforeLoad: ({ context }) => {
    // Don't bounce the user while /community-profile is still in flight —
    // they'd get kicked to /questions on every direct-load. Only redirect
    // once we definitively know they lack the capability. The BE enforces
    // the same check on the submit handler, so any visual leak between
    // mount and the snapshot resolving is harmless.
    if (context.capabilities.state !== 'ready') return;
    if (!can(context.capabilities, 'questions', 'CREATE')) {
      throw redirect({ to: '/questions' });
    }
  },
  component: QuestionCreatePage,
});
