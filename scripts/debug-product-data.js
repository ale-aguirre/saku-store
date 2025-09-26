require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function debugProductData() {
  try {
    console.log('🔍 Verificando datos del producto AMORE...');
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          sku,
          size,
          color,
          material,
          price_adjustment,
          stock_quantity,
          low_stock_threshold,
          is_active
        ),
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', 'amore')
      .eq('is_active', true)
      .single();
      
    if (error) {
      console.error('❌ Error:', error);
      return;
    }
    
    if (!data) {
      console.log('❌ No se encontró el producto');
      return;
    }
    
    console.log('📦 Datos del producto:');
    console.log(`- ID: ${data.id}`);
    console.log(`- Nombre: ${data.name}`);
    console.log(`- Slug: ${data.slug}`);
    console.log(`- Precio base: ${data.base_price}`);
    console.log(`- Precio comparación: ${data.compare_at_price}`);
    console.log(`- Descripción: ${data.description}`);
    console.log(`- Imágenes: ${JSON.stringify(data.images)}`);
    
    console.log('\n🎨 Variantes:');
    if (data.product_variants && data.product_variants.length > 0) {
      data.product_variants.forEach((variant, index) => {
        console.log(`  ${index + 1}. ${variant.size} - ${variant.color}`);
        console.log(`     - SKU: ${variant.sku}`);
        console.log(`     - Ajuste precio: ${variant.price_adjustment}`);
        console.log(`     - Stock: ${variant.stock_quantity}`);
        console.log(`     - Activo: ${variant.is_active}`);
        console.log(`     - Precio final: ${data.base_price + (variant.price_adjustment || 0)}`);
      });
    } else {
      console.log('  No hay variantes');
    }
    
    console.log('\n📊 Cálculos de precio:');
    const variants = data.product_variants || [];
    const prices = variants.map(v => data.base_price + (v.price_adjustment || 0));
    const minPrice = prices.length > 0 ? Math.min(...prices) : data.base_price;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : data.base_price;
    
    console.log(`- Precio mínimo: ${minPrice}`);
    console.log(`- Precio máximo: ${maxPrice}`);
    console.log(`- Rango: ${minPrice === maxPrice ? minPrice : `${minPrice} - ${maxPrice}`}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugProductData();