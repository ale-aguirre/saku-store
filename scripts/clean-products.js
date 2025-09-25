require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function cleanProducts() {
  console.log('🧹 Limpiando productos...');
  
  // Eliminar todas las variantes primero (por la foreign key)
  const { error: variantsError } = await supabase
    .from('product_variants')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos
    
  if (variantsError) {
    console.error('❌ Error eliminando variantes:', variantsError);
    return;
  }
  
  // Eliminar todos los productos
  const { error: productsError } = await supabase
    .from('products')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Eliminar todos
    
  if (productsError) {
    console.error('❌ Error eliminando productos:', productsError);
    return;
  }
  
  console.log('✅ Productos limpiados exitosamente');
}

cleanProducts().catch(console.error);