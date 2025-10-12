const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function checkAndFixMonacoEncoding() {
  try {
    console.log('🔍 Verificando productos con caracteres de codificación incorrectos...');
    
    // Buscar productos que contengan "M�naco"
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug')
      .ilike('name', '%M_naco%');
    
    if (error) {
      console.error('❌ Error al buscar productos:', error);
      return;
    }
    
    console.log(`📋 Encontrados ${products.length} productos con problemas de codificación:`);
    
    for (const product of products) {
      console.log(`\n🔧 Producto ID: ${product.id}`);
      console.log(`   Nombre actual: "${product.name}"`);
      console.log(`   Slug actual: "${product.slug}"`);
      
      // Corregir el nombre
      let fixedName = product.name;
      let fixedSlug = product.slug;
      
      // Reemplazar M�naco por Mónaco
      if (fixedName.includes('M�naco')) {
        fixedName = fixedName.replace(/M�naco/g, 'Mónaco');
        console.log(`   ✅ Nombre corregido: "${fixedName}"`);
        
        // También corregir el slug si es necesario
        if (fixedSlug.includes('mnaco')) {
          fixedSlug = fixedSlug.replace(/mnaco/g, 'monaco');
          console.log(`   ✅ Slug corregido: "${fixedSlug}"`);
        }
        
        // Actualizar en la base de datos
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            name: fixedName,
            slug: fixedSlug
          })
          .eq('id', product.id);
        
        if (updateError) {
          console.error(`   ❌ Error al actualizar producto ${product.id}:`, updateError);
        } else {
          console.log(`   ✅ Producto ${product.id} actualizado correctamente`);
        }
      }
    }
    
    console.log('\n🎉 Proceso completado');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
checkAndFixMonacoEncoding();