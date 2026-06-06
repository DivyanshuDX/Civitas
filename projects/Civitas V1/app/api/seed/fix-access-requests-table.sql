-- Check if the table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  user_id UUID NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT
);

-- Add document_types column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'access_requests' AND column_name = 'document_types'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN document_types TEXT[];
  END IF;
END $$;

-- Add required_fields column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'access_requests' AND column_name = 'required_fields'
  ) THEN
    ALTER TABLE access_requests ADD COLUMN required_fields JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS access_requests_user_id_idx ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS access_requests_organization_id_idx ON access_requests(organization_id);
