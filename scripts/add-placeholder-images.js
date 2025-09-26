#!/usr/bin/env node

/**
 * Script para asignar imágenes placeholder a productos sin imágenes
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// URLs de imágenes placeholder por categoría
const placeholderImages = {
  'bombachas': [
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571513722275-4b3ab86c7d96?w=400&h=400&fit=crop&crop=center'
  ],
  'corpinos': [
    'https://images.unsplash.com/photo-1571513722275-4b3ab86c7d96?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center'
  ],
  'conjuntos': [
    'https://images.unsplash.com/photo-1571513722275-4b3ab86c7d96?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1571513722275-4b3ab86c7d96?w=400&h=400&fit=crop&crop=center'
  ]
};

async function main() {
  try {
    console.log('🔍 Buscando productos sin imágenes...');
    
    // Obtener productos con sus categorías
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        images,
        categories!inner(slug)
      `)
      .or('images.is.null,images.eq.{}');
      
    if (error) {
      console.error('❌ Error obteniendo productos:', error);
      return;
    }
    
    console.log(`📦 ${products.length} productos sin imágenes encontrados`);
    
    let updated = 0;
    
    for (const product of products) {
      const categorySlug = product.categories.slug;
      const images = placeholderImages[categorySlug] || placeholderImages['conjuntos'];
      
      console.log(`🖼️  Asignando imágenes a "${product.name}" (${categorySlug})`);
      console.log(`   - ${images.length} imágenes placeholder`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ images })
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`❌ Error actualizando ${product.name}:`, updateError);
      } else {
        updated++;
      }
      
      // Pequeño delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    console.log(`\n✅ ${updated} productos actualizados con imágenes placeholder`);
    
    // Verificar resultado
    console.log('\n🔍 Verificando productos con imágenes...');
    
    const { data: withImages, error: checkError } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null)
      .neq('images', '{}');
      
    if (checkError) {
      console.error('❌ Error verificando:', checkError);
      return;
    }
    
    console.log(`📊 ${withImages.length} productos tienen imágenes asignadas`);
    
    // Mostrar algunos ejemplos
    console.log('\n📸 Ejemplos de productos con imágenes:');
    withImages.slice(0, 5).forEach(product => {
      console.log(`  - ${product.name}: ${product.images.length} imagen(es)`);
    });
    
    console.log('\n🎉 Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };