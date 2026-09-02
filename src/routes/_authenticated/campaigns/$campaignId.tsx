import { createFileRoute } from '@tanstack/react-router';
import { CampaignDetailPage } from '@/components/campaigns/CampaignDetailPage';

export const Route = createFileRoute('/_authenticated/campaigns/$campaignId')({
  component: CampaignDetailPage,
});
