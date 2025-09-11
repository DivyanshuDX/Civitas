-- This script ensures proper separation of user data

-- First, let's make sure we have the correct users
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    user_example_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO user1_id FROM users WHERE email = 'user1@example.com';
    SELECT id INTO user2_id FROM users WHERE email = 'user2@example.com';
    SELECT id INTO user_example_id FROM users WHERE email = 'user@example.com';
    
    -- Create mapping between Algorand addresses and users if not exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_blockchain_accounts'
    ) THEN
        -- Make sure user1 has their own blockchain account
        IF user1_id IS NOT NULL THEN
            INSERT INTO user_blockchain_accounts (user_id, address, blockchain_type, is_primary)
            SELECT 
                user1_id,
                'PTC5H4VMUILLJWWE74VEQBXKBISAP447ZG6I72D3TEZNCLVDXUZ2G5PBHQ',
                'algorand',
                true
            WHERE NOT EXISTS (
                SELECT 1 FROM user_blockchain_accounts 
                WHERE user_id = user1_id
            );
        END IF;
        
        -- Make sure user2 has their own blockchain account
        IF user2_id IS NOT NULL THEN
            INSERT INTO user_blockchain_accounts (user_id, address, blockchain_type, is_primary)
            SELECT 
                user2_id,
                'UXVAPU4KERSMNUILDVZVO457RLILQMG3DAPV77CZJQVPJRG5FQHKXKJCYE',
                'algorand',
                true
            WHERE NOT EXISTS (
                SELECT 1 FROM user_blockchain_accounts 
                WHERE user_id = user2_id
            );
        END IF;
    END IF;
    
    -- Ensure document assets are properly assigned
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Assign PAN and Aadhaar to user1
        UPDATE document_assets
        SET user_id = user1_id
        WHERE asset_id IN (738575610, 738575873);
        
        -- Assign Driving License to user2
        UPDATE document_assets
        SET user_id = user2_id
        WHERE asset_id = 738619279;
    END IF;
    
    -- Create access history entries for each user if the table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'access_history'
    ) THEN
        -- For user1
        IF user1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM access_history WHERE user_id = user1_id) THEN
            INSERT INTO access_history (id, user_id, action, timestamp, transaction_hash)
            VALUES 
                (gen_random_uuid(), user1_id, 'grant', NOW() - INTERVAL '1 day', '0x' || encode(gen_random_bytes(32), 'hex')),
                (gen_random_uuid(), user1_id, 'request', NOW() - INTERVAL '3 days', '0x' || encode(gen_random_bytes(32), 'hex'));
        END IF;
        
        -- For user2
        IF user2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM access_history WHERE user_id = user2_id) THEN
            INSERT INTO access_history (id, user_id, action, timestamp, transaction_hash)
            VALUES 
                (gen_random_uuid(), user2_id, 'grant', NOW() - INTERVAL '2 days', '0x' || encode(gen_random_bytes(32), 'hex')),
                (gen_random_uuid(), user2_id, 'revoke', NOW() - INTERVAL '5 days', '0x' || encode(gen_random_bytes(32), 'hex'));
        END IF;
    END IF;
END $$;
