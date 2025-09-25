-- Create site_settings table for dynamic configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  type TEXT DEFAULT 'string', -- string, number, boolean, json
  is_public BOOLEAN DEFAULT FALSE, -- whether this setting can be accessed from client-side
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create copy_blocks table for dynamic text content
CREATE TABLE IF NOT EXISTS copy_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  locale TEXT DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default site settings
INSERT INTO site_settings (key, value, description, type, is_public) VALUES
  ('site_name', 'Sakú Lencería', 'Nombre del sitio', 'string', true),
  ('site_description', 'Lencería femenina de calidad premium', 'Descripción del sitio', 'string', true),
  ('shipping_flat_rate', '2500', 'Tarifa plana de envío nacional', 'number', true),
  ('shipping_cordoba_rate', '1500', 'Tarifa de envío en Córdoba', 'number', true),
  ('free_shipping_threshold', '15000', 'Monto mínimo para envío gratis', 'number', true),
  ('currency', 'ARS', 'Moneda del sitio', 'string', true),
  ('tax_rate', '0', 'Tasa de impuestos', 'number', false),
  ('maintenance_mode', 'false', 'Modo de mantenimiento', 'boolean', true),
  ('max_cart_items', '10', 'Máximo de items en carrito', 'number', true),
  ('stock_alert_threshold', '5', 'Umbral de alerta de stock bajo', 'number', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default copy blocks
INSERT INTO copy_blocks (key, content, description, locale) VALUES
  ('hero_title', 'Descubre tu estilo único', 'Título principal del hero', 'es'),
  ('hero_subtitle', 'Lencería femenina diseñada para realzar tu belleza natural', 'Subtítulo del hero', 'es'),
  ('pdp_return_policy', 'Por razones de higiene, no se aceptan devoluciones en productos de lencería', 'Política de devoluciones en PDP', 'es'),
  ('cart_empty_message', 'Tu carrito está vacío', 'Mensaje de carrito vacío', 'es'),
  ('checkout_terms', 'Al realizar la compra, aceptas nuestros términos y condiciones', 'Términos en checkout', 'es'),
  ('footer_copyright', '© 2024 Sakú Lencería. Todos los derechos reservados.', 'Copyright en footer', 'es'),
  ('contact_email', 'hola@saku.com.ar', 'Email de contacto', 'es'),
  ('contact_phone', '+54 351 123-4567', 'Teléfono de contacto', 'es'),
  ('shipping_info', 'Envíos a todo el país. Entrega en 3-5 días hábiles.', 'Información de envíos', 'es'),
  ('size_guide_link', '/guia-de-talles', 'Link a guía de talles', 'es')
ON CONFLICT (key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(key);
CREATE INDEX IF NOT EXISTS idx_site_settings_is_public ON site_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_copy_blocks_key ON copy_blocks(key);
CREATE INDEX IF NOT EXISTS idx_copy_blocks_locale ON copy_blocks(locale);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for site_settings
CREATE POLICY "Public settings are viewable by everyone" ON site_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "All settings are viewable by admins" ON site_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Settings are manageable by admins" ON site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for copy_blocks
CREATE POLICY "Copy blocks are viewable by everyone" ON copy_blocks
  FOR SELECT USING (true);

CREATE POLICY "Copy blocks are manageable by admins" ON copy_blocks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );