#!/usr/bin/env node

/**
 * Script para verificar y corregir el estado activo de los productos
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

// Cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  try {
    console.log('🔍 Verificando estado de productos...');
    
    // Obtener todos los productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .order('name');
    
    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError.message);
      return;
    }
    
    console.log(`📊 Total de productos: ${products.length}`);
    
    const activeProducts = products.filter(p => p.is_active);
    const inactiveProducts = products.filter(p => !p.is_active);
    
    console.log(`✅ Productos activos: ${activeProducts.length}`);
    console.log(`❌ Productos inactivos: ${inactiveProducts.length}`);
    
    if (inactiveProducts.length > 0) {
      console.log('\n🔧 Productos inactivos encontrados:');
      inactiveProducts.forEach(product => {
        console.log(`  - ${product.name} (ID: ${product.id})`);
      });
      
      console.log('\n🔄 Activando productos...');
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_active: true })
        .eq('is_active', false);
      
      if (updateError) {
        console.error('❌ Error activando productos:', updateError.message);
        return;
      }
      
      console.log('✅ Todos los productos han sido activados');
    }
    
    // Verificar variantes
    console.log('\n🔍 Verificando estado de variantes...');
    
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, sku, is_active')
      .order('sku');
    
    if (variantsError) {
      console.error('❌ Error obteniendo variantes:', variantsError.message);
      return;
    }
    
    console.log(`📊 Total de variantes: ${variants.length}`);
    
    const activeVariants = variants.filter(v => v.is_active);
    const inactiveVariants = variants.filter(v => !v.is_active);
    
    console.log(`✅ Variantes activas: ${activeVariants.length}`);
    console.log(`❌ Variantes inactivas: ${inactiveVariants.length}`);
    
    if (inactiveVariants.length > 0) {
      console.log('\n🔧 Variantes inactivas encontradas:');
      inactiveVariants.slice(0, 10).forEach(variant => {
        console.log(`  - ${variant.sku} (ID: ${variant.id})`);
      });
      
      if (inactiveVariants.length > 10) {
        console.log(`  ... y ${inactiveVariants.length - 10} más`);
      }
      
      console.log('\n🔄 Activando variantes...');
      
      const { error: updateVariantsError } = await supabase
        .from('product_variants')
        .update({ is_active: true })
        .eq('is_active', false);
      
      if (updateVariantsError) {
        console.error('❌ Error activando variantes:', updateVariantsError.message);
        return;
      }
      
      console.log('✅ Todas las variantes han sido activadas');
    }
    
    console.log('\n🎉 Verificación y corrección completada');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };