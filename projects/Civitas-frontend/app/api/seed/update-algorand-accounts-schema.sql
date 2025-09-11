-- Update the algorand_accounts table to use TEXT for longer values
ALTER TABLE IF EXISTS algorand_accounts 
ALTER COLUMN passphrase TYPE TEXT,
ALTER COLUMN private_key TYPE TEXT;
