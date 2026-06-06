-- Create a table to map users to their Algorand addresses if it doesn't exist
CREATE TABLE IF NOT EXISTS user_blockchain_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blockchain_type VARCHAR(50) NOT NULL DEFAULT 'algorand',
    address VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, address)
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_blockchain_accounts_user_id ON user_blockchain_accounts(user_id);

-- Ensure document_assets table has all necessary columns
ALTER TABLE document_assets 
ADD COLUMN IF NOT EXISTS asset_id BIGINT,
ADD COLUMN IF NOT EXISTS asset_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS asset_unit_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS asset_total BIGINT,
ADD COLUMN IF NOT EXISTS blockchain_type VARCHAR(50) DEFAULT 'algorand',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create an index on asset_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_document_assets_asset_id ON document_assets(asset_id);

-- Insert the three specific assets for testing
INSERT INTO document_assets (
    user_id, 
    document_type, 
    asset_id, 
    asset_name, 
    asset_unit_name, 
    asset_total, 
    tokenized, 
    verified, 
    created_at, 
    updated_at
)
VALUES 
    -- PAN Card Twin
    ('00000000-0000-0000-0000-000000000000', 'pan', 738575610, 'PAN_Card_Twin', 'PAN', 1, true, true, NOW(), NOW()),
    -- Aadhaar Card Twin
    ('00000000-0000-0000-0000-000000000000', 'aadhaar', 738575873, 'Aadhaar_Card_Twin', 'AADHR', 1, true, true, NOW(), NOW()),
    -- Driving License Twin
    ('00000000-0000-0000-0000-000000000000', 'driving_license', 738619279, 'Driving_License_Twin', 'DL', 1, true, true, NOW(), NOW())
ON CONFLICT (asset_id) 
DO UPDATE SET 
    asset_name = EXCLUDED.asset_name,
    asset_unit_name = EXCLUDED.asset_unit_name,
    asset_total = EXCLUDED.asset_total,
    updated_at = NOW();

-- Function to update user_id for assets based on blockchain address
CREATE OR REPLACE FUNCTION update_asset_user_id() RETURNS VOID AS $$
BEGIN
    UPDATE document_assets da
    SET user_id = uba.user_id
    FROM user_blockchain_accounts uba
    WHERE da.user_id = '00000000-0000-0000-0000-000000000000'
    AND EXISTS (
        SELECT 1 
        FROM user_blockchain_accounts 
        WHERE user_id = uba.user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT update_asset_user_id();
