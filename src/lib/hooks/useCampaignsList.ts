import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { queryKeys } from '@/lib/query';
import type { Campaign } from '@/lib/types/campaigns';

export interface CampaignsListResult {
  data: Campaign[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCampaignsList(page: number, search?: string): CampaignsListResult {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.campaigns.list(page, search),
    queryFn: ({ signal }) => campaignsService.list(client, { page, search }, signal),
    staleTime: 30_000,
  });

  return {
    data: query.data?.campaigns ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
