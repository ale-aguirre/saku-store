const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseConnection() {
  console.log('🔍 Verificando conexión a Supabase...\n');

  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

  console.log('📋 Variables de entorno:');
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Configurada' : '❌ Faltante'}`);
  console.log(`  SUPABASE_SERVICE_ROLE: ${supabaseServiceRole ? '✅ Configurada' : '❌ Faltante'}\n`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Variables de entorno de Supabase faltantes');
    return;
  }

  try {
    // Crear cliente con clave anónima
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log('🔗 Probando conexión con cliente anónimo...');
    
    // Test 1: Verificar conexión básica
    const { data: healthCheck, error: healthError } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log(`❌ Error de conexión: ${healthError.message}`);
    } else {
      console.log('✅ Conexión básica exitosa');
    }

    // Test 2: Obtener productos
    console.log('\n📦 Probando consulta de productos...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        category,
        is_active,
        product_variants (
          id,
          size,
          color,
          price,
          stock_quantity
        )
      `)
      .eq('is_active', true)
      .limit(3);

    if (productsError) {
      console.log(`❌ Error al obtener productos: ${productsError.message}`);
    } else {
      console.log(`✅ Productos obtenidos: ${products?.length || 0}`);
      if (products && products.length > 0) {
        console.log('📋 Muestra de productos:');
        products.forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.name} (${product.product_variants?.length || 0} variantes)`);
        });
      }
    }

    // Test 3: Verificar categorías
    console.log('\n🏷️ Probando consulta de categorías...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, sort_order')
      .eq('is_active', true)
      .order('sort_order');

    if (categoriesError) {
      console.log(`❌ Error al obtener categorías: ${categoriesError.message}`);
    } else {
      console.log(`✅ Categorías obtenidas: ${categories?.length || 0}`);
      if (categories && categories.length > 0) {
        console.log('📋 Categorías disponibles:');
        categories.forEach((category, index) => {
          console.log(`  ${index + 1}. ${category.name} (orden: ${category.sort_order})`);
        });
      }
    }

    // Test 4: Verificar configuración del sitio
    console.log('\n⚙️ Probando configuración del sitio...');
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .limit(5);

    if (settingsError) {
      console.log(`❌ Error al obtener configuración: ${settingsError.message}`);
    } else {
      console.log(`✅ Configuraciones obtenidas: ${settings?.length || 0}`);
      if (settings && settings.length > 0) {
        console.log('📋 Configuraciones de ejemplo:');
        settings.forEach((setting, index) => {
          console.log(`  ${index + 1}. ${setting.key}: ${setting.value}`);
        });
      }
    }

    // Test 5: Verificar con service role (si está disponible)
    if (supabaseServiceRole) {
      console.log('\n🔑 Probando con Service Role...');
      const adminSupabase = createClient(supabaseUrl, supabaseServiceRole);
      
      const { data: adminTest, error: adminError } = await adminSupabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'admin')
        .limit(1);

      if (adminError) {
        console.log(`❌ Error con Service Role: ${adminError.message}`);
      } else {
        console.log(`✅ Service Role funcional: ${adminTest?.length || 0} admin(s) encontrado(s)`);
      }
    }

  } catch (error) {
    console.log(`❌ Error general: ${error.message}`);
  }

  console.log('\n🏁 Verificación de Supabase completada');
}

testSupabaseConnection().catch(console.error);