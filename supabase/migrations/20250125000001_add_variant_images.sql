-- Add images support to product variants
-- Each variant (size × color) can have its own set of images

-- Add images column to product_variants table
ALTER TABLE product_variants 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Add comment to explain the structure
COMMENT ON COLUMN product_variants.images IS 'Array of image URLs for this specific variant (size × color combination)';

-- Update existing variants to inherit images from their parent product
-- This ensures backward compatibility
UPDATE product_variants 
SET images = (
  SELECT COALESCE(products.images, '{}')
  FROM products 
  WHERE products.id = product_variants.product_id
)
WHERE images = '{}' OR images IS NULL;

-- Create index for better performance when querying variants with images
CREATE INDEX idx_product_variants_images ON product_variants USING GIN (images);

-- Add a function to get the primary image for a variant
CREATE OR REPLACE FUNCTION get_variant_primary_image(variant_images TEXT[], product_images TEXT[])
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT COALESCE(
    variant_images[1],  -- First variant image
    product_images[1],  -- Fallback to first product image
    '/placeholder-product.svg'  -- Final fallback
  );
$$;

COMMENT ON FUNCTION get_variant_primary_image IS 'Returns the primary image for a variant, with fallbacks to product image and placeholder';