import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { staffService } from '@/lib/services/staff';
import { queryKeys } from '@/lib/query';
import type { CommunityUser } from '@/lib/types/staff';

const PAGE_SIZE = 100;

interface UseReviewerListReturn {
  reviewers: CommunityUser[];
  isLoading: boolean;
}

// FIXME(elliot-audit-2026-05): broken until /community-roles is wired.
// PR-05 dropped the role-NAME column from /community-users; the backend now
// filters by `roleId` (ObjectId). We still send `role: 'revisore'`, which the
// BE silently ignores — so this returns ALL community users, not just
// reviewers. The proper fix is to fetch /community-roles, resolve the
// "revisore"/reviewer-equivalent role ObjectId, and pass it as `roleId`.
// Until that lands, ReviewerAssignDialog will show the wrong set of users.
export function useReviewerList(options?: { enabled?: boolean }): UseReviewerListReturn {
  const client = useApiClient();

  const query = useQuery({
    // Use a versioned key so the old CommunityUsersResponse-shaped cache
    // entry (from before the all-pages refactor) is never returned here.
    queryKey: [...queryKeys.staff.reviewers, 'all'],
    enabled: options?.enabled ?? true,
    queryFn: async ({ signal }): Promise<CommunityUser[]> => {
      // Fetch the first page to learn the total count
      const first = await staffService.list(
        client,
        { per_page: String(PAGE_SIZE), page: '1' },
        signal
      );

      const allUsers = [...first.communityUsers];
      const total = first.total ?? allUsers.length;

      if (total <= PAGE_SIZE) return allUsers;

      // Fetch all remaining pages concurrently
      const extraPages = Math.ceil((total - PAGE_SIZE) / PAGE_SIZE);
      const rest = await Promise.all(
        Array.from({ length: extraPages }, (_, i) =>
          staffService.list(
            client,
            { per_page: String(PAGE_SIZE), page: String(i + 2) },
            signal
          )
        )
      );

      return [...allUsers, ...rest.flatMap((r) => r.communityUsers)];
    },
    staleTime: 2 * 60_000,
  });

  return {
    reviewers: Array.isArray(query.data) ? query.data : [],
    isLoading: query.isLoading,
  };
}
