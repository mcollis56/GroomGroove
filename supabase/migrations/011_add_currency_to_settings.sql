-- Add currency column to business_settings table
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT '$';
