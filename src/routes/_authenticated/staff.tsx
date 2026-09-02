import { createFileRoute } from '@tanstack/react-router';
import { StaffPage } from '@/components/staff';

interface StaffSearch {
  search?: string;
  roleId?: string;
  page?: number;
}

export const Route = createFileRoute('/_authenticated/staff')({
  validateSearch: (raw: Record<string, unknown>): StaffSearch => ({
    search: typeof raw.search === 'string' ? raw.search : undefined,
    roleId: typeof raw.roleId === 'string' ? raw.roleId : undefined,
    page:
      typeof raw.page === 'number'
        ? raw.page
        : typeof raw.page === 'string'
          ? parseInt(raw.page, 10) || undefined
          : undefined,
  }),
  component: StaffPage,
});
