export interface ClientBrand {
  id: string;
  name: string;
}

export interface Client {
  id: string;
  cognitoId: string;
  name: string;
  surname: string;
  email: string;
  brands: ClientBrand[];
}

export interface ClientsResponse {
  total: number;
  clients: Client[];
}

export interface GetClientsQuery {
  page?: string;
  search?: string;
}

export interface ClientFilters {
  page: number;
  search: string;
}

export interface ClientListState {
  data: Client[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface ClientModule {
  id: string;
  name: string;
  skuCode: string;
}

export interface ClientModulesResponse {
  modules: ClientModule[];
}

export interface ImpersonateClientResponse {
  message: string;
  data: {
    itk: string;
    ttlSec: number;
  };
}
