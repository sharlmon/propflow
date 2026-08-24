import type { ApiEnvelope, ApiErrorEnvelope } from '@propflow/contracts';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId?: string,
    public readonly fields?: Record<string, string>,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl ?? '/api/v1';

  return async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers);
    if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    const response = await (options.fetcher ?? fetch)(`${baseUrl}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | ApiErrorEnvelope | null;
    if (!response.ok) {
      const failure = payload && 'error' in payload ? payload.error : null;
      throw new ApiError(
        response.status,
        failure?.code ?? 'request_failed',
        failure?.message ?? 'The request could not be completed.',
        failure?.request_id,
        failure?.fields,
      );
    }
    if (!payload || !('data' in payload))
      throw new ApiError(response.status, 'invalid_response', 'The API returned an invalid response.');
    return payload.data;
  };
}
