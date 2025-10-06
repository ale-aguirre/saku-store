require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductImages() {
  console.log('🔍 Verificando datos de productos con imágenes...\n');
  
  // Primero verificar todos los productos
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('id, name, slug, images, is_active')
    .eq('is_active', true);
    
  if (allError) {
    console.error('❌ Error:', allError);
    return;
  }
  
  console.log(`📊 Total productos activos: ${allProducts.length}\n`);
  
  // Contar productos con y sin imágenes
  const withImages = allProducts.filter(p => p.images && Array.isArray(p.images) && p.images.length > 0);
  const withoutImages = allProducts.filter(p => !p.images || !Array.isArray(p.images) || p.images.length === 0);
  
  console.log(`✅ Con imágenes: ${withImages.length}`);
  console.log(`❌ Sin imágenes: ${withoutImages.length}\n`);
  
  // Mostrar algunos ejemplos
  console.log('--- PRODUCTOS CON IMÁGENES ---');
  withImages.slice(0, 3).forEach(product => {
    console.log(`📦 ${product.name} (${product.slug})`);
    console.log(`   Images: ${JSON.stringify(product.images)}`);
    console.log('');
  });
  
  console.log('--- PRODUCTOS SIN IMÁGENES ---');
  withoutImages.slice(0, 3).forEach(product => {
    console.log(`📦 ${product.name} (${product.slug})`);
    console.log(`   Images: ${JSON.stringify(product.images)}`);
    console.log('');
  });
}

checkProductImages().catch(console.error);