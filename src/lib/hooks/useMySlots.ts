import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { campaignsService } from '@/lib/services/campaignsService';
import { queryKeys } from '@/lib/query';
import type { CampaignSlotWithContext } from '@/lib/types/campaigns';

export interface SlotGroup {
  campaignId: string;
  campaignName: string;
  slots: CampaignSlotWithContext[];
}

export function useMySlots() {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.campaigns.mySlots,
    queryFn: ({ signal }) => campaignsService.mySlots(client, signal),
    staleTime: 30_000,
  });

  // Group slots by campaign
  const groups: SlotGroup[] = [];
  if (Array.isArray(query.data)) {
    const map = new Map<string, SlotGroup>();
    for (const slot of query.data) {
      const key = slot.campaignId;
      if (!map.has(key)) {
        map.set(key, { campaignId: key, campaignName: slot.campaignName, slots: [] });
      }
      map.get(key)!.slots.push(slot);
    }
    groups.push(...map.values());
  }

  return {
    groups,
    total: query.data?.length ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
