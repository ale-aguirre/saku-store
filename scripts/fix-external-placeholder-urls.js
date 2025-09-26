#!/usr/bin/env node

/**
 * Script para encontrar y limpiar URLs de placeholder externas
 * que causan errores en Next.js Image
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function main() {
  try {
    console.log('🔍 Buscando productos con URLs de placeholder externas...');
    
    // Obtener todos los productos con imágenes
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null);
      
    if (error) {
      console.error('❌ Error obteniendo productos:', error);
      return;
    }
    
    console.log(`📊 Total productos con imágenes: ${products.length}`);
    
    let foundExternal = 0;
    let cleaned = 0;
    
    for (const product of products) {
      if (!product.images || !Array.isArray(product.images)) continue;
      
      // Buscar URLs externas problemáticas
      const hasExternalUrls = product.images.some(img => 
        typeof img === 'string' && (
          img.includes('via.placeholder.com') ||
          img.includes('unsplash.com') ||
          img.includes('picsum.photos') ||
          img.includes('placeholder.com')
        )
      );
      
      if (hasExternalUrls) {
        foundExternal++;
        console.log(`🔍 Producto "${product.name}" tiene URLs externas:`);
        product.images.forEach((img, idx) => {
          if (typeof img === 'string' && (
            img.includes('via.placeholder.com') ||
            img.includes('unsplash.com') ||
            img.includes('picsum.photos') ||
            img.includes('placeholder.com')
          )) {
            console.log(`   ${idx + 1}. ${img}`);
          }
        });
        
        // Limpiar las imágenes externas
        console.log(`🧹 Limpiando imágenes externas de "${product.name}"`);
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: null })
          .eq('id', product.id);
          
        if (updateError) {
          console.error(`❌ Error limpiando ${product.name}:`, updateError);
        } else {
          cleaned++;
          console.log(`✅ Limpiado: ${product.name}`);
        }
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   - Productos con URLs externas encontrados: ${foundExternal}`);
    console.log(`   - Productos limpiados: ${cleaned}`);
    
    if (foundExternal === 0) {
      console.log('✅ No se encontraron URLs de placeholder externas');
    } else {
      console.log('\n💡 Los productos ahora usarán:');
      console.log('   - Imágenes reales subidas por el administrador');
      console.log('   - Placeholder SVG generado dinámicamente (sin URLs externas)');
    }
    
    // Verificar que no queden URLs externas
    const { data: remaining, error: checkError } = await supabase
      .from('products')
      .select('id, name, images')
      .not('images', 'is', null);
      
    if (checkError) {
      console.error('❌ Error verificando:', checkError);
      return;
    }
    
    const stillHasExternal = remaining.filter(p => 
      p.images && Array.isArray(p.images) && p.images.some(img => 
        typeof img === 'string' && (
          img.includes('via.placeholder.com') ||
          img.includes('unsplash.com') ||
          img.includes('picsum.photos') ||
          img.includes('placeholder.com')
        )
      )
    );
    
    if (stillHasExternal.length > 0) {
      console.log(`\n⚠️  Aún quedan ${stillHasExternal.length} productos con URLs externas:`);
      stillHasExternal.forEach(p => console.log(`   - ${p.name}`));
    } else {
      console.log('\n✅ Todos los productos están limpios de URLs externas');
    }
    
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