-- First, let's check if the access_requests table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'access_requests'
  ) THEN
    -- Create the table if it doesn't exist
    CREATE TABLE access_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      organization_id UUID NOT NULL,
      user_id UUID NOT NULL,
      purpose TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
      responded_at TIMESTAMP WITH TIME ZONE,
      transaction_hash TEXT,
      document_types TEXT[],
      required_fields JSONB DEFAULT '{}'::jsonb
    );
  ELSE
    -- If the table exists, make sure it has the document_types column
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'access_requests' AND column_name = 'document_types'
    ) THEN
      ALTER TABLE access_requests ADD COLUMN document_types TEXT[];
    END IF;
    
    -- Make sure it has the required_fields column
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_name = 'access_requests' AND column_name = 'required_fields'
    ) THEN
      ALTER TABLE access_requests ADD COLUMN required_fields JSONB DEFAULT '{}'::jsonb;
    END IF;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS access_requests_user_id_idx ON access_requests(user_id);
CREATE INDEX IF NOT EXISTS access_requests_organization_id_idx ON access_requests(organization_id);

-- Insert some dummy data for testing
INSERT INTO access_requests (
  organization_id, 
  user_id, 
  purpose, 
  status, 
  expiry_date, 
  document_types, 
  required_fields
)
SELECT 
  (SELECT id FROM users WHERE user_type = 'admin' LIMIT 1), -- organization_id
  (SELECT id FROM users WHERE user_type = 'user' LIMIT 1),  -- user_id
  'Test purpose for document verification',                 -- purpose
  'pending',                                               -- status
  NOW() + INTERVAL '7 days',                               -- expiry_date
  ARRAY['aadhaar', 'pan'],                                 -- document_types
  '{"aadhaar": ["name", "dob"], "pan": ["pan_number"]}'::jsonb  -- required_fields
WHERE NOT EXISTS (
  SELECT 1 FROM access_requests LIMIT 1
);
