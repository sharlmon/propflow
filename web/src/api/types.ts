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

export interface Listing {
  id: string;
  property_id: string;
  unit_id: string;
  slug: string;
  title: string;
  description: string;
  rent_amount: number;
  deposit_amount: number;
  amenities: string[];
  status: 'draft' | 'published' | 'unpublished' | 'rented';
  published_at?: string;
  property_name: string;
  locality: string;
  county: string;
  bedrooms: number;
  bathrooms: number;
  image_url: string;
  image_alt: string;
  organization_name?: string;
}

export interface Inquiry {
  id: string;
  listing_id: string;
  renter_id: string;
  message: string;
  status: 'new' | 'contacted' | 'viewing_scheduled' | 'accepted' | 'closed';
  created_at: string;
  listing_title: string;
  listing_slug: string;
  locality: string;
  renter_name?: string;
  renter_email?: string;
}

export interface Tenancy {
  id: string;
  property_id: string;
  unit_id: string;
  tenant_id: string;
  property_name: string;
  unit_label: string;
  tenant_name: string;
  tenant_email: string;
  start_date: string;
  end_date?: string;
  monthly_rent: number;
  deposit_amount: number;
  status: 'pending' | 'active' | 'ended' | 'cancelled';
}
