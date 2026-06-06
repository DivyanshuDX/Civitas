-- Insert dummy users if they don't exist
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'user@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000002', 'org@example.com', '$2a$10$abcdefghijklmnopqrstuvwxyz', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert dummy algorand accounts
INSERT INTO algorand_accounts (user_id, address, private_key, created_at)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'ALGO1USER000000000000000000000000000000000000000000', 'dummy_private_key_user', NOW()),
  ('00000000-0000-0000-0000-000000000002', 'ALGO1ORG0000000000000000000000000000000000000000000', 'dummy_private_key_org', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Insert dummy document assets
INSERT INTO document_assets (id, user_id, document_type, document_id, verified, created_at, fields)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'aadhaar', 'AADHAAR123456789012', true, NOW(), ARRAY['name', 'dob', 'gender', 'address', 'aadhaar_number']),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'pan', 'PANABCD1234E', true, NOW(), ARRAY['name', 'pan_number', 'father_name', 'dob'])
ON CONFLICT (id) DO NOTHING;

-- Insert dummy access requests
INSERT INTO access_requests (id, user_id, organization_id, purpose, status, created_at, document_types)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ALGO1ORG0000000000000000000000000000000000000000000', 'KYC Verification', 'pending', NOW(), ARRAY['aadhaar', 'pan'])
ON CONFLICT (id) DO NOTHING;

-- Insert dummy access history
INSERT INTO access_history (id, user_id, access_request_id, action, timestamp, transaction_hash)
VALUES 
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'request', NOW(), 'TXHASH00000000000000000000000000000000000000000000000000000001')
ON CONFLICT (id) DO NOTHING;
