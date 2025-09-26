#!/usr/bin/env node

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function main() {
  try {
    console.log('🔍 Buscando productos con slug null...');
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug')
      .is('slug', null);
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    console.log(`📦 ${products.length} productos sin slug:`);
    
    for (const product of products) {
      console.log(`🔄 Procesando: ${product.name}`);
      
      // Generar slug único
      let baseSlug = product.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Verificar si el slug ya existe
      while (true) {
        const { data: existing, error: checkError } = await supabase
          .from('products')
          .select('id')
          .eq('slug', finalSlug)
          .limit(1);
          
        if (checkError) {
          console.error('❌ Error verificando slug:', checkError);
          break;
        }
        
        if (existing.length === 0) {
          // Slug disponible
          break;
        }
        
        // Slug ocupado, probar con número
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      console.log(`   - Asignando slug: ${finalSlug}`);
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ slug: finalSlug })
        .eq('id', product.id);
        
      if (updateError) {
        console.error(`❌ Error actualizando ${product.name}:`, updateError);
      } else {
        console.log(`✅ ${product.name} actualizado`);
      }
    }
    
    console.log('\n🎉 Proceso completado');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();