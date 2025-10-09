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

async function addSetsCategory() {
  try {
    console.log('🔍 Checking if Sets category already exists...');
    
    // Verificar si la categoría Sets ya existe
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', 'sets')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingCategory) {
      console.log('✅ Sets category already exists:', existingCategory);
      return;
    }

    console.log('📝 Creating Sets category...');
    
    // Crear la nueva categoría Sets
    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert({
        name: 'Sets',
        slug: 'sets',
        description: 'Conjuntos completos de lencería diseñados para combinar perfectamente',
        is_active: true,
        sort_order: 4 // Después de las 3 categorías existentes
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    console.log('✅ Sets category created successfully:', newCategory);

    // Verificar el estado final de todas las categorías
    console.log('\n📋 Current categories:');
    const { data: allCategories, error: listError } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (listError) {
      throw listError;
    }

    allCategories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.slug}) - Order: ${category.sort_order}`);
    });

  } catch (error) {
    console.error('❌ Error adding Sets category:', error);
    process.exit(1);
  }
}

addSetsCategory();