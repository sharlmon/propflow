\set ON_ERROR_STOP on

-- Payment-provider events are append-only evidence.
INSERT INTO payment_events (
  provider,
  provider_event_id,
  event_type,
  amount,
  account_reference,
  occurred_at
) VALUES (
  'sandbox',
  'FOUNDATION-IMMUTABLE-1',
  'payment',
  65000,
  'TENANCY-DEMO',
  '2026-08-24T08:00:00Z'
);

DO $$
BEGIN
  BEGIN
    UPDATE payment_events
    SET amount = 1
    WHERE provider_event_id = 'FOUNDATION-IMMUTABLE-1';
    RAISE EXCEPTION 'expected payment event update to fail';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'payment events are immutable' THEN
      RAISE;
    END IF;
  END;
END;
$$;

-- A confirmed short stay cannot overlap another confirmed stay.
UPDATE listings
SET mode = 'short_stay', nightly_rate = 7000
WHERE id = 'c1000000-0000-4000-8000-000000000001';

INSERT INTO bookings (
  id,
  listing_id,
  guest_id,
  check_in,
  check_out,
  nightly_rate,
  total_amount,
  status
) VALUES (
  'aa000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222222',
  '2026-09-01',
  '2026-09-04',
  7000,
  21000,
  'confirmed'
);

DO $$
BEGIN
  BEGIN
    INSERT INTO bookings (
      listing_id,
      guest_id,
      check_in,
      check_out,
      nightly_rate,
      total_amount,
      status
    ) VALUES (
      'c1000000-0000-4000-8000-000000000001',
      '22222222-2222-4222-8222-222222222222',
      '2026-09-03',
      '2026-09-05',
      7000,
      14000,
      'confirmed'
    );
    RAISE EXCEPTION 'expected overlapping booking to fail';
  EXCEPTION WHEN exclusion_violation THEN
    NULL;
  END;
END;
$$;

-- Contractor money cannot progress before milestone evidence is approved.
INSERT INTO construction_projects (
  id,
  organization_id,
  name,
  location,
  created_by
) VALUES (
  'bb000000-0000-4000-8000-000000000001',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'Foundation verification project',
  'Nairobi',
  '11111111-1111-4111-8111-111111111111'
);

INSERT INTO construction_milestones (
  id,
  project_id,
  title,
  milestone_value
) VALUES (
  'cc000000-0000-4000-8000-000000000001',
  'bb000000-0000-4000-8000-000000000001',
  'Foundation milestone',
  100000
);

DO $$
BEGIN
  BEGIN
    INSERT INTO contractor_payment_releases (
      milestone_id,
      contractor_id,
      amount,
      status
    ) VALUES (
      'cc000000-0000-4000-8000-000000000001',
      '11111111-1111-4111-8111-111111111111',
      50000,
      'approved'
    );
    RAISE EXCEPTION 'expected unapproved milestone release to fail';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM <> 'payment release requires approved milestone evidence' THEN
      RAISE;
    END IF;
  END;
END;
$$;

INSERT INTO contractor_payment_releases (
  milestone_id,
  contractor_id,
  amount,
  status
) VALUES (
  'cc000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  50000,
  'calculated'
);

-- Cold-start scoring is explicit and cannot manufacture a score.
INSERT INTO tenant_score_runs (
  id,
  tenant_id,
  status,
  score,
  version,
  rule_configuration,
  evidence_snapshot
) VALUES (
  'dd000000-0000-4000-8000-000000000001',
  '22222222-2222-4222-8222-222222222222',
  'insufficient_history',
  NULL,
  'foundation-v1',
  '{}',
  '{}'
);

DO $$
BEGIN
  BEGIN
    UPDATE tenant_score_runs
    SET score = 500
    WHERE id = 'dd000000-0000-4000-8000-000000000001';
    RAISE EXCEPTION 'expected cold-start score to fail';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END;
$$;

SELECT 'ecosystem foundation invariants verified' AS result;
