import { createFileRoute, redirect } from '@tanstack/react-router';
import { MySlotsPage } from '@/components/campaigns/MySlotsPage';
import { can } from '@/lib/auth';

export const Route = createFileRoute('/_authenticated/my-slots/')({
  beforeLoad: ({ context }) => {
    if (context.capabilities.state !== 'ready') return;
    if (!can(context.capabilities, 'campaigns', 'READ')) {
      throw redirect({ to: '/campaigns' });
    }
  },
  component: MySlotsPage,
});
