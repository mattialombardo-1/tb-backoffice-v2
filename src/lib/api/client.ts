/**
 * API Client for Backend Integration
 *
 * This client handles HTTP requests to the AWS API Gateway backend.
 * It includes automatic token management, retry logic, and error handling.
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

/**
 * Configuration for the API client
 *
 * Requirement 6.1: Base URL configured for AWS API Gateway
 */
export interface APIClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

/**
 * Default configuration
 *
 * Base URL resolves from `VITE_API_BASE_URL` (set in `.env` / `.env.local`),
 * falling back to the deployed AdminApiStackStg endpoint. See CLAUDE.md.
 */
export const defaultConfig: APIClientConfig = {
  baseURL:
    import.meta.env.VITE_API_BASE_URL,
  // 60s tolerates cold-start lambdas on first hits to per-route handlers.
  // API Gateway itself caps integration at 29s, so anything >29s upstream is a
  // backend issue (provisioned concurrency / cold-start budget) — not solvable
  // from the client.
  timeout: 60000,
  retryAttempts: 3,
  retryDelay: 1000,
};

/**
 * Request configuration options
 */
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  skipAuth?: boolean;
  signal?: AbortSignal;
  data?: any;
}

/**
 * API response wrapper
 */
export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * API error structure
 */
export interface APIError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Custom error class for API errors
 */
export class APIClientError extends Error {
  public statusCode: number;
  public error: string;
  public details?: any;

  constructor(statusCode: number, error: string, details?: any) {
    super(error);
    this.name = 'APIClientError';
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (config: RequestConfig) => Promise<RequestConfig>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = (error: any) => Promise<any>;

/**
 * API Client class
 *
 * Provides methods for making HTTP requests to the backend API.
 * Supports GET, POST, PUT, and DELETE methods.
 */
export class APIClient {
  private config: APIClientConfig;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor(config: Partial<APIClientConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Build full URL with query parameters
   */
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // Concatenate explicitly: `new URL('/brands', 'https://host/prod')` would
    // strip `/prod` because absolute-path endpoints replace the base path.
    const rawBase = this.config.baseURL.replace(/\/+$/, '');
    // VITE_API_BASE_URL è quasi sempre assoluto (staging, mock locale) — `new
    // URL()` senza secondo argomento lo richiede. L'eccezione è il deploy demo
    // su Vercel (vedi api/mock-api/), dove l'API vive sotto lo stesso dominio
    // del sito e l'URL esatto non è noto in anticipo: lì VITE_API_BASE_URL è
    // relativo ("/api/mock-api"), risolto qui contro l'origine corrente.
    const base = rawBase.startsWith('/') ? window.location.origin + rawBase : rawBase;
    const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = new URL(base + path);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let modifiedConfig = config;

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(error: any): Promise<any> {
    let currentError = error;

    for (const interceptor of this.responseInterceptors) {
      try {
        await interceptor(currentError);
      } catch (err) {
        currentError = err;
      }
    }

    throw currentError;
  }

  /**
   * Make HTTP request with retry logic
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    // Apply request interceptors
    const modifiedConfig = await this.applyRequestInterceptors(config);

    const url = this.buildURL(endpoint, modifiedConfig.params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...modifiedConfig.headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers,
      signal: modifiedConfig.signal,
    };

    if (data !== undefined && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')) {
      requestOptions.body = JSON.stringify(data);
    }

    let lastError: any;

    // Retry logic
    for (let attempt = 0; attempt <= this.config.retryAttempts; attempt++) {
      // Track whether the abort came from our internal timeout (vs. an external
      // signal such as a component unmounting). External aborts must be
      // re-thrown as AbortError so callers can silence them; internal timeouts
      // should produce a user-visible APIClientError(408).
      let timedOut = false;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          timedOut = true;
          controller.abort();
        }, this.config.timeout);

        const response = await fetch(url, {
          ...requestOptions,
          signal: modifiedConfig.signal || controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            error: 'Unknown error',
            message: response.statusText,
          }));

          const error = new APIClientError(
            response.status,
            errorData.message || errorData.error || 'Request failed',
            errorData
          );

          // Apply response interceptors for errors
          await this.applyResponseInterceptors(error);

          throw error;
        }

        // Parse successful response. 204 No Content (e.g. DELETE handlers after
        // the 2026-05 admin audit standardised on 204 for deletes) has no body —
        // calling .json() on it throws "Unexpected end of JSON input". 304 Not
        // Modified is treated the same defensively even if no current endpoint
        // returns it.
        if (response.status === 204 || response.status === 304) {
          return undefined as T;
        }
        const responseData = await response.json();
        return responseData as T;
      } catch (error: any) {
        lastError = error;

        // Don't retry on certain errors
        if (
          error instanceof APIClientError &&
          (error.statusCode === 401 || error.statusCode === 403)
        ) {
          throw error;
        }

        // Abort handling: internal timeout → user-visible error; external signal
        // (e.g. component unmount) → re-throw as AbortError so callers can ignore it.
        if (error.name === 'AbortError') {
          if (timedOut) {
            throw new APIClientError(408, 'Request timeout', { originalError: error });
          }
          throw error;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.config.retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay * (attempt + 1))
          );
        }
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * GET request
   *
   * @param endpoint - API endpoint path
   * @param config - Request configuration
   * @returns Promise with response data
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  /**
   * POST request
   *
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise with response data
   */
  async post<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, config);
  }

  /**
   * PUT request
   *
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise with response data
   */
  async put<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  /**
   * PATCH request
   *
   * @param endpoint - API endpoint path
   * @param data - Request body data
   * @param config - Request configuration
   * @returns Promise with response data
   */
  async patch<T>(endpoint: string, data: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  /**
   * DELETE request
   *
   * @param endpoint - API endpoint path
   * @param config - Request configuration
   * @returns Promise with response data
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, config?.data, config);
  }
}

/**
 * Default API client instance
 */
export const apiClient = new APIClient();
