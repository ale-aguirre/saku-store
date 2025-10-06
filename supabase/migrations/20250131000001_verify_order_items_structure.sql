-- Verify and fix order_items table structure
-- This migration ensures the order_items table has the correct columns

-- Check if price column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'price'
    ) THEN
        ALTER TABLE order_items ADD COLUMN price DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Ensure all required columns exist
DO $$
BEGIN
    -- Check and add missing columns if needed
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'product_name'
    ) THEN
        ALTER TABLE order_items ADD COLUMN product_name TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'variant_size'
    ) THEN
        ALTER TABLE order_items ADD COLUMN variant_size TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'variant_color'
    ) THEN
        ALTER TABLE order_items ADD COLUMN variant_color TEXT NOT NULL DEFAULT '';
    END IF;

    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'sku'
    ) THEN
        ALTER TABLE order_items ADD COLUMN sku TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Show current structure for verification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'order_items'
ORDER BY ordinal_position;