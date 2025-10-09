-- Migration: Add home images storage bucket
-- Description: Creates storage bucket for home content images (hero, categories, etc.) with proper policies

-- Create images bucket in storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for images bucket

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload home images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Policy: Allow public read access to images
CREATE POLICY "Allow public read access to home images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'images');

-- Policy: Allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated users to update home images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'images');

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete home images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'images');

-- Grant necessary permissions
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;