#!/usr/bin/env node

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixHeroSection() {
  try {
    console.log('🔍 Checking for existing hero section...');
    
    // Check if hero section exists
    const { data: existingHero, error: checkError } = await supabase
      .from('home_sections')
      .select('*')
      .eq('section_type', 'hero')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingHero) {
      console.log('✅ Hero section already exists:', existingHero);
      return;
    }

    console.log('📝 Creating hero section...');
    
    // Create hero section
    const { data: newHero, error: insertError } = await supabase
      .from('home_sections')
      .insert({
        section_type: 'hero',
        title: 'Descubre tu estilo único',
        subtitle: 'Lencería que realza tu belleza natural con diseños exclusivos y materiales de primera calidad',
        image_url: '/hero-1.webp',
        cta_primary_text: 'Explorar Colección',
        cta_primary_url: '/productos',
        cta_secondary_text: 'Ver Ofertas',
        cta_secondary_url: '/productos?filter=ofertas',
        sort_order: 1,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Hero section created successfully:', newHero);

  } catch (error) {
    console.error('❌ Error fixing hero section:', error);
    process.exit(1);
  }
}

fixHeroSection();