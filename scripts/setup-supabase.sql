-- Sakú Store - Configuración inicial de Supabase
-- Este script crea todas las tablas necesarias para el e-commerce

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de variantes de productos
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL,
  color VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL, -- Precio en centavos
  compare_at_price INTEGER, -- Precio de comparación en centavos
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  sku VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, size, color)
);

-- Tabla de cupones
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL,
  minimum_amount INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carritos
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- NULL para carritos de invitados
  session_id VARCHAR(255), -- Para carritos de invitados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_variant_id)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  subtotal INTEGER NOT NULL,
  discount_amount INTEGER DEFAULT 0,
  shipping_amount INTEGER NOT NULL,
  total INTEGER NOT NULL,
  coupon_code VARCHAR(50),
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  payment_method VARCHAR(50),
  payment_id VARCHAR(255),
  tracking_number VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de órdenes
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_variant_id UUID NOT NULL REFERENCES product_variants(id),
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  product_snapshot JSONB NOT NULL, -- Snapshot del producto al momento de la compra
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de eventos de órdenes
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuraciones del sitio
CREATE TABLE IF NOT EXISTS site_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de bloques de contenido
CREATE TABLE IF NOT EXISTS copy_blocks (
  key VARCHAR(100) PRIMARY KEY,
  content TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON product_variants(is_active);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar configuraciones iniciales
INSERT INTO site_settings (key, value, description) VALUES
('shipping_flat_rate', '2500', 'Tarifa plana de envío nacional en centavos'),
('shipping_cordoba_rate', '1500', 'Tarifa de envío en Córdoba con cadete en centavos'),
('store_name', 'Sakú Lencería', 'Nombre de la tienda'),
('store_email', 'info@saku-store.com', 'Email de contacto de la tienda'),
('store_phone', '+54 351 123-4567', 'Teléfono de contacto'),
('currency', 'ARS', 'Moneda de la tienda'),
('tax_rate', '0', 'Tasa de impuestos (0-100)')
ON CONFLICT (key) DO NOTHING;

-- Insertar bloques de contenido iniciales
INSERT INTO copy_blocks (key, content, description) VALUES
('hero_title', 'Descubre tu estilo único', 'Título principal del hero'),
('hero_subtitle', 'Lencería elegante y cómoda para cada momento', 'Subtítulo del hero'),
('pdp_return_policy', 'Por razones de higiene, este producto no admite cambios ni devoluciones.', 'Política de devoluciones en PDP'),
('cart_empty_message', 'Tu carrito está vacío', 'Mensaje cuando el carrito está vacío'),
('checkout_terms', 'Al finalizar la compra, aceptas nuestros términos y condiciones.', 'Términos en checkout')
ON CONFLICT (key) DO NOTHING;

-- Insertar productos de ejemplo (datos mock)
INSERT INTO products (id, name, description, category, image_url) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Brasier Comfort', 'Brasier cómodo y elegante para uso diario. Confeccionado con materiales de alta calidad que brindan soporte y comodidad durante todo el día.', 'brasieres', '/productos/brasier-comfort.svg'),
('550e8400-e29b-41d4-a716-446655440002', 'Brasier Push-Up', 'Brasier con realce que resalta tu figura natural. Diseño moderno con encaje delicado y copas moldeadas.', 'brasieres', '/productos/brasier-pushup.svg'),
('550e8400-e29b-41d4-a716-446655440003', 'Conjunto Elegance', 'Conjunto completo de brasier y bombacha con encaje francés. Perfecto para ocasiones especiales.', 'conjuntos', '/productos/conjunto-elegance.svg')
ON CONFLICT (id) DO NOTHING;

-- Insertar variantes de productos
INSERT INTO product_variants (id, product_id, size, color, price, compare_at_price, stock_quantity, sku) VALUES
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '85', 'negro', 15000, 18000, 10, 'BC-85-NEG'),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '90', 'negro', 15000, 18000, 8, 'BC-90-NEG'),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', '85', 'blanco', 15000, NULL, 5, 'BC-85-BLA'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', '85', 'rojo', 18000, NULL, 12, 'BP-85-ROJ'),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', '90', 'rojo', 18000, NULL, 7, 'BP-90-ROJ'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440003', '85', 'negro', 25000, 30000, 6, 'CE-85-NEG')
ON CONFLICT (id) DO NOTHING;

-- Insertar cupones de ejemplo
INSERT INTO coupons (id, code, discount_type, discount_value, minimum_amount, usage_limit, expires_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', 'BIENVENIDA15', 'percentage', 15, 10000, NULL, '2024-12-31 23:59:59+00'),
('550e8400-e29b-41d4-a716-446655440102', 'ENVIOGRATIS', 'fixed', 2500, 20000, 100, '2024-06-30 23:59:59+00')
ON CONFLICT (id) DO NOTHING;

-- Configurar RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_blocks ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (lectura pública para productos y configuraciones)
CREATE POLICY "Public read access for products" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for product_variants" ON product_variants FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public read access for site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access for copy_blocks" ON copy_blocks FOR SELECT USING (true);

-- Políticas para carritos (por session_id o user_id)
CREATE POLICY "Users can manage their own carts" ON carts FOR ALL USING (
  auth.uid() = user_id OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

CREATE POLICY "Users can manage their own cart items" ON cart_items FOR ALL USING (
  cart_id IN (
    SELECT id FROM carts WHERE 
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Políticas para órdenes
CREATE POLICY "Users can view their own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own order items" ON order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE auth.uid() = user_id)
);
CREATE POLICY "Users can view their own order events" ON order_events FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE auth.uid() = user_id)
);

COMMENT ON TABLE products IS 'Catálogo de productos de Sakú Lencería';
COMMENT ON TABLE product_variants IS 'Variantes de productos con talle, color, precio y stock';
COMMENT ON TABLE coupons IS 'Cupones de descuento';
COMMENT ON TABLE carts IS 'Carritos de compra';
COMMENT ON TABLE cart_items IS 'Items en los carritos';
COMMENT ON TABLE orders IS 'Órdenes de compra';
COMMENT ON TABLE order_items IS 'Items de las órdenes';
COMMENT ON TABLE order_events IS 'Eventos y cambios de estado de las órdenes';
COMMENT ON TABLE site_settings IS 'Configuraciones generales del sitio';
COMMENT ON TABLE copy_blocks IS 'Bloques de contenido y textos del sitio';