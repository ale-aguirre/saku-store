-- Insert site settings
INSERT INTO site_settings (key, value, description) VALUES
('site_name', 'Sakú Lencería', 'Nombre del sitio'),
('shipping_national_cost', '2500', 'Costo de envío nacional en centavos'),
('shipping_cordoba_cost', '1500', 'Costo de envío en Córdoba en centavos'),
('free_shipping_threshold', '15000', 'Monto mínimo para envío gratis en centavos'),
('currency', 'ARS', 'Moneda del sitio'),
('tax_rate', '0', 'Tasa de impuestos'),
('return_policy_days', '0', 'Días para devoluciones (0 = no se aceptan)'),
('hygiene_notice', 'Por razones de higiene, no se aceptan cambios ni devoluciones en productos de lencería.', 'Aviso de higiene');

-- Insert copy blocks
INSERT INTO copy_blocks (key, title, content, locale) VALUES
('hero_title', 'Bienvenida a Sakú', 'Descubre nuestra colección de lencería femenina diseñada para realzar tu belleza natural.', 'es'),
('hero_subtitle', null, 'Calidad, comodidad y estilo en cada prenda.', 'es'),
('pdp_size_guide_title', 'Guía de Talles', 'Encuentra tu talle perfecto con nuestra guía detallada.', 'es'),
('pdp_hygiene_notice', 'Importante', 'Por razones de higiene, no se aceptan cambios ni devoluciones en productos de lencería.', 'es'),
('cart_empty_message', 'Tu carrito está vacío', 'Explora nuestra colección y encuentra las prendas perfectas para ti.', 'es'),
('checkout_shipping_notice', 'Información de Envío', 'Los envíos se realizan de lunes a viernes. Tiempo estimado: 3-5 días hábiles.', 'es'),
('footer_about', 'Sobre Sakú', 'Sakú Lencería es una marca argentina dedicada a crear prendas íntimas de alta calidad que celebran la feminidad.', 'es'),
('privacy_policy_title', 'Política de Privacidad', 'En Sakú Lencería respetamos tu privacidad y protegemos tus datos personales.', 'es'),
('terms_title', 'Términos y Condiciones', 'Al utilizar nuestro sitio web, aceptas los siguientes términos y condiciones.', 'es');

-- Insert sample products
INSERT INTO products (id, name, description, sku, base_price, category, images) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Conjunto Clásico Negro', 'Conjunto de corpiño y bombacha en encaje delicado. Diseño clásico y elegante.', 'CONJ-CLAS-NEG', 8500.00, 'Conjuntos', ARRAY['https://example.com/conjunto-clasico-negro-1.jpg', 'https://example.com/conjunto-clasico-negro-2.jpg']),
('550e8400-e29b-41d4-a716-446655440002', 'Conjunto Romántico Rojo', 'Conjunto de corpiño y bombacha con detalles de encaje. Perfecto para ocasiones especiales.', 'CONJ-ROM-ROJ', 9200.00, 'Conjuntos', ARRAY['https://example.com/conjunto-romantico-rojo-1.jpg', 'https://example.com/conjunto-romantico-rojo-2.jpg']),
('550e8400-e29b-41d4-a716-446655440003', 'Conjunto Minimalista Blanco', 'Conjunto de líneas limpias y diseño minimalista. Comodidad y estilo en uno.', 'CONJ-MIN-BLA', 7800.00, 'Conjuntos', ARRAY['https://example.com/conjunto-minimalista-blanco-1.jpg', 'https://example.com/conjunto-minimalista-blanco-2.jpg']),
('550e8400-e29b-41d4-a716-446655440004', 'Corpiño Push-Up Negro', 'Corpiño con relleno push-up para realzar la figura. Cómodo y elegante.', 'CORP-PUSH-NEG', 5500.00, 'Corpiños', ARRAY['https://example.com/corpino-pushup-negro-1.jpg', 'https://example.com/corpino-pushup-negro-2.jpg']),
('550e8400-e29b-41d4-a716-446655440005', 'Bombacha Colaless Roja', 'Bombacha colaless en microfibra suave. Invisible bajo la ropa.', 'BOMB-COL-ROJ', 3200.00, 'Bombachas', ARRAY['https://example.com/bombacha-colaless-roja-1.jpg', 'https://example.com/bombacha-colaless-roja-2.jpg']);

