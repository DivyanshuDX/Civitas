-- This script ensures proper separation of user data and fixes access history issues

-- First, let's make sure we have the correct users
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    user_example_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO user1_id FROM users WHERE email = 'user1@example.com' LIMIT 1;
    SELECT id INTO user2_id FROM users WHERE email = 'user2@example.com' LIMIT 1;
    SELECT id INTO user_example_id FROM users WHERE email = 'user@example.com' LIMIT 1;
    
    -- Log the user IDs for debugging
    RAISE NOTICE 'User IDs: user1=%, user2=%, example=%', user1_id, user2_id, user_example_id;
    
    -- Create mapping between Algorand addresses and users if table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_blockchain_accounts'
    ) THEN
        -- Make sure user1 has their own blockchain account
        IF user1_id IS NOT NULL THEN
            INSERT INTO user_blockchain_accounts (user_id, address, blockchain_type, is_primary)
            VALUES (
                user1_id,
                'PTC5H4VMUILLJWWE74VEQBXKBISAP447ZG6I72D3TEZNCLVDXUZ2G5PBHQ',
                'algorand',
                true
            )
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
        
        -- Make sure user2 has their own blockchain account
        IF user2_id IS NOT NULL THEN
            INSERT INTO user_blockchain_accounts (user_id, address, blockchain_type, is_primary)
            VALUES (
                user2_id,
                'UXVAPU4KERSMNUILDVZVO457RLILQMG3DAPV77CZJQVPJRG5FQHKXKJCYE',
                'algorand',
                true
            )
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END IF;
    
    -- Ensure document assets are properly assigned if both users exist
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
END $$;
