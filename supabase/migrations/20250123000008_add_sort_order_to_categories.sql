-- Add sort_order column to categories table

-- Add sort_order column with default value
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing categories with sort order values
UPDATE categories 
SET sort_order = CASE 
  WHEN slug = 'conjuntos' THEN 1
  WHEN slug = 'corpinos' THEN 2
  WHEN slug = 'bombachas' THEN 3
  ELSE 999
END
WHERE sort_order = 0;

-- Create index for better performance on sort_order queries
CREATE INDEX IF NOT EXISTS categories_sort_order_idx ON categories(sort_order);

-- Add comment to document the column
COMMENT ON COLUMN categories.sort_order IS 'Order for displaying categories (lower numbers first)';