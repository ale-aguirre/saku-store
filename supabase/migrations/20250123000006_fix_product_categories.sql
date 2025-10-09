-- Fix product categories assignment
-- This migration assigns products to appropriate categories based on their names

-- First, let's create a category for "otros" products that don't fit elsewhere
INSERT INTO categories (id, name, slug, description, is_active, is_featured)
VALUES (
  gen_random_uuid(),
  'Otros',
  'otros',
  'Productos varios y accesorios',
  true,
  false
) ON CONFLICT (slug) DO NOTHING;

-- Assign products to categories based on their names
-- Conjuntos (sets with multiple pieces)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'conjuntos' LIMIT 1)
WHERE category_id IS NULL 
AND (
  LOWER(name) LIKE '%conjunto%' OR
  LOWER(name) LIKE '%set%' OR
  LOWER(name) LIKE '%top%culotte%' OR
  LOWER(name) LIKE '%top%less%' OR
  LOWER(name) LIKE '%balconette%'
);

-- Corpiños (bras and tops)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'corpinos' LIMIT 1)
WHERE category_id IS NULL 
AND (
  LOWER(name) LIKE '%corpiño%' OR
  LOWER(name) LIKE '%top%' OR
  LOWER(name) LIKE '%bra%' OR
  LOWER(name) LIKE '%balconette%'
);

-- Bombachas (panties and underwear)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'bombachas' LIMIT 1)
WHERE category_id IS NULL 
AND (
  LOWER(name) LIKE '%bombacha%' OR
  LOWER(name) LIKE '%tanga%' OR
  LOWER(name) LIKE '%culotte%' OR
  LOWER(name) LIKE '%less%' OR
  LOWER(name) LIKE '%pack%tanga%'
);

-- Sets (complete sets with multiple items)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'sets' LIMIT 1)
WHERE category_id IS NULL 
AND (
  LOWER(name) LIKE '%set %' OR
  LOWER(name) LIKE '%liguero%' OR
  LOWER(name) LIKE '%pack%'
);

-- Assign remaining products to "otros"
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'otros' LIMIT 1)
WHERE category_id IS NULL;