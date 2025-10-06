-- Add compare_at_price column to product_variants for offer functionality
-- This enables admin panel to assign offers to individual product variants

-- Add the compare_at_price column (nullable, in cents like price column)
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS compare_at_price INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN product_variants.compare_at_price IS 'Original price in cents for discount calculation. NULL means no offer.';

-- Create index for performance when filtering by offers
CREATE INDEX IF NOT EXISTS idx_product_variants_compare_at_price 
ON product_variants(compare_at_price) 
WHERE compare_at_price IS NOT NULL;

-- Update the existing trigger function to handle compare_at_price
-- This ensures the price column is still calculated correctly
CREATE OR REPLACE FUNCTION update_variant_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate the final price from the product's base_price + variant's price_adjustment
  SELECT p.base_price + COALESCE(NEW.price_adjustment, 0)
  INTO NEW.price
  FROM products p
  WHERE p.id = NEW.product_id;
  
  -- Validate compare_at_price if provided
  IF NEW.compare_at_price IS NOT NULL AND NEW.compare_at_price <= NEW.price THEN
    RAISE EXCEPTION 'compare_at_price (%) must be greater than final price (%)', NEW.compare_at_price, NEW.price;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policy for compare_at_price (admin can update, public can read)
-- This ensures security while allowing admin functionality

-- Note: No data migration needed as this is a new optional field
-- Existing variants will have compare_at_price = NULL (no offer)