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

export interface Property {
  id: string;
  name: string;
  description: string;
  address_line: string;
  locality: string;
  county: string;
  status: 'active' | 'inactive';
  unit_count: number;
  available_units: number;
  created_at: string;
}

export interface Unit {
  id: string;
  property_id: string;
  unit_label: string;
  bedrooms: number;
  bathrooms: number;
  rent_amount: number;
  deposit_amount: number;
  availability_status: 'available' | 'occupied' | 'unavailable';
  listing_id?: string;
  listing_status?: 'draft' | 'published' | 'unpublished' | 'rented';
  created_at: string;
}

export interface PropertyDetail {
  property: Property;
  units: Unit[];
}
