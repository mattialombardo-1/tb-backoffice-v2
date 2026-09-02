import { useQuery } from '@tanstack/react-query';
import { useApiClient } from '@/lib/api/useApiClient';
import { staffService } from '@/lib/services/staff';
import { queryKeys } from '@/lib/query';
import type { MultiSelectOption } from '@/components/ui/multi-select';

function authorLabel(user: {
  cognitoId: string;
  name?: string;
  surname?: string;
  email?: string;
}): string {
  const full = [user.name, user.surname].filter(Boolean).join(' ');
  return full || user.email || user.cognitoId;
}

export function useAuthorsList(): {
  options: MultiSelectOption[];
  isLoading: boolean;
  error: string | null;
} {
  const client = useApiClient();

  const query = useQuery({
    queryKey: queryKeys.authors.all,
    queryFn: ({ signal }) =>
      staffService.list(client, { per_page: '500' }, signal),
    staleTime: 5 * 60_000,
  });

  const users = query.data?.communityUsers ?? [];

  return {
    options: users
      .filter((u) => !!u.cognitoId)
      .map((u) => ({
        value: u.cognitoId,
        label: authorLabel(u),
      })),
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
