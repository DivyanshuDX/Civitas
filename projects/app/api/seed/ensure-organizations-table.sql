-- Check if organizations table exists
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  website VARCHAR(255),
  logo_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some sample organizations if the table is empty
INSERT INTO organizations (name, description, website)
SELECT 'Example Organization', 'An example organization for testing', 'https://example.org'
WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);

INSERT INTO organizations (name, description, website)
SELECT 'Test Company', 'A test company for development', 'https://test-company.com'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Test Company');

INSERT INTO organizations (name, description, website)
SELECT 'Demo Corp', 'A demonstration corporation', 'https://democorp.io'
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Demo Corp');
