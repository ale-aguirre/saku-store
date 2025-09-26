const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function checkProducts() {
  // Buscar productos con diferentes variaciones
  const searches = ['monaco', 'mónaco', 'm%naco', 'M%naco'];
  
  for (const search of searches) {
    console.log(`\n=== Buscando: "${search}" ===`);
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .ilike('name', `%${search}%`);
    
    if (error) {
      console.error('Error:', error);
      continue;
    }
    
    if (data.length === 0) {
      console.log('No se encontraron productos');
      continue;
    }
    
    data.forEach(product => {
      console.log(`ID: ${product.id}, Name: '${product.name}'`);
      // Mostrar cada carácter para detectar problemas de codificación
      const chars = product.name.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' ');
      console.log('Caracteres:', chars);
      console.log('---');
    });
  }
  
  // También buscar todos los productos para ver si hay problemas generales
  console.log('\n=== Primeros 5 productos (muestra general) ===');
  const { data: allProducts, error: allError } = await supabase
    .from('products')
    .select('id, name')
    .limit(5);
    
  if (!allError && allProducts) {
    allProducts.forEach(product => {
      console.log(`ID: ${product.id}, Name: '${product.name}'`);
      const chars = product.name.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(' ');
      console.log('Caracteres:', chars);
      console.log('---');
    });
  }
}

checkProducts().catch(console.error);