require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function verifyProductsDisplay() {
  console.log('🔍 Verificando productos para la página /productos...');
  
  // Consultar productos con sus categorías
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      base_price,
      images,
      is_active,
      category_id,
      categories!inner(
        id,
        name,
        slug
      )
    `)
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    console.error('❌ Error consultando productos:', error);
    return;
  }
  
  console.log(`✅ ${products.length} productos activos encontrados:\n`);
  
  products.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name}`);
    console.log(`   - Slug: ${product.slug}`);
    console.log(`   - Precio: $${product.base_price}`);
    console.log(`   - Categoría: ${product.categories.name} (${product.categories.slug})`);
    console.log(`   - Imagen: ${product.images}`);
    console.log(`   - Activo: ${product.is_active}`);
    console.log('');
  });
  
  // Verificar variantes
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select('product_id, size, color, stock_quantity')
    .eq('is_active', true);
    
  if (variantsError) {
    console.error('❌ Error consultando variantes:', variantsError);
    return;
  }
  
  console.log(`📦 ${variants.length} variantes activas encontradas`);
  
  // Agrupar variantes por producto
  const variantsByProduct = variants.reduce((acc, variant) => {
    if (!acc[variant.product_id]) {
      acc[variant.product_id] = [];
    }
    acc[variant.product_id].push(variant);
    return acc;
  }, {});
  
  console.log('\n📊 Resumen de variantes por producto:');
  products.forEach(product => {
    const productVariants = variantsByProduct[product.id] || [];
    const totalStock = productVariants.reduce((sum, v) => sum + v.stock_quantity, 0);
    console.log(`${product.name}: ${productVariants.length} variantes, Stock total: ${totalStock}`);
  });
  
  console.log('\n🎉 Verificación completada. Los productos están listos para mostrarse en /productos');
}

verifyProductsDisplay().catch(console.error);