require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function checkVariants() {
  console.log('🔍 Verificando variantes de productos destacados...');
  
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, 
      name,
      product_variants (
        id,
        size,
        color,
        stock_quantity,
        is_active
      )
    `)
    .eq('is_featured', true)
    .eq('is_active', true);
    
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log('📊 Productos destacados con variantes:');
  
  for (const product of products) {
    console.log(`\n📦 ${product.name} (ID: ${product.id})`);
    
    if (!product.product_variants || product.product_variants.length === 0) {
      console.log('  ⚠️  Sin variantes');
      continue;
    }
    
    const activeVariants = product.product_variants.filter(v => v.is_active);
    const inStockVariants = activeVariants.filter(v => v.stock_quantity > 0);
    
    console.log(`  📋 Total variantes: ${product.product_variants.length}`);
    console.log(`  ✅ Variantes activas: ${activeVariants.length}`);
    console.log(`  📦 Con stock: ${inStockVariants.length}`);
    
    if (inStockVariants.length > 0) {
      console.log('  🎯 Variantes disponibles:');
      inStockVariants.forEach(v => {
        console.log(`    - Talle ${v.size}, Color ${v.color}, Stock: ${v.stock_quantity}`);
      });
    }
  }
}

checkVariants().catch(console.error);