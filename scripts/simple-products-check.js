#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function main() {
  try {
    console.log('🔍 Verificación simple de productos...');
    
    // Consultar productos sin joins
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, is_active, category_id')
      .eq('is_active', true)
      .order('name')
      .limit(10);
      
    if (error) {
      console.error('❌ Error consultando productos:', error);
      return;
    }
    
    console.log(`✅ ${products.length} productos activos encontrados (primeros 10):\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Slug: ${product.slug}`);
      console.log(`   - Category ID: ${product.category_id}`);
      console.log(`   - Activo: ${product.is_active}`);
      console.log('');
    });
    
    // Verificar categorías
    console.log('🔍 Verificando categorías...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name');
      
    if (catError) {
      console.error('❌ Error consultando categorías:', catError);
      return;
    }
    
    console.log(`📊 ${categories.length} categorías encontradas:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();