-- Check if document_assets table exists, if not create it
CREATE TABLE IF NOT EXISTS document_assets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  document_type TEXT NOT NULL,
  document_id TEXT,
  verified BOOLEAN DEFAULT false,
  asset_id TEXT,
  tokenized BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add fields column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'document_assets' AND column_name = 'fields'
  ) THEN
    ALTER TABLE document_assets ADD COLUMN fields TEXT[];
  END IF;
END $$;

-- Insert a test document if none exists
INSERT INTO document_assets (user_id, document_type, document_id, verified, asset_id, tokenized, metadata)
SELECT 
  (SELECT id FROM users LIMIT 1),
  'aadhaar',
  'aadhaar_test_123',
  true,
  '123456789',
  true,
  '{"source": "digilocker", "selected_fields": ["name", "dob", "address"]}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM document_assets LIMIT 1);
