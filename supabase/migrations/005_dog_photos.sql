-- Add photo_url column to dogs table
-- Run this SQL in your Supabase SQL Editor

ALTER TABLE dogs ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create storage bucket for dog photos (run this separately in Supabase Dashboard > Storage)
-- Or use this SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('dog-photos', 'dog-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to dog photos
CREATE POLICY "Public read access for dog photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'dog-photos');

-- Allow authenticated users to upload dog photos
CREATE POLICY "Authenticated users can upload dog photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dog-photos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update dog photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'dog-photos');

-- Allow authenticated users to delete dog photos
CREATE POLICY "Authenticated users can delete dog photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'dog-photos');
