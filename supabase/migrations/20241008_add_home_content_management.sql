-- Migration: Add home content management (hero and categories)
-- Created: 2024-10-08

-- Create home_sections table for managing hero and category content
CREATE TABLE IF NOT EXISTS home_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_type text NOT NULL CHECK (section_type IN ('hero', 'categories')),
  title text,
  subtitle text,
  image_url text,
  cta_primary_text text,
  cta_primary_url text,
  cta_secondary_text text,
  cta_secondary_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies for home_sections
ALTER TABLE home_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active sections
CREATE POLICY "Anyone can read active home sections" ON home_sections
  FOR SELECT USING (is_active = true);

-- Policy: Only authenticated users can manage sections
CREATE POLICY "Authenticated users can manage home sections" ON home_sections
  FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_home_sections_updated_at 
  BEFORE UPDATE ON home_sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial hero section
INSERT INTO home_sections (
  section_type, 
  title, 
  subtitle, 
  image_url, 
  cta_primary_text, 
  cta_primary_url,
  cta_secondary_text,
  cta_secondary_url,
  sort_order
) VALUES (
  'hero',
  'Descubre tu estilo único',
  'Lencería que realza tu belleza natural con diseños exclusivos y materiales de primera calidad',
  '/hero-1.webp',
  'Explorar Colección',
  '/productos',
  'Ver Ofertas',
  '/productos?filter=ofertas',
  1
);

-- Note: copy_blocks table will be created in a later migration
-- This section is commented out to avoid dependency issues
-- The copy_blocks data will be inserted when that table is available

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_home_sections_type_active ON home_sections(section_type, is_active);
CREATE INDEX IF NOT EXISTS idx_home_sections_sort_order ON home_sections(sort_order);

-- Add comments for documentation
COMMENT ON TABLE home_sections IS 'Manages editable content for home page sections (hero, categories)';
COMMENT ON COLUMN home_sections.section_type IS 'Type of section: hero or categories';
COMMENT ON COLUMN home_sections.metadata IS 'Additional flexible data stored as JSON';
COMMENT ON COLUMN home_sections.sort_order IS 'Order for displaying multiple sections of the same type';