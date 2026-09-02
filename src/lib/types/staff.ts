export const STAFF_ROLES = ['admin', 'supervisor', 'produttore', 'revisore', 'cd', 'doc'] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  supervisor: 'Supervisore',
  produttore: 'Produttore',
  revisore: 'Revisore',
  cd: 'CD',
  doc: 'DOC',
};

export interface CommunityUser {
  _id: string;
  cognitoId: string;
  roleIds?: string[];
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
  // Enriched from Cognito by the backend (searchCommunityUsers lambda)
  name?: string;
  surname?: string;
  email?: string;
}

export interface CommunityUsersResponse {
  total: number;
  communityUsers: CommunityUser[];
}

export interface GetCommunityUsersQuery {
  per_page?: string;
  page?: string;
  search?: string;
  roleId?: string;
}

export interface StaffFilters {
  search: string;
  roleId: string;
  page: number;
}

export interface StaffListState {
  data: CommunityUser[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateStaffRole: (staffId: string, roleIds: string[]) => Promise<void>;
  deleteStaff: (staffId: string) => Promise<void>;
}
