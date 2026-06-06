-- Create access_grants table if it doesn't exist
CREATE TABLE IF NOT EXISTS access_grants (
  id UUID PRIMARY KEY,
  request_id UUID NOT NULL,
  user_id UUID NOT NULL,
  organization_id UUID NOT NULL,
  document_types TEXT[] NOT NULL,
  granted_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_access_grants_request_id ON access_grants(request_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_user_id ON access_grants(user_id);
CREATE INDEX IF NOT EXISTS idx_access_grants_organization_id ON access_grants(organization_id);
