-- First, let's create some organizations if they don't exist
INSERT INTO organizations (id, name, contact, description)
VALUES 
  ('org1', 'Acme Corporation', 'contact@acme.com', 'A global conglomerate with diverse business interests'),
  ('org2', 'TechNova', 'info@technova.com', 'Leading technology solutions provider'),
  ('org3', 'FinSecure', 'support@finsecure.com', 'Financial services and security solutions')
ON CONFLICT (id) DO NOTHING;

-- Now, let's create some dummy documents for existing users
-- First, we need to get the user_ids from the algorand_accounts table
WITH user_accounts AS (
  SELECT user_id, address FROM algorand_accounts LIMIT 10
)
INSERT INTO documents (id, user_id, document_type, verified, verified_at, created_at)
SELECT 
  'doc_' || user_id || '_aadhaar',
  user_id,
  'aadhaar',
  TRUE,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '60 days'
FROM user_accounts
ON CONFLICT (id) DO NOTHING;

-- Add PAN card documents
WITH user_accounts AS (
  SELECT user_id, address FROM algorand_accounts LIMIT 10
)
INSERT INTO documents (id, user_id, document_type, verified, verified_at, created_at)
SELECT 
  'doc_' || user_id || '_pan',
  user_id,
  'pan',
  TRUE,
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '55 days'
FROM user_accounts
ON CONFLICT (id) DO NOTHING;

-- Add passport documents
WITH user_accounts AS (
  SELECT user_id, address FROM algorand_accounts LIMIT 10
)
INSERT INTO documents (id, user_id, document_type, verified, verified_at, created_at)
SELECT 
  'doc_' || user_id || '_passport',
  user_id,
  'passport',
  TRUE,
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '50 days'
FROM user_accounts
ON CONFLICT (id) DO NOTHING;

-- Now, let's add document fields for these documents
-- Aadhaar fields
WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'aadhaar'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'name',
  'John Doe',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'aadhaar'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'aadhaar_number',
  '1234 5678 9012',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'aadhaar'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'dob',
  '1990-01-01',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'aadhaar'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'address',
  '123 Main St, Bangalore, India',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

-- PAN fields
WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'pan'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'name',
  'John Doe',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'pan'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'pan_number',
  'ABCDE1234F',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

-- Passport fields
WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'passport'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'name',
  'John Doe',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'passport'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'passport_number',
  'A1234567',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

WITH doc_ids AS (
  SELECT id FROM documents WHERE document_type = 'passport'
)
INSERT INTO document_fields (document_id, field_name, field_value, is_available)
SELECT 
  id,
  'nationality',
  'Indian',
  TRUE
FROM doc_ids
ON CONFLICT (document_id, field_name) DO NOTHING;

-- Create some digital twins (document assets)
WITH user_accounts AS (
  SELECT user_id, address FROM algorand_accounts LIMIT 5
)
INSERT INTO document_assets (id, user_id, asset_name, asset_id, document_type, fields, created_at)
SELECT 
  'asset_' || user_id || '_aadhaar',
  user_id,
  'Aadhaar Digital Twin',
  '123456789',
  'aadhaar',
  '["name", "aadhaar_number", "dob"]',
  NOW() - INTERVAL '15 days'
FROM user_accounts
ON CONFLICT (id) DO NOTHING;

WITH user_accounts AS (
  SELECT user_id, address FROM algorand_accounts LIMIT 5
)
INSERT INTO document_assets (id, user_id, asset_name, asset_id, document_type, fields, created_at)
SELECT 
  'asset_' || user_id || '_pan',
  user_id,
  'PAN Digital Twin',
  '987654321',
  'pan',
  '["name", "pan_number"]',
  NOW() - INTERVAL '10 days'
FROM user_accounts
ON CONFLICT (id) DO NOTHING;

-- Now, let's create some access requests
-- First, get admin users (for organizations)
WITH admin_users AS (
  SELECT u.id AS user_id, a.address
  FROM users u
  JOIN algorand_accounts a ON u.id = a.user_id
  WHERE u.user_type = 'admin'
  LIMIT 3
),
-- Then get regular users
regular_users AS (
  SELECT u.id AS user_id, a.address
  FROM users u
  JOIN algorand_accounts a ON u.id = a.user_id
  WHERE u.user_type = 'user'
  LIMIT 5
)
-- Create pending requests
INSERT INTO access_requests (
  organization_id, 
  user_id, 
  document_types, 
  purpose, 
  status, 
  created_at, 
  expiry_date
)
SELECT 
  'org1',
  ru.user_id,
  ARRAY['aadhaar', 'pan'],
  'KYC verification for account opening',
  'pending',
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '25 days'
FROM regular_users ru
LIMIT 2
ON CONFLICT (id) DO NOTHING;

-- Create approved requests
WITH admin_users AS (
  SELECT u.id AS user_id, a.address
  FROM users u
  JOIN algorand_accounts a ON u.id = a.user_id
  WHERE u.user_type = 'admin'
  LIMIT 3
),
regular_users AS (
  SELECT u.id AS user_id, a.address
  FROM users u
  JOIN algorand_accounts a ON u.id = a.user_id
  WHERE u.user_type = 'user'
  LIMIT 5
)
INSERT INTO access_requests (
  organization_id, 
  user_id, 
  document_types, 
  purpose, 
  status, 
  created_at, 
  expiry_date,
  responded_at,
  transaction_hash
)
SELECT 
  'org2',
  ru.user_id,
  ARRAY['passport'],
  'Travel booking verification',
  'approved',
  NOW() - INTERVAL '15 days',
  NOW() + INTERVAL '15 days',
  NOW() - INTERVAL '14 days',
  '0x' || encode(gen_random_bytes(32), 'hex')
FROM regular_users ru
OFFSET 2 LIMIT 2
ON CONFLICT (id) DO NOTHING;

-- Create rejected requests
WITH admin_users AS (
  SELECT u.id AS user_id, a.address
  FROM users u
  JOIN algorand_accounts a ON u.id = a.user_id
  WHERE u.user_type = 'admin'
  LIMIT 3
),
regular_users AS (
  SELECT u.id AS user_id, a.address
  FROM users u
  JOIN algorand_accounts a ON u.id = a.user_id
  WHERE u.user_type = 'user'
  LIMIT 5
)
INSERT INTO access_requests (
  organization_id, 
  user_id, 
  document_types, 
  purpose, 
  status, 
  created_at, 
  expiry_date,
  responded_at,
  transaction_hash
)
SELECT 
  'org3',
  ru.user_id,
  ARRAY['aadhaar', 'pan'],
  'Loan application verification',
  'rejected',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '24 days',
  '0x' || encode(gen_random_bytes(32), 'hex')
FROM regular_users ru
OFFSET 4 LIMIT 1
ON CONFLICT (id) DO NOTHING;
