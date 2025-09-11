-- Insert a test user if not exists
INSERT INTO users (email, user_type)
SELECT 'testuser@example.com', 'user'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'testuser@example.com'
)
RETURNING id;

-- Insert a test admin if not exists
INSERT INTO users (email, user_type)
SELECT 'testadmin@example.com', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'testadmin@example.com'
)
RETURNING id;

-- Insert test algorand accounts
INSERT INTO algorand_accounts (user_id, address, passphrase, private_key)
SELECT 
  (SELECT id FROM users WHERE email = 'testuser@example.com'),
  '0x1234567890123456789012345678901234567890123456',
  'test passphrase for user',
  'test private key for user'
WHERE NOT EXISTS (
  SELECT 1 FROM algorand_accounts 
  WHERE address = '0x1234567890123456789012345678901234567890123456'
);

INSERT INTO algorand_accounts (user_id, address, passphrase, private_key)
SELECT 
  (SELECT id FROM users WHERE email = 'testadmin@example.com'),
  '0xABCDEF0123456789ABCDEF0123456789ABCDEF012345',
  'test passphrase for admin',
  'test private key for admin'
WHERE NOT EXISTS (
  SELECT 1 FROM algorand_accounts 
  WHERE address = '0xABCDEF0123456789ABCDEF0123456789ABCDEF012345'
);

-- Insert test organization if not exists
INSERT INTO organizations (id, name, contact, description)
SELECT 
  (SELECT id FROM users WHERE email = 'testadmin@example.com'),
  'Test Organization',
  'contact@testorg.com',
  'A test organization for development'
WHERE NOT EXISTS (
  SELECT 1 FROM organizations 
  WHERE name = 'Test Organization'
);

-- Insert test documents for the user
INSERT INTO documents (user_id, document_type, verified)
SELECT 
  (SELECT id FROM users WHERE email = 'testuser@example.com'),
  'aadhaar',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM documents 
  WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com')
  AND document_type = 'aadhaar'
);

INSERT INTO documents (user_id, document_type, verified)
SELECT 
  (SELECT id FROM users WHERE email = 'testuser@example.com'),
  'pan',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM documents 
  WHERE user_id = (SELECT id FROM users WHERE email = 'testuser@example.com')
  AND document_type = 'pan'
);
