-- This script fixes the user-document mapping in the database

-- First, let's make sure we have the correct users
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
BEGIN
    -- Get or create user1@example.com
    SELECT id INTO user1_id FROM users WHERE email = 'user1@example.com';
    
    IF user1_id IS NULL THEN
        -- Create user1 if it doesn't exist
        INSERT INTO users (id, email, password_hash, user_type)
        VALUES (
            gen_random_uuid(),
            'user1@example.com',
            'cGFzc3dvcmQxMjNfaGFzaGVk',
            'user'
        )
        RETURNING id INTO user1_id;
    END IF;
    
    -- Get or create user2@example.com
    SELECT id INTO user2_id FROM users WHERE email = 'user2@example.com';
    
    IF user2_id IS NULL THEN
        -- Create user2 if it doesn't exist
        INSERT INTO users (id, email, password_hash, user_type)
        VALUES (
            gen_random_uuid(),
            'user2@example.com',
            'cGFzc3dvcmQxMjNfaGFzaGVk',
            'user'
        )
        RETURNING id INTO user2_id;
    END IF;
    
    -- Now let's assign the correct documents to each user
    
    -- First, update PAN and Aadhaar to user1
    UPDATE document_assets
    SET user_id = user1_id
    WHERE asset_id IN (738575610, 738575873);
    
    -- Then, update Driving License to user2
    UPDATE document_assets
    SET user_id = user2_id
    WHERE asset_id = 738619279;
    
    -- If there are any documents assigned to 'user@example.com', reassign them
    UPDATE document_assets
    SET user_id = user1_id
    WHERE user_id IN (SELECT id FROM users WHERE email = 'user@example.com')
    AND asset_id IN (738575610, 738575873);
    
    UPDATE document_assets
    SET user_id = user2_id
    WHERE user_id IN (SELECT id FROM users WHERE email = 'user@example.com')
    AND asset_id = 738619279;
END $$;
