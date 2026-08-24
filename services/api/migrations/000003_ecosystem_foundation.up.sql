CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE users DROP CONSTRAINT users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (
  role IN ('landlord', 'renter', 'host', 'guest', 'developer', 'project_manager', 'supervisor', 'contractor', 'admin')
);

ALTER TABLE listings
  ADD COLUMN mode text NOT NULL DEFAULT 'long_term' CHECK (mode IN ('long_term', 'short_stay')),
  ADD COLUMN inventory_source text NOT NULL DEFAULT 'managed' CHECK (inventory_source IN ('managed', 'verified_host')),
  ADD COLUMN nightly_rate numeric(12,2) CHECK (nightly_rate IS NULL OR nightly_rate >= 0);

ALTER TABLE listings ADD CONSTRAINT listing_mode_pricing_check CHECK (
  (mode = 'long_term' AND nightly_rate IS NULL)
  OR (mode = 'short_stay' AND nightly_rate IS NOT NULL)
);

CREATE TABLE rent_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id uuid NOT NULL REFERENCES tenancies(id) ON DELETE RESTRICT,
  due_date date NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  settled_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (settled_amount >= 0),
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'partial', 'settled', 'waived', 'disputed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenancy_id, due_date)
);

CREATE TABLE payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('payment', 'reversal', 'adjustment')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL DEFAULT 'KES',
  account_reference text NOT NULL DEFAULT '',
  provider_reference text NOT NULL DEFAULT '',
  payload jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_event_id)
);

CREATE FUNCTION reject_payment_event_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'payment events are immutable';
END;
$$;

CREATE TRIGGER payment_events_immutable
BEFORE UPDATE OR DELETE ON payment_events
FOR EACH ROW EXECUTE FUNCTION reject_payment_event_mutation();

CREATE TABLE payment_reconciliation_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_event_id uuid NOT NULL UNIQUE REFERENCES payment_events(id) ON DELETE RESTRICT,
  payment_id uuid REFERENCES payments(id) ON DELETE RESTRICT,
  rent_obligation_id uuid REFERENCES rent_obligations(id) ON DELETE RESTRICT,
  match_type text NOT NULL CHECK (match_type IN ('automatic', 'manual', 'adjustment')),
  matched_amount numeric(12,2) NOT NULL CHECK (matched_amount > 0),
  matched_by uuid REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (payment_id IS NOT NULL OR rent_obligation_id IS NOT NULL)
);

CREATE TABLE payment_reconciliation_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_event_id uuid NOT NULL UNIQUE REFERENCES payment_events(id) ON DELETE RESTRICT,
  reason_code text NOT NULL CHECK (reason_code IN ('unmatched_reference', 'partial_payment', 'overpayment', 'duplicate', 'reversal', 'amount_mismatch')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolution_notes text NOT NULL DEFAULT '',
  resolved_by uuid REFERENCES users(id) ON DELETE RESTRICT,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'open' AND resolved_at IS NULL) OR status <> 'open')
);

CREATE TABLE media_objects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  bucket text NOT NULL,
  object_key text NOT NULL,
  content_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size > 0),
  sha256 text NOT NULL CHECK (sha256 ~ '^[a-f0-9]{64}$'),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'quarantined', 'deleted')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, object_key)
);

CREATE TABLE short_stay_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  stay_date date NOT NULL,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'blocked', 'booked')),
  nightly_rate numeric(12,2) CHECK (nightly_rate IS NULL OR nightly_rate >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, stay_date)
);

CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
  guest_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  check_in date NOT NULL,
  check_out date NOT NULL,
  nightly_rate numeric(12,2) NOT NULL CHECK (nightly_rate >= 0),
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'cancelled', 'checked_in', 'completed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (check_out > check_in)
);

ALTER TABLE bookings ADD CONSTRAINT no_overlapping_confirmed_bookings
EXCLUDE USING gist (listing_id WITH =, daterange(check_in, check_out, '[)') WITH &&)
WHERE (status IN ('confirmed', 'checked_in'));

CREATE TABLE guest_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL DEFAULT 'KES',
  provider text NOT NULL DEFAULT 'sandbox',
  provider_reference text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'recorded', 'failed', 'reversed')),
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_reference)
);

CREATE TABLE host_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
  host_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  gross_amount numeric(12,2) NOT NULL CHECK (gross_amount >= 0),
  platform_fee numeric(12,2) NOT NULL CHECK (platform_fee >= 0),
  payout_amount numeric(12,2) NOT NULL CHECK (payout_amount >= 0),
  provider text NOT NULL DEFAULT 'sandbox',
  provider_reference text,
  status text NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'queued', 'released', 'failed', 'reversed')),
  retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (payout_amount = gross_amount - platform_fee)
);

CREATE TABLE construction_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  name text NOT NULL CHECK (length(name) BETWEEN 2 AND 160),
  description text NOT NULL DEFAULT '',
  location text NOT NULL,
  status text NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
  start_date date,
  target_completion_date date,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (target_completion_date IS NULL OR start_date IS NULL OR target_completion_date >= start_date)
);

