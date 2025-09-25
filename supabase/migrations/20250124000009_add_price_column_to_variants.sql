-- Add price column to product_variants for compatibility
-- This column will store the final price (base_price + price_adjustment)

-- Add the price column
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Create a function to calculate and update the price
CREATE OR REPLACE FUNCTION update_variant_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate the final price from the product's base_price + variant's price_adjustment
  SELECT p.base_price + COALESCE(NEW.price_adjustment, 0)
  INTO NEW.price
  FROM products p
  WHERE p.id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update price when variant is inserted or updated
DROP TRIGGER IF EXISTS trigger_update_variant_price ON product_variants;
CREATE TRIGGER trigger_update_variant_price
  BEFORE INSERT OR UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_variant_price();

-- Update existing records to populate the price column
UPDATE product_variants 
SET price = (
  SELECT p.base_price + COALESCE(product_variants.price_adjustment, 0)
  FROM products p
  WHERE p.id = product_variants.product_id
);

-- Create trigger to update variant prices when product base_price changes
CREATE OR REPLACE FUNCTION update_variants_on_product_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Update all variant prices when base_price changes
  IF OLD.base_price IS DISTINCT FROM NEW.base_price THEN
    UPDATE product_variants 
    SET price = NEW.base_price + COALESCE(price_adjustment, 0)
    WHERE product_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_variants_on_product_change ON products;
CREATE TRIGGER trigger_update_variants_on_product_change
  AFTER UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_variants_on_product_price_change();