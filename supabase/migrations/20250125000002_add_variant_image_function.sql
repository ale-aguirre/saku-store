-- Migration: Add get_variant_primary_image function
-- Description: Adds a function to get the primary image for a product variant with fallback logic

-- Create function to get variant primary image with fallback
CREATE OR REPLACE FUNCTION get_variant_primary_image(variant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    variant_image TEXT;
    product_image TEXT;
BEGIN
    -- Intentar obtener la primera imagen de la variante
    SELECT images[1] INTO variant_image
    FROM product_variants
    WHERE id = variant_id 
      AND images IS NOT NULL 
      AND array_length(images, 1) > 0;
    
    -- Si la variante tiene imagen, devolverla
    IF variant_image IS NOT NULL THEN
        RETURN variant_image;
    END IF;
    
    -- Si no, obtener la primera imagen del producto padre
    SELECT p.images[1] INTO product_image
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = variant_id 
      AND p.images IS NOT NULL 
      AND array_length(p.images, 1) > 0;
    
    -- Devolver la imagen del producto o NULL si no hay ninguna
    RETURN product_image;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_variant_primary_image(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_variant_primary_image(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION get_variant_primary_image(UUID) IS 'Returns the primary image for a product variant. Falls back to product image if variant has no images.';