#!/usr/bin/env node

/**
 * Script para poblar imágenes de variantes como ejemplo
 * Actualiza algunas variantes con imágenes específicas para demostrar el sistema
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  console.log('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE en tu .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function populateVariantImages() {
  console.log('🖼️  Poblando imágenes de variantes...\n');

  try {
    // Obtener algunos productos y sus variantes
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        slug,
        images,
        product_variants (
          id,
          size,
          color,
          images
        )
      `)
      .limit(3);

    if (productsError) {
      throw productsError;
    }

    console.log(`📦 Encontrados ${products.length} productos para actualizar\n`);

    // Ejemplos de imágenes por variante (simulando que tenemos imágenes específicas)
    const variantImageExamples = [
      // Variantes negras
      { color: 'negro', images: ['/productos/variantes/negro-1.jpg', '/productos/variantes/negro-2.jpg'] },
      // Variantes rojas
      { color: 'rojo', images: ['/productos/variantes/rojo-1.jpg', '/productos/variantes/rojo-2.jpg'] },
      // Variantes blancas
      { color: 'blanco', images: ['/productos/variantes/blanco-1.jpg', '/productos/variantes/blanco-2.jpg'] },
    ];

    let updatedCount = 0;

    for (const product of products) {
      console.log(`🔄 Procesando producto: ${product.name}`);
      
      for (const variant of product.product_variants) {
        // Buscar imágenes específicas para este color
        const colorImages = variantImageExamples.find(ex => ex.color === variant.color);
        
        if (colorImages && (!variant.images || variant.images.length === 0)) {
          // Actualizar la variante con imágenes específicas
          const { error: updateError } = await supabase
            .from('product_variants')
            .update({ images: colorImages.images })
            .eq('id', variant.id);

          if (updateError) {
            console.error(`❌ Error actualizando variante ${variant.id}:`, updateError.message);
          } else {
            console.log(`  ✅ Variante ${variant.size || 'UNI'} ${variant.color}: ${colorImages.images.length} imágenes agregadas`);
            updatedCount++;
          }
        } else if (variant.images && variant.images.length > 0) {
          console.log(`  ℹ️  Variante ${variant.size || 'UNI'} ${variant.color}: ya tiene ${variant.images.length} imágenes`);
        } else {
          console.log(`  ⚠️  Variante ${variant.size || 'UNI'} ${variant.color}: sin imágenes específicas disponibles`);
        }
      }
      console.log('');
    }

    console.log(`🎉 Proceso completado!`);
    console.log(`📊 Resumen:`);
    console.log(`   - Productos procesados: ${products.length}`);
    console.log(`   - Variantes actualizadas: ${updatedCount}`);
    console.log('');
    console.log('💡 Nota: Las imágenes de ejemplo son rutas ficticias.');
    console.log('   En producción, estas serían URLs reales de imágenes subidas.');

  } catch (error) {
    console.error('❌ Error poblando imágenes de variantes:', error.message);
    process.exit(1);
  }
}

// Función para probar la función get_variant_primary_image
async function testVariantImageFunction() {
  console.log('\n🧪 Probando función get_variant_primary_image...\n');

  try {
    // Obtener una variante para probar
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, size, color, images, product_id')
      .limit(1)
      .single();

    if (variantError) {
      throw variantError;
    }

    // Probar la función SQL
    const { data: result, error: functionError } = await supabase
      .rpc('get_variant_primary_image', { variant_id: variant.id });

    if (functionError) {
      throw functionError;
    }

    console.log(`📸 Imagen primaria para variante ${variant.size || 'UNI'} ${variant.color}:`);
    console.log(`   Resultado: ${result || 'null'}`);
    console.log(`   Imágenes de variante: ${JSON.stringify(variant.images)}`);

  } catch (error) {
    console.error('❌ Error probando función:', error.message);
  }
}

// Ejecutar el script
async function main() {
  await populateVariantImages();
  await testVariantImageFunction();
}

main().catch(console.error);