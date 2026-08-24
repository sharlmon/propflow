CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(email)),
  password_hash text NOT NULL,
  full_name text NOT NULL CHECK (length(full_name) BETWEEN 2 AND 120),
  phone text NOT NULL DEFAULT '',
  role text NOT NULL CHECK (role IN ('landlord', 'renter', 'admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE organization_members (
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'manager')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, user_id)
);

CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 120),
  description text NOT NULL DEFAULT '',
  address_line text NOT NULL,
  locality text NOT NULL,
  county text NOT NULL,
  latitude numeric(9,6),
  longitude numeric(9,6),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_label text NOT NULL,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0 AND bedrooms <= 20),
  bathrooms numeric(3,1) NOT NULL CHECK (bathrooms > 0 AND bathrooms <= 20),
  rent_amount numeric(12,2) NOT NULL CHECK (rent_amount >= 0),
  deposit_amount numeric(12,2) NOT NULL CHECK (deposit_amount >= 0),
  availability_status text NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'occupied', 'unavailable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (property_id, unit_label)
);

CREATE TABLE listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_id uuid NOT NULL UNIQUE REFERENCES units(id) ON DELETE RESTRICT,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  rent_amount numeric(12,2) NOT NULL CHECK (rent_amount >= 0),
  deposit_amount numeric(12,2) NOT NULL CHECK (deposit_amount >= 0),
  amenities text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'unpublished', 'rented')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE listing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  renter_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  message text NOT NULL CHECK (length(message) BETWEEN 10 AND 2000),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'accepted', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenancies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenant_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date,
  monthly_rent numeric(12,2) NOT NULL CHECK (monthly_rent >= 0),
  deposit_amount numeric(12,2) NOT NULL CHECK (deposit_amount >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active', 'ended', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR end_date > start_date)
);

CREATE UNIQUE INDEX one_active_tenancy_per_unit ON tenancies(unit_id) WHERE status = 'active';

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE RESTRICT,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  method text NOT NULL CHECK (method IN ('cash', 'bank', 'mpesa_demo')),
  reference text NOT NULL,
  status text NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded', 'reversed')),
  paid_at timestamptz NOT NULL,
  recorded_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenancy_id, reference)
);

CREATE TABLE maintenance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE RESTRICT,
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE RESTRICT,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(title) BETWEEN 3 AND 120),
  description text NOT NULL CHECK (length(description) BETWEEN 10 AND 2000),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash bytea NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_address inet,
  user_agent text NOT NULL DEFAULT '',
  request_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX properties_organization_idx ON properties(organization_id, created_at DESC);
CREATE INDEX units_property_idx ON units(property_id, created_at DESC);
CREATE INDEX listings_public_search_idx ON listings(status, published_at DESC);
CREATE INDEX properties_location_idx ON properties(county, locality);
CREATE INDEX inquiries_renter_idx ON inquiries(renter_id, created_at DESC);
CREATE INDEX inquiries_listing_idx ON inquiries(listing_id, status, created_at DESC);
CREATE INDEX tenancies_tenant_idx ON tenancies(tenant_id, status, created_at DESC);
CREATE INDEX tenancies_org_idx ON tenancies(organization_id, status, created_at DESC);
CREATE INDEX payments_tenancy_idx ON payments(tenancy_id, paid_at DESC);
CREATE INDEX maintenance_org_idx ON maintenance_requests(organization_id, status, created_at DESC);
CREATE INDEX maintenance_creator_idx ON maintenance_requests(created_by, created_at DESC);
CREATE INDEX sessions_active_idx ON sessions(token_hash, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX audit_org_idx ON audit_logs(organization_id, created_at DESC);
