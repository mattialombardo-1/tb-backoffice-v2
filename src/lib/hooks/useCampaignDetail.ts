import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { queryKeys } from '@/lib/query';
import type { CampaignDetail } from '@/lib/types/campaigns';

export interface CampaignDetailResult {
  data: CampaignDetail | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCampaignDetail(campaignId: string): CampaignDetailResult {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.campaigns.detail(campaignId),
    queryFn: ({ signal }) => campaignsService.get(client, campaignId, signal),
    staleTime: 0,
    enabled: !!campaignId,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
