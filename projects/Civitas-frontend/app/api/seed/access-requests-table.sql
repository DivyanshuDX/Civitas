-- Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  user_address TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  document_types TEXT[] NOT NULL,
  required_fields JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_access_requests_user_address ON access_requests(user_address);
CREATE INDEX IF NOT EXISTS idx_access_requests_organization_id ON access_requests(organization_id);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
