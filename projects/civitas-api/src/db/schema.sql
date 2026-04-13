CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  api_key_hash TEXT UNIQUE NOT NULL,
  api_key_prefix TEXT NOT NULL,
  algorand_address TEXT NOT NULL,
  is_whitelisted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_logs (
  id BIGSERIAL PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_tenant ON usage_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_api_key_hash ON tenants(api_key_hash);

-- Wallet-to-email linking with OTP verification
CREATE TABLE IF NOT EXISTS wallet_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  otp_code TEXT,
  otp_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_emails_address ON wallet_emails(wallet_address);
CREATE INDEX IF NOT EXISTS idx_wallet_emails_email ON wallet_emails(email);
