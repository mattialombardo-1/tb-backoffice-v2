import type { CommunityUser } from './staff';

// Action vocabulary is fixed by the backend (CRUD) — uppercase to match backend enums.
export type Action = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';

// Known resources today. We allow an opaque `string` fallback so the FE
// keeps working when ops adds a new resource server-side — `can()` just
// returns false for resources we don't know about, which is the safe default.
export type KnownResource =
  | 'users'
  | 'questions'
  | 'subjects'
  | 'community-users'
  | 'community-roles'
  | 'brands'
  | 'pools'
  | 'packages'
  | 'campaigns'
  | 'skus'
  | 'collections'
  | 'attributes';

export type Resource = KnownResource | (string & {});

export interface Capability {
  resource: Resource;
  actions: Action[];
}

export interface MeResponse {
  user: CommunityUser;
  capabilities: Capability[];
}
