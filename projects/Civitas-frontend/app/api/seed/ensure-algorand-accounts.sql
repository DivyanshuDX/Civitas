-- Check if algorand_accounts table exists
CREATE TABLE IF NOT EXISTS algorand_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  passphrase TEXT NOT NULL,
  private_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test account if none exists
INSERT INTO algorand_accounts (user_id, address, passphrase, private_key)
SELECT 
  (SELECT id FROM users LIMIT 1),
  'ALGO123TEST456ADDRESS789',
  'test mnemonic phrase for demo purposes only',
  'ZGVtb19wcml2YXRlX2tleQ==' -- base64 encoded "demo_private_key"
WHERE NOT EXISTS (SELECT 1 FROM algorand_accounts LIMIT 1);
