-- Add categories table and update products table structure

-- Create categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add category_id column to products table and other missing columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Create unique index for product slug
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug) WHERE slug IS NOT NULL;

-- Add missing columns to product_variants table
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Update product_variants to use price_adjustment instead of price
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS price_adjustment DECIMAL(10,2) DEFAULT 0;

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Conjuntos', 'conjuntos', 'Conjuntos de lencería completos'),
('Corpiños', 'corpinos', 'Corpiños y sostenes'),
('Bombachas', 'bombachas', 'Bombachas y tangas')
ON CONFLICT (slug) DO NOTHING;

-- Update existing products to have slugs and category references
UPDATE products 
SET slug = LOWER(REPLACE(REPLACE(name, ' ', '-'), 'ñ', 'n'))
WHERE slug IS NULL;

-- Set category_id for existing products based on category text field
UPDATE products 
SET category_id = (
  SELECT id FROM categories 
  WHERE LOWER(categories.name) = LOWER(products.category)
  LIMIT 1
)
WHERE category_id IS NULL AND category IS NOT NULL;

-- Set default category for products without category
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'conjuntos' LIMIT 1)
WHERE category_id IS NULL;