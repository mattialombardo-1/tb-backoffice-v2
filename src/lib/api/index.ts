/**
 * API Client Module
 *
 * Exports configured API client with authentication interceptors.
 */

export { APIClient, apiClient, APIClientError } from './client';
export type {
  APIClientConfig,
  RequestConfig,
  APIResponse,
  APIError,
  RequestInterceptor,
  ResponseInterceptor,
} from './client';

export { createAuthRequestInterceptor, createAuthResponseInterceptor } from './interceptors';