-- Insert product variants for each product
-- Conjunto Clásico Negro
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'CONJ-CLAS-NEG-85-NEG', '85', 'negro', 8500.00, 15),
('550e8400-e29b-41d4-a716-446655440001', 'CONJ-CLAS-NEG-90-NEG', '90', 'negro', 8500.00, 20),
('550e8400-e29b-41d4-a716-446655440001', 'CONJ-CLAS-NEG-95-NEG', '95', 'negro', 8500.00, 18),
('550e8400-e29b-41d4-a716-446655440001', 'CONJ-CLAS-NEG-100-NEG', '100', 'negro', 8500.00, 12);

-- Conjunto Romántico Rojo
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'CONJ-ROM-ROJ-85-ROJ', '85', 'rojo', 9200.00, 10),
('550e8400-e29b-41d4-a716-446655440002', 'CONJ-ROM-ROJ-90-ROJ', '90', 'rojo', 9200.00, 15),
('550e8400-e29b-41d4-a716-446655440002', 'CONJ-ROM-ROJ-95-ROJ', '95', 'rojo', 9200.00, 12),
('550e8400-e29b-41d4-a716-446655440002', 'CONJ-ROM-ROJ-100-ROJ', '100', 'rojo', 9200.00, 8);

-- Conjunto Minimalista Blanco
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
('550e8400-e29b-41d4-a716-446655440003', 'CONJ-MIN-BLA-85-BLA', '85', 'blanco', 7800.00, 20),
('550e8400-e29b-41d4-a716-446655440003', 'CONJ-MIN-BLA-90-BLA', '90', 'blanco', 7800.00, 25),
('550e8400-e29b-41d4-a716-446655440003', 'CONJ-MIN-BLA-95-BLA', '95', 'blanco', 7800.00, 22),
('550e8400-e29b-41d4-a716-446655440003', 'CONJ-MIN-BLA-100-BLA', '100', 'blanco', 7800.00, 15);

-- Corpiño Push-Up Negro (múltiples colores)
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-NEG-85-NEG', '85', 'negro', 5500.00, 25),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-NEG-90-NEG', '90', 'negro', 5500.00, 30),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-NEG-95-NEG', '95', 'negro', 5500.00, 28),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-NEG-100-NEG', '100', 'negro', 5500.00, 20),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-ROJ-85-ROJ', '85', 'rojo', 5500.00, 15),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-ROJ-90-ROJ', '90', 'rojo', 5500.00, 18),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-ROJ-95-ROJ', '95', 'rojo', 5500.00, 16),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-ROJ-100-ROJ', '100', 'rojo', 5500.00, 12),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-BLA-85-BLA', '85', 'blanco', 5500.00, 20),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-BLA-90-BLA', '90', 'blanco', 5500.00, 22),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-BLA-95-BLA', '95', 'blanco', 5500.00, 18),
('550e8400-e29b-41d4-a716-446655440004', 'CORP-PUSH-BLA-100-BLA', '100', 'blanco', 5500.00, 14);

-- Bombacha Colaless Roja (múltiples colores)
INSERT INTO product_variants (product_id, sku, size, color, price, stock_quantity) VALUES
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-ROJ-85-ROJ', '85', 'rojo', 3200.00, 30),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-ROJ-90-ROJ', '90', 'rojo', 3200.00, 35),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-ROJ-95-ROJ', '95', 'rojo', 3200.00, 32),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-ROJ-100-ROJ', '100', 'rojo', 3200.00, 25),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-NEG-85-NEG', '85', 'negro', 3200.00, 40),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-NEG-90-NEG', '90', 'negro', 3200.00, 45),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-NEG-95-NEG', '95', 'negro', 3200.00, 42),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-NEG-100-NEG', '100', 'negro', 3200.00, 35),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-BLA-85-BLA', '85', 'blanco', 3200.00, 25),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-BLA-90-BLA', '90', 'blanco', 3200.00, 28),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-BLA-95-BLA', '95', 'blanco', 3200.00, 26),
('550e8400-e29b-41d4-a716-446655440005', 'BOMB-COL-BLA-100-BLA', '100', 'blanco', 3200.00, 20);

-- Insert sample coupons
INSERT INTO coupons (code, type, value, minimum_amount, usage_limit, valid_until) VALUES
('BIENVENIDA10', 'percentage', 10.00, 5000.00, 100, NOW() + INTERVAL '30 days'),
('ENVIOGRATIS', 'fixed', 2500.00, 10000.00, 50, NOW() + INTERVAL '15 days'),
('PRIMERA20', 'percentage', 20.00, 8000.00, 25, NOW() + INTERVAL '60 days');