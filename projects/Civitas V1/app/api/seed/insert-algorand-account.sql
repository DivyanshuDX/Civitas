-- First, check if we have any users
INSERT INTO users (id, email, password_hash, user_type)
SELECT 
  '00000000-0000-0000-0000-000000000001', 
  'test@example.com', 
  'dGVzdHBhc3N3b3Jk', -- Base64 encoded 'testpassword'
  'user'
WHERE NOT EXISTS (
  SELECT 1 FROM users LIMIT 1
);

-- Now, insert an Algorand account if none exists
INSERT INTO algorand_accounts (user_id, address, passphrase, private_key)
SELECT 
  '00000000-0000-0000-0000-000000000001', 
  'ALGO7ZQPGMGC5YKRM3ZASQHVNFN2UFCL3XWLJ3KZXNPZ6CLQEINFXJ3KBU', 
  'test mnemonic phrase for demo purposes only', 
  'ZGVtb19wcml2YXRlX2tleQ==' -- Base64 encoded 'demo_private_key'
WHERE NOT EXISTS (
  SELECT 1 FROM algorand_accounts LIMIT 1
);

-- Return the account we just created or an existing one
SELECT * FROM algorand_accounts LIMIT 1;
