#!/usr/bin/env node

/**
 * Script para limpiar las imágenes placeholder incorrectas
 * Los productos deben usar imágenes reales del admin, con fallback automático en el frontend
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function main() {
  try {
    console.log('🧹 Limpiando imágenes placeholder incorrectas...');
    
    // Obtener productos con imágenes de Unsplash (placeholder)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null);
      
    if (error) {
      console.error('❌ Error obteniendo productos:', error);
      return;
    }
    
    let cleaned = 0;
    
    for (const product of products) {
      // Verificar si tiene imágenes de Unsplash (placeholder)
      const hasPlaceholder = product.images && 
        product.images.some(img => img.includes('unsplash.com'));
      
      if (hasPlaceholder) {
        console.log(`🧹 Limpiando placeholder de "${product.name}"`);
        
        // Limpiar imágenes placeholder
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: null })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`❌ Error limpiando ${product.name}:`, updateError);
        } else {
          cleaned++;
        }
      }
    }
    
    console.log(`\n✅ ${cleaned} productos limpiados de placeholders incorrectos`);
    
    // Verificar resultado
    const { data: remaining, error: checkError } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null);
      
    if (checkError) {
      console.error('❌ Error verificando:', checkError);
      return;
    }
    
    const withUnsplash = remaining.filter(p => 
      p.images && p.images.some(img => img.includes('unsplash.com'))
    );
    
    console.log(`📊 Productos restantes con imágenes: ${remaining.length}`);
    console.log(`📊 Productos con placeholder Unsplash: ${withUnsplash.length}`);
    
    if (withUnsplash.length === 0) {
      console.log('✅ Todos los placeholders de Unsplash han sido eliminados');
    }
    
    console.log('\n💡 Ahora los productos usarán:');
    console.log('   - Imágenes reales subidas por el administrador');
    console.log('   - Fallback automático en el frontend cuando falle la carga');
    
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