export interface CommunityRoleCapability {
  resource: string;
  actions: string[];
}

export interface CommunityRole {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  rank: number;
  capabilities: CommunityRoleCapability[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityRolesResponse {
  data: CommunityRole[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCommunityRolePayload {
  name: string;
  displayName: string;
  rank: number;
  description?: string;
  capabilities?: CommunityRoleCapability[];
}

export interface UpdateCommunityRolePayload {
  displayName?: string;
  description?: string;
  rank?: number;
  capabilities?: CommunityRoleCapability[];
}
