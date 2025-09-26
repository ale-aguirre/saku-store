const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

async function fixSpecialChars() {
  console.log('🔍 Buscando productos con caracteres especiales problemáticos...');
  
  // Buscar productos que contengan el carácter de reemplazo Unicode (�)
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name')
    .like('name', '%�%');
  
  if (error) {
    console.error('❌ Error al buscar productos:', error);
    return;
  }
  
  if (products.length === 0) {
    console.log('✅ No se encontraron productos con caracteres problemáticos');
    return;
  }
  
  console.log(`📋 Encontrados ${products.length} productos con caracteres problemáticos:`);
  
  const fixes = [];
  
  products.forEach(product => {
    console.log(`\n🔧 Producto: ${product.name}`);
    
    // Mapeo de correcciones conocidas
    let fixedName = product.name;
    
    // Corregir M�naco -> Mónaco
    if (fixedName.includes('M�naco')) {
      fixedName = fixedName.replace(/M�naco/g, 'Mónaco');
      console.log(`   ✏️  Corrección: ${product.name} -> ${fixedName}`);
      fixes.push({ id: product.id, oldName: product.name, newName: fixedName });
    }
    
    // Agregar más correcciones según sea necesario
    // Ejemplo: fixedName = fixedName.replace(/cami�n/g, 'camión');
  });
  
  if (fixes.length === 0) {
    console.log('ℹ️  No se encontraron correcciones aplicables');
    return;
  }
  
  console.log(`\n🚀 Aplicando ${fixes.length} correcciones...`);
  
  for (const fix of fixes) {
    const { error: updateError } = await supabase
      .from('products')
      .update({ name: fix.newName })
      .eq('id', fix.id);
    
    if (updateError) {
      console.error(`❌ Error al actualizar ${fix.id}:`, updateError);
    } else {
      console.log(`✅ Actualizado: "${fix.oldName}" -> "${fix.newName}"`);
    }
  }
  
  console.log('\n🎉 Proceso completado');
}

fixSpecialChars().catch(console.error);