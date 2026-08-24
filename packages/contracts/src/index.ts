export type ProductKey = 'ecosystem' | 'propflow' | 'keja' | 'stay' | 'jengabora';

export type PlatformRole =
  | 'landlord'
  | 'renter'
  | 'host'
  | 'guest'
  | 'developer'
  | 'project_manager'
  | 'supervisor'
  | 'contractor'
  | 'admin';

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    request_id: string;
  };
}

export interface PlatformHealth {
  service: string;
  products: ProductKey[];
}

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: PlatformRole;
  organization_id?: string;
}
