-- Create document_assets table to store blockchain token information
CREATE TABLE IF NOT EXISTS document_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL,
  blockchain VARCHAR(50) NOT NULL DEFAULT 'algorand',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
