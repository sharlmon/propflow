export type Role = 'landlord' | 'renter' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: Role;
  organization_id?: string;
}

export interface ApiErrorShape {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    request_id: string;
  };
}

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}
