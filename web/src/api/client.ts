import type { ApiEnvelope, ApiErrorShape } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export class ApiError extends Error {
  code: string;
  fields: Record<string, string>;
  requestId: string;
  status: number;

  constructor(status: number, payload?: ApiErrorShape) {
    super(payload?.error.message || 'The request could not be completed.');
    this.name = 'ApiError';
    this.status = status;
    this.code = payload?.error.code || 'request_failed';
    this.fields = payload?.error.fields || {};
    this.requestId = payload?.error.request_id || '';
  }
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, ...requestOptions } = options;
  const request: RequestInit = {
    ...requestOptions,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  };
  if (body !== undefined) request.body = JSON.stringify(body);
  const response = await fetch(`${API_BASE}${path}`, request);

  if (!response.ok) {
    let payload: ApiErrorShape | undefined;
    try {
      payload = (await response.json()) as ApiErrorShape;
    } catch {
      payload = undefined;
    }
    throw new ApiError(response.status, payload);
  }
  if (response.status === 204) return undefined as T;
  const payload = (await response.json()) as ApiEnvelope<T>;
  return payload.data;
}
