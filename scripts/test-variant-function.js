#!/usr/bin/env node

/**
 * Script para verificar si la función get_variant_primary_image existe en Supabase
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testFunction() {
  console.log('🔍 Verificando función get_variant_primary_image...\n');

  try {
    // Verificar si la función existe consultando el catálogo del sistema
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'get_variant_primary_image');

    if (functionsError) {
      console.log('⚠️  No se pudo consultar pg_proc, probando directamente...');
    } else if (functions && functions.length > 0) {
      console.log('✅ Función encontrada en el catálogo del sistema');
      console.log(`📝 Código de la función:\n${functions[0].prosrc}\n`);
    } else {
      console.log('❌ Función no encontrada en el catálogo del sistema');
    }

    // Obtener una variante para probar
    const { data: variant, error: variantError } = await supabase
      .from('product_variants')
      .select('id, size, color, images, product_id')
      .limit(1)
      .single();

    if (variantError) {
      throw variantError;
    }

    console.log(`🧪 Probando con variante: ${variant.size || 'UNI'} ${variant.color}`);
    console.log(`   ID: ${variant.id}`);
    console.log(`   Imágenes: ${JSON.stringify(variant.images)}\n`);

    // Probar la función SQL
    const { data: result, error: functionError } = await supabase
      .rpc('get_variant_primary_image', { variant_id: variant.id });

    if (functionError) {
      console.error('❌ Error ejecutando función:', functionError.message);
      console.log('\n💡 La función probablemente no existe. Vamos a crearla...');
      return false;
    } else {
      console.log(`✅ Función ejecutada exitosamente`);
      console.log(`📸 Resultado: ${result || 'null'}`);
      return true;
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    return false;
  }
}

async function createFunction() {
  console.log('\n🛠️  Creando función get_variant_primary_image...\n');

  const functionSQL = `
CREATE OR REPLACE FUNCTION get_variant_primary_image(variant_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    variant_image TEXT;
    product_image TEXT;
BEGIN
    -- Intentar obtener la primera imagen de la variante
    SELECT images[1] INTO variant_image
    FROM product_variants
    WHERE id = variant_id AND images IS NOT NULL AND array_length(images, 1) > 0;
    
    -- Si la variante tiene imagen, devolverla
    IF variant_image IS NOT NULL THEN
        RETURN variant_image;
    END IF;
    
    -- Si no, obtener la primera imagen del producto padre
    SELECT p.images[1] INTO product_image
    FROM product_variants pv
    JOIN products p ON p.id = pv.product_id
    WHERE pv.id = variant_id AND p.images IS NOT NULL AND array_length(p.images, 1) > 0;
    
    -- Devolver la imagen del producto o NULL si no hay ninguna
    RETURN product_image;
END;
$$;
  `;

  try {
    const { error } = await supabase.rpc('exec', { sql: functionSQL });
    
    if (error) {
      console.error('❌ Error creando función:', error.message);
      return false;
    } else {
      console.log('✅ Función creada exitosamente');
      return true;
    }
  } catch (error) {
    console.error('❌ Error ejecutando SQL:', error.message);
    return false;
  }
}

async function main() {
  const exists = await testFunction();
  
  if (!exists) {
    const created = await createFunction();
    
    if (created) {
      console.log('\n🔄 Probando función recién creada...\n');
      await testFunction();
    }
  }
}

main().catch(console.error);