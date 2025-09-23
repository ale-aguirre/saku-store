-- Insert test products
INSERT INTO products (id, name, description, sku, base_price, category, brand, is_active, images) VALUES
(
  gen_random_uuid(),
  'Conjunto Encaje Negro',
  'Elegante conjunto de lencería en encaje negro con detalles delicados. Incluye sostén con copas preformadas y bombacha colaless.',
  'CONJ-ENCAJE-NEGRO',
  8500.00,
  'Conjuntos',
  'Sakú',
  true,
  ARRAY['/images/conjunto-encaje-negro-1.jpg', '/images/conjunto-encaje-negro-2.jpg']
),
(
  gen_random_uuid(),
  'Conjunto Satén Rojo',
  'Sensual conjunto de satén rojo con acabados en encaje. Sostén push-up y bombacha brasileña para una silueta perfecta.',
  'CONJ-SATEN-ROJO',
  9200.00,
  'Conjuntos',
  'Sakú',
  true,
  ARRAY['/images/conjunto-saten-rojo-1.jpg', '/images/conjunto-saten-rojo-2.jpg']
),
(
  gen_random_uuid(),
  'Conjunto Algodón Blanco',
  'Cómodo conjunto de algodón blanco con detalles en encaje. Perfecto para el uso diario con estilo y comodidad.',
  'CONJ-ALGODON-BLANCO',
  6800.00,
  'Conjuntos',
  'Sakú',
  true,
  ARRAY['/images/conjunto-algodon-blanco-1.jpg', '/images/conjunto-algodon-blanco-2.jpg']
);

-- Insert product variants for each product
-- Conjunto Encaje Negro variants
INSERT INTO product_variants (product_id, size, color, sku, price_adjustment, stock_quantity, is_active)
SELECT 
  p.id,
  size_option,
  color_option,
  p.sku || '-' || size_option || '-' || color_option,
  0,
  CASE 
    WHEN size_option = '85' THEN 15
    WHEN size_option = '90' THEN 20
    WHEN size_option = '95' THEN 12
    WHEN size_option = '100' THEN 8
  END,
  true
FROM products p
CROSS JOIN (VALUES ('85'), ('90'), ('95'), ('100')) AS sizes(size_option)
CROSS JOIN (VALUES ('negro'), ('rojo'), ('blanco')) AS colors(color_option)
WHERE p.sku = 'CONJ-ENCAJE-NEGRO';

-- Conjunto Satén Rojo variants
INSERT INTO product_variants (product_id, size, color, sku, price_adjustment, stock_quantity, is_active)
SELECT 
  p.id,
  size_option,
  color_option,
  p.sku || '-' || size_option || '-' || color_option,
  CASE 
    WHEN color_option = 'rojo' THEN 0
    WHEN color_option = 'negro' THEN 200
    WHEN color_option = 'blanco' THEN -300
  END,
  CASE 
    WHEN size_option = '85' THEN 18
    WHEN size_option = '90' THEN 25
    WHEN size_option = '95' THEN 14
    WHEN size_option = '100' THEN 10
  END,
  true
FROM products p
CROSS JOIN (VALUES ('85'), ('90'), ('95'), ('100')) AS sizes(size_option)
CROSS JOIN (VALUES ('negro'), ('rojo'), ('blanco')) AS colors(color_option)
WHERE p.sku = 'CONJ-SATEN-ROJO';

-- Conjunto Algodón Blanco variants
INSERT INTO product_variants (product_id, size, color, sku, price_adjustment, stock_quantity, is_active)
SELECT 
  p.id,
  size_option,
  color_option,
  p.sku || '-' || size_option || '-' || color_option,
  CASE 
    WHEN color_option = 'blanco' THEN 0
    WHEN color_option = 'negro' THEN 400
    WHEN color_option = 'rojo' THEN 600
  END,
  CASE 
    WHEN size_option = '85' THEN 22
    WHEN size_option = '90' THEN 30
    WHEN size_option = '95' THEN 16
    WHEN size_option = '100' THEN 12
  END,
  true
FROM products p
CROSS JOIN (VALUES ('85'), ('90'), ('95'), ('100')) AS sizes(size_option)
CROSS JOIN (VALUES ('negro'), ('rojo'), ('blanco')) AS colors(color_option)
WHERE p.sku = 'CONJ-ALGODON-BLANCO';

-- Insert test coupons
INSERT INTO coupons (code, type, value, minimum_amount, usage_limit, used_count, is_active, valid_from, valid_until) VALUES
('BIENVENIDA10', 'percentage', 10.00, 5000.00, 100, 0, true, NOW(), NOW() + INTERVAL '30 days'),
('ENVIOGRATIS', 'fixed', 1500.00, 8000.00, 50, 0, true, NOW(), NOW() + INTERVAL '15 days'),
('PRIMERA20', 'percentage', 20.00, 7000.00, 25, 0, true, NOW(), NOW() + INTERVAL '7 days');