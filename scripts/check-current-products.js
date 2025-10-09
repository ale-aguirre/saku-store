require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function checkProducts() {
  console.log('🔍 Verificando estado actual de productos...\n');
  
  try {
    // Contar productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, is_active')
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('❌ Error consultando productos:', productsError);
      return;
    }
    
    console.log(`📦 Total productos: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\n📋 Productos encontrados:');
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.slug}) - ${product.active ? 'Activo' : 'Inactivo'}`);
      });
    } else {
      console.log('❌ No se encontraron productos en la base de datos');
    }
    
    // Contar variantes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, size, color, stock')
      .order('created_at', { ascending: false });
    
    if (variantsError) {
      console.error('❌ Error consultando variantes:', variantsError);
      return;
    }
    
    console.log(`\n🎨 Total variantes: ${variants.length}`);
    
    if (variants.length > 0) {
      console.log('\n📋 Variantes encontradas:');
      variants.slice(0, 10).forEach((variant, index) => {
        console.log(`${index + 1}. Talle ${variant.size}, Color ${variant.color}, Stock: ${variant.stock}`);
      });
      
      if (variants.length > 10) {
        console.log(`... y ${variants.length - 10} variantes más`);
      }
    } else {
      console.log('❌ No se encontraron variantes en la base de datos');
    }
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkProducts();