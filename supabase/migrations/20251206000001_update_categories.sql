-- Update categories to match requirements
-- Categories should be: Conjuntos, Corpiños, Bombachas, Sets, Promo, Oferta

-- First, add the missing categories
INSERT INTO categories (id, name, slug, description, is_active)
VALUES 
  (gen_random_uuid(), 'Promo', 'promo', 'Productos en promoción especial', true),
  (gen_random_uuid(), 'Oferta', 'oferta', 'Productos en oferta', true)
ON CONFLICT (slug) DO NOTHING;

-- Remove the "Otros" category if it exists (we'll reassign those products)
-- But first, let's make sure all products have proper categories

-- Assign products to categories based on their names
-- Conjuntos (sets with multiple pieces)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'conjuntos' LIMIT 1)
WHERE category_id IS NULL 
AND (
  LOWER(name) LIKE '%conjunto%' OR
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
  LOWER(name) LIKE '%bra%'
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

-- Sets (complete sets with multiple items including garters)
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'sets' LIMIT 1)
WHERE category_id IS NULL 
AND (
  LOWER(name) LIKE '%set %' OR
  LOWER(name) LIKE '%liguero%' OR
  LOWER(name) LIKE '%pack%'
);

-- Assign remaining products to "conjuntos" as default
UPDATE products 
SET category_id = (SELECT id FROM categories WHERE slug = 'conjuntos' LIMIT 1)
WHERE category_id IS NULL;

-- Update category order for better display
UPDATE categories SET sort_order = 1 WHERE slug = 'conjuntos';
UPDATE categories SET sort_order = 2 WHERE slug = 'corpinos';
UPDATE categories SET sort_order = 3 WHERE slug = 'bombachas';
UPDATE categories SET sort_order = 4 WHERE slug = 'sets';
UPDATE categories SET sort_order = 5 WHERE slug = 'promo';
UPDATE categories SET sort_order = 6 WHERE slug = 'oferta';