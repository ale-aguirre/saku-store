-- Migration: Add products storage bucket
-- Description: Creates storage bucket for product images with proper policies

-- Create products bucket in storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for products bucket

-- Allow authenticated users to upload product images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to update product images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete product images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products'
  AND auth.role() = 'authenticated'
);

-- Allow public access to view product images
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;