CREATE TABLE construction_project_members (
  project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  role text NOT NULL CHECK (role IN ('developer', 'project_manager', 'supervisor', 'contractor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

CREATE TABLE construction_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES construction_projects(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(title) BETWEEN 2 AND 160),
  description text NOT NULL DEFAULT '',
  milestone_value numeric(14,2) NOT NULL CHECK (milestone_value >= 0),
  due_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'ready_for_work', 'submitted', 'changes_requested', 'approved', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE milestone_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES construction_milestones(id) ON DELETE RESTRICT,
  version integer NOT NULL CHECK (version > 0),
  submitted_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  notes text NOT NULL CHECK (length(notes) BETWEEN 3 AND 4000),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  supersedes_id uuid REFERENCES milestone_evidence(id) ON DELETE RESTRICT,
  UNIQUE (milestone_id, version)
);

CREATE TABLE milestone_evidence_media (
  evidence_id uuid NOT NULL REFERENCES milestone_evidence(id) ON DELETE CASCADE,
  media_object_id uuid NOT NULL REFERENCES media_objects(id) ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  PRIMARY KEY (evidence_id, media_object_id)
);

CREATE TABLE milestone_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_id uuid NOT NULL REFERENCES milestone_evidence(id) ON DELETE RESTRICT,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'resubmission_requested')),
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (decision = 'approved' OR length(reason) >= 5)
);

CREATE TABLE contractor_payment_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES construction_milestones(id) ON DELETE RESTRICT,
  contractor_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount numeric(14,2) NOT NULL CHECK (amount > 0),
  provider text NOT NULL DEFAULT 'sandbox',
  provider_reference text,
  status text NOT NULL DEFAULT 'calculated' CHECK (status IN ('calculated', 'approved', 'queued', 'released', 'failed', 'reversed')),
  approved_by uuid REFERENCES users(id) ON DELETE RESTRICT,
  approved_at timestamptz,
  retry_count integer NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (milestone_id, contractor_id)
);

CREATE FUNCTION enforce_approved_milestone_release() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IN ('approved', 'queued', 'released') AND NOT EXISTS (
    SELECT 1
    FROM milestone_evidence evidence
    JOIN milestone_reviews review ON review.evidence_id = evidence.id
    WHERE evidence.milestone_id = NEW.milestone_id
      AND review.decision = 'approved'
  ) THEN
    RAISE EXCEPTION 'payment release requires approved milestone evidence';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER contractor_release_requires_approval
BEFORE INSERT OR UPDATE OF status ON contractor_payment_releases
FOR EACH ROW EXECUTE FUNCTION enforce_approved_milestone_release();

CREATE TABLE tenant_score_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status text NOT NULL CHECK (status IN ('scored', 'insufficient_history')),
  score integer CHECK (score IS NULL OR score BETWEEN 0 AND 1000),
  version text NOT NULL,
  rule_configuration jsonb NOT NULL,
  evidence_snapshot jsonb NOT NULL,
  requires_human_review boolean NOT NULL DEFAULT true,
  appeal_status text NOT NULL DEFAULT 'not_requested' CHECK (appeal_status IN ('not_requested', 'requested', 'under_review', 'corrected', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((status = 'insufficient_history' AND score IS NULL) OR (status = 'scored' AND score IS NOT NULL))
);

CREATE TABLE tenant_score_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  score_run_id uuid NOT NULL REFERENCES tenant_score_runs(id) ON DELETE CASCADE,
  component text NOT NULL CHECK (component IN ('payment', 'lease_adherence', 'identity_verification')),
  raw_score integer NOT NULL CHECK (raw_score BETWEEN 0 AND 1000),
  weight numeric(4,3) NOT NULL CHECK (weight > 0 AND weight <= 1),
  contribution integer NOT NULL CHECK (contribution BETWEEN 0 AND 1000),
  reasons text[] NOT NULL DEFAULT '{}',
  UNIQUE (score_run_id, component)
);

CREATE INDEX rent_obligations_due_idx ON rent_obligations(status, due_date);
CREATE INDEX payment_events_reference_idx ON payment_events(account_reference, occurred_at DESC);
CREATE INDEX reconciliation_exceptions_status_idx ON payment_reconciliation_exceptions(status, created_at DESC);
CREATE INDEX short_stay_availability_search_idx ON short_stay_availability(stay_date, status, listing_id);
CREATE INDEX bookings_guest_idx ON bookings(guest_id, created_at DESC);
CREATE INDEX bookings_listing_idx ON bookings(listing_id, check_in, check_out);
CREATE INDEX host_payouts_host_idx ON host_payouts(host_id, status, created_at DESC);
CREATE INDEX construction_projects_org_idx ON construction_projects(organization_id, status, created_at DESC);
CREATE INDEX construction_milestones_project_idx ON construction_milestones(project_id, status, due_date);
CREATE INDEX milestone_evidence_milestone_idx ON milestone_evidence(milestone_id, version DESC);
CREATE INDEX contractor_releases_status_idx ON contractor_payment_releases(status, created_at DESC);
CREATE INDEX tenant_score_runs_tenant_idx ON tenant_score_runs(tenant_id, created_at DESC);
