-- Create document_consents table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    organization_id VARCHAR(255) NOT NULL,
    document_asset_id UUID NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked_at TIMESTAMP WITH TIME ZONE,
    transaction_hash VARCHAR(255)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_consents_user_id ON document_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_document_consents_organization_id ON document_consents(organization_id);
CREATE INDEX IF NOT EXISTS idx_document_consents_document_asset_id ON document_consents(document_asset_id);
CREATE INDEX IF NOT EXISTS idx_document_consents_status ON document_consents(status);

-- Create organizations table if it doesn't exist
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample organizations if they don't exist
INSERT INTO organizations (id, name, description, contact_email)
VALUES 
    ('org1', 'Acme Corporation', 'A global conglomerate with diverse business interests', 'contact@acme.com'),
    ('org2', 'TechNova', 'Leading technology solutions provider', 'info@technova.com'),
    ('org3', 'FinSecure', 'Financial services and security solutions', 'support@finsecure.com'),
    ('org4', 'HealthPlus', 'Healthcare and wellness services', 'care@healthplus.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample consents for testing
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    doc1_id uuid;
    doc2_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO user1_id FROM users WHERE email = 'user1@example.com';
    SELECT id INTO user2_id FROM users WHERE email = 'user2@example.com';
    
    -- Get document IDs
    SELECT id INTO doc1_id FROM document_assets WHERE user_id = user1_id LIMIT 1;
    SELECT id INTO doc2_id FROM document_assets WHERE user_id = user2_id LIMIT 1;
    
    -- Insert sample consents if users and documents exist
    IF user1_id IS NOT NULL AND doc1_id IS NOT NULL THEN
        INSERT INTO document_consents (
            id, user_id, organization_id, document_asset_id, purpose, 
            status, created_at, expiry_date, transaction_hash
        )
        VALUES (
            gen_random_uuid(), user1_id, 'org1', doc1_id, 'KYC verification',
            'active', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days',
            '0x' || encode(gen_random_bytes(32), 'hex')
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    IF user2_id IS NOT NULL AND doc2_id IS NOT NULL THEN
        INSERT INTO document_consents (
            id, user_id, organization_id, document_asset_id, purpose, 
            status, created_at, expiry_date, revoked_at, transaction_hash
        )
        VALUES (
            gen_random_uuid(), user2_  revoked_at, transaction_hash
        )
        VALUES (
            gen_random_uuid(), user2_id, 'org2', doc2_id, 'Travel verification',
            'revoked', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days',
            NOW() - INTERVAL '2 days', '0x' || encode(gen_random_bytes(32), 'hex')
        )
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
