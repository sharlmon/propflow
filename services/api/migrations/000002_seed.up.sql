-- Deterministic development/demo seed. Password for all demo accounts: DemoPass2026!
INSERT INTO users (id, email, password_hash, full_name, phone, role, status, created_at, updated_at) VALUES
  ('11111111-1111-4111-8111-111111111111', 'landlord@propflow.demo', '$argon2id$v=19$m=65536,t=3,p=2$RrQThgYvumX4OP0ZbnSdBw$ttJPTcSbgiAu2u9rMBYvubfXA/Bc4PH53HiAKVl0Ov8', 'Amani Kamau', '+254700000101', 'landlord', 'active', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
  ('22222222-2222-4222-8222-222222222222', 'renter@propflow.demo', '$argon2id$v=19$m=65536,t=3,p=2$RrQThgYvumX4OP0ZbnSdBw$ttJPTcSbgiAu2u9rMBYvubfXA/Bc4PH53HiAKVl0Ov8', 'Wanjiku Njeri', '+254700000202', 'renter', 'active', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z'),
  ('33333333-3333-4333-8333-333333333333', 'admin@propflow.demo', '$argon2id$v=19$m=65536,t=3,p=2$RrQThgYvumX4OP0ZbnSdBw$ttJPTcSbgiAu2u9rMBYvubfXA/Bc4PH53HiAKVl0Ov8', 'Demo Administrator', '+254700000303', 'admin', 'active', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organizations (id, name, created_at, updated_at) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Amani Homes', '2026-08-01T08:00:00Z', '2026-08-01T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO organization_members (organization_id, user_id, role, created_at) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'owner', '2026-08-01T08:00:00Z')
ON CONFLICT DO NOTHING;

INSERT INTO properties (id, organization_id, name, description, address_line, locality, county, status, created_at, updated_at) VALUES
  ('a1000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Kilimani Garden Court', 'Quiet city apartments close to Yaya Centre.', 'Kindaruma Road', 'Kilimani', 'Nairobi', 'active', '2026-08-02T08:00:00Z', '2026-08-02T08:00:00Z'),
  ('a2000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Westlands Skyline', 'Modern apartments with reliable security and backup power.', 'Muthangari Drive', 'Westlands', 'Nairobi', 'active', '2026-08-02T09:00:00Z', '2026-08-02T09:00:00Z'),
  ('a3000000-0000-4000-8000-000000000003', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ruaka Ridge', 'Family homes near Two Rivers and public transport.', 'Limuru Road', 'Ruaka', 'Kiambu', 'active', '2026-08-02T10:00:00Z', '2026-08-02T10:00:00Z'),
  ('a4000000-0000-4000-8000-000000000004', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ruiru Green Apartments', 'Affordable apartments with on-site water storage.', 'Thika Superhighway', 'Ruiru', 'Kiambu', 'active', '2026-08-02T11:00:00Z', '2026-08-02T11:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO units (id, property_id, unit_label, bedrooms, bathrooms, rent_amount, deposit_amount, availability_status, created_at, updated_at) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'A-1', 2, 2, 65000, 65000, 'occupied', '2026-08-03T08:00:00Z', '2026-08-03T08:00:00Z'),
  ('b1000000-0000-4000-8000-000000000002', 'a1000000-0000-4000-8000-000000000001', 'A-2', 1, 1, 45000, 45000, 'available', '2026-08-03T08:10:00Z', '2026-08-03T08:10:00Z'),
  ('b2000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000002', 'W-5', 2, 2, 85000, 85000, 'available', '2026-08-03T08:20:00Z', '2026-08-03T08:20:00Z'),
  ('b2000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000002', 'W-8', 3, 2.5, 125000, 125000, 'available', '2026-08-03T08:30:00Z', '2026-08-03T08:30:00Z'),
  ('b3000000-0000-4000-8000-000000000005', 'a3000000-0000-4000-8000-000000000003', 'R-2', 1, 1, 30000, 30000, 'available', '2026-08-03T08:40:00Z', '2026-08-03T08:40:00Z'),
  ('b3000000-0000-4000-8000-000000000006', 'a3000000-0000-4000-8000-000000000003', 'R-4', 2, 2, 48000, 48000, 'available', '2026-08-03T08:50:00Z', '2026-08-03T08:50:00Z'),
  ('b4000000-0000-4000-8000-000000000007', 'a4000000-0000-4000-8000-000000000004', 'G-3', 1, 1, 24000, 24000, 'available', '2026-08-03T09:00:00Z', '2026-08-03T09:00:00Z'),
  ('b4000000-0000-4000-8000-000000000008', 'a4000000-0000-4000-8000-000000000004', 'G-6', 2, 1.5, 36000, 36000, 'available', '2026-08-03T09:10:00Z', '2026-08-03T09:10:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO listings (id, property_id, unit_id, slug, title, description, rent_amount, deposit_amount, amenities, status, published_at, created_at, updated_at) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', 'bright-one-bedroom-kilimani', 'Bright one-bedroom in Kilimani', 'A bright, secure home with a balcony and quick access to shops and transport.', 45000, 45000, ARRAY['Balcony','Backup water','24-hour security'], 'published', '2026-08-10T08:00:00Z', '2026-08-10T08:00:00Z', '2026-08-10T08:00:00Z'),
  ('c2000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000003', 'modern-two-bedroom-westlands', 'Modern two-bedroom in Westlands', 'Well-finished apartment with lift access and a dedicated parking space.', 85000, 85000, ARRAY['Lift','Parking','Generator'], 'published', '2026-08-11T08:00:00Z', '2026-08-11T08:00:00Z', '2026-08-11T08:00:00Z'),
  ('c3000000-0000-4000-8000-000000000003', 'a2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000004', 'spacious-three-bedroom-westlands', 'Spacious three-bedroom in Westlands', 'Large family apartment with a study nook and generous natural light.', 125000, 125000, ARRAY['Gym','Parking','Backup power'], 'published', '2026-08-12T08:00:00Z', '2026-08-12T08:00:00Z', '2026-08-12T08:00:00Z'),
  ('c4000000-0000-4000-8000-000000000004', 'a3000000-0000-4000-8000-000000000003', 'b3000000-0000-4000-8000-000000000005', 'compact-one-bedroom-ruaka', 'Compact one-bedroom in Ruaka', 'A practical apartment near shops, matatu connections, and Two Rivers.', 30000, 30000, ARRAY['CCTV','Backup water'], 'published', '2026-08-13T08:00:00Z', '2026-08-13T08:00:00Z', '2026-08-13T08:00:00Z'),
  ('c5000000-0000-4000-8000-000000000005', 'a3000000-0000-4000-8000-000000000003', 'b3000000-0000-4000-8000-000000000006', 'family-two-bedroom-ruaka', 'Family two-bedroom in Ruaka', 'Comfortable two-bedroom home with secure parking and a play area.', 48000, 48000, ARRAY['Parking','Play area','Security'], 'published', '2026-08-14T08:00:00Z', '2026-08-14T08:00:00Z', '2026-08-14T08:00:00Z'),
  ('c6000000-0000-4000-8000-000000000006', 'a4000000-0000-4000-8000-000000000004', 'b4000000-0000-4000-8000-000000000007', 'affordable-one-bedroom-ruiru', 'Affordable one-bedroom in Ruiru', 'Clean, affordable apartment with reliable water near the superhighway.', 24000, 24000, ARRAY['Backup water','Caretaker'], 'published', '2026-08-15T08:00:00Z', '2026-08-15T08:00:00Z', '2026-08-15T08:00:00Z'),
  ('c7000000-0000-4000-8000-000000000007', 'a4000000-0000-4000-8000-000000000004', 'b4000000-0000-4000-8000-000000000008', 'two-bedroom-ruiru', 'Two-bedroom near Ruiru town', 'Convenient two-bedroom home with a spacious kitchen and secure compound.', 36000, 36000, ARRAY['Parking','Caretaker','CCTV'], 'published', '2026-08-16T08:00:00Z', '2026-08-16T08:00:00Z', '2026-08-16T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO listing_images (id, listing_id, image_url, alt_text, sort_order) VALUES
  ('d1000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', '/demo/kilimani.svg', 'Bright apartment living room in Kilimani', 0),
  ('d2000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', '/demo/westlands.svg', 'Modern apartment building in Westlands', 0),
  ('d3000000-0000-4000-8000-000000000003', 'c3000000-0000-4000-8000-000000000003', '/demo/westlands.svg', 'Spacious apartment interior in Westlands', 0),
  ('d4000000-0000-4000-8000-000000000004', 'c4000000-0000-4000-8000-000000000004', '/demo/ruaka.svg', 'Apartment balcony in Ruaka', 0),
  ('d5000000-0000-4000-8000-000000000005', 'c5000000-0000-4000-8000-000000000005', '/demo/ruaka.svg', 'Family apartment in Ruaka', 0),
  ('d6000000-0000-4000-8000-000000000006', 'c6000000-0000-4000-8000-000000000006', '/demo/ruiru.svg', 'Apartment exterior in Ruiru', 0),
  ('d7000000-0000-4000-8000-000000000007', 'c7000000-0000-4000-8000-000000000007', '/demo/ruiru.svg', 'Secure apartment compound in Ruiru', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO inquiries (id, listing_id, renter_id, message, status, created_at, updated_at) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'c2000000-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222', 'I would like to arrange a viewing this Saturday morning.', 'new', '2026-08-18T09:00:00Z', '2026-08-18T09:00:00Z'),
  ('e2000000-0000-4000-8000-000000000002', 'c4000000-0000-4000-8000-000000000004', '22222222-2222-4222-8222-222222222222', 'Please confirm whether the building allows a small indoor cat.', 'contacted', '2026-08-17T09:00:00Z', '2026-08-18T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenancies (id, organization_id, property_id, unit_id, tenant_id, start_date, end_date, monthly_rent, deposit_amount, status, created_at, updated_at) VALUES
  ('f1000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', '2026-01-01', '2026-12-31', 65000, 65000, 'active', '2026-01-01T08:00:00Z', '2026-01-01T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payments (id, tenancy_id, amount, method, reference, status, paid_at, recorded_by, created_at, updated_at) VALUES
  ('f2000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', 65000, 'mpesa_demo', 'DEMO-JUN-2026', 'recorded', '2026-06-02T10:00:00Z', '11111111-1111-4111-8111-111111111111', '2026-06-02T10:00:00Z', '2026-06-02T10:00:00Z'),
  ('f2000000-0000-4000-8000-000000000002', 'f1000000-0000-4000-8000-000000000001', 65000, 'bank', 'DEMO-JUL-2026', 'recorded', '2026-07-02T10:00:00Z', '11111111-1111-4111-8111-111111111111', '2026-07-02T10:00:00Z', '2026-07-02T10:00:00Z'),
  ('f2000000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000001', 65000, 'cash', 'DEMO-AUG-2026', 'recorded', '2026-08-02T10:00:00Z', '11111111-1111-4111-8111-111111111111', '2026-08-02T10:00:00Z', '2026-08-02T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

INSERT INTO maintenance_requests (id, organization_id, property_id, unit_id, tenancy_id, created_by, title, description, priority, status, created_at, updated_at) VALUES
  ('f3000000-0000-4000-8000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Kitchen tap is leaking', 'The kitchen tap continues dripping after it is fully closed.', 'medium', 'acknowledged', '2026-08-19T08:00:00Z', '2026-08-19T10:00:00Z'),
  ('f3000000-0000-4000-8000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Bedroom socket is loose', 'The wall socket beside the bedroom window is loose and should be inspected.', 'high', 'open', '2026-08-20T08:00:00Z', '2026-08-20T08:00:00Z')
ON CONFLICT (id) DO NOTHING;
