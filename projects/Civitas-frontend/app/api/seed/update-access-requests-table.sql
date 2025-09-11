-- Check if user_id column exists in access_requests table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'access_requests'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE access_requests ADD COLUMN user_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Check if document_types_array column exists in access_requests table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'access_requests'
        AND column_name = 'document_types_array'
    ) THEN
        ALTER TABLE access_requests ADD COLUMN document_types_array TEXT[];
    END IF;
END $$;

-- Check if required_fields column exists in access_requests table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'access_requests'
        AND column_name = 'required_fields'
    ) THEN
        ALTER TABLE access_requests ADD COLUMN required_fields JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;
