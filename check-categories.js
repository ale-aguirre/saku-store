require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkData() {
  try {
    console.log('=== CATEGORÍAS ===');
    const { data: categories, error: catError } = await supabase.from('categories').select('*');
    if (catError) throw catError;
    console.table(categories);
    
    console.log('\n=== PRODUCTOS CON CATEGORÍAS ===');
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, category_id, categories(name, slug)')
      .limit(10);
    if (prodError) throw prodError;
    console.table(products);
    
    console.log('\n=== VERIFICACIÓN DE FILTROS ===');
    // Verificar si el filtro por categoría funciona
    const { data: conjuntos, error: conjError } = await supabase
      .from('products')
      .select('name, categories(name, slug)')
      .eq('categories.slug', 'conjuntos');
    if (conjError) throw conjError;
    console.log('Productos en categoría "conjuntos":', conjuntos);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();