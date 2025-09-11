-- Check the structure of the access_requests table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'access_requests';
