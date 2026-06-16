ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE meetups ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE meetups ADD COLUMN IF NOT EXISTS source_primary TEXT DEFAULT 'manual';

-- Mark existing auto-seed data as unverified
UPDATE venues SET is_verified = false WHERE source_primary = 'auto-seed';
UPDATE tournaments SET is_verified = false WHERE source_primary = 'auto-seed';
