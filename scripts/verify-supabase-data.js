const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('SUPABASE_SERVICE_ROLE:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyData() {
  console.log('🔍 Verificando datos en Supabase...\n');

  try {
    // Verificar productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) {
      console.error('❌ Error al consultar productos:', productsError);
    } else {
      console.log(`✅ Productos encontrados: ${products.length}`);
      products.forEach(product => {
        console.log(`  - ${product.name} (${product.sku}) - $${product.base_price}`);
      });
    }

    // Verificar variantes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*, products(name)')
      .limit(10);

    if (variantsError) {
      console.error('❌ Error al consultar variantes:', variantsError);
    } else {
      console.log(`\n✅ Variantes encontradas: ${variants.length} (mostrando primeras 10)`);
      variants.forEach(variant => {
        console.log(`  - ${variant.products?.name} - Talle ${variant.size} - Color ${variant.color} - Stock: ${variant.stock_quantity}`);
      });
    }

    // Verificar cupones
    const { data: coupons, error: couponsError } = await supabase
      .from('coupons')
      .select('*');

    if (couponsError) {
      console.error('❌ Error al consultar cupones:', couponsError);
    } else {
      console.log(`\n✅ Cupones encontrados: ${coupons.length}`);
      coupons.forEach(coupon => {
        console.log(`  - ${coupon.code} (${coupon.type}) - ${coupon.value}${coupon.type === 'percentage' ? '%' : '$'}`);
      });
    }

    // Verificar configuración de admin
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (profilesError) {
      console.error('❌ Error al consultar perfiles admin:', profilesError);
    } else {
      console.log(`\n✅ Perfiles admin encontrados: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.first_name} ${profile.last_name})`);
      });
    }

    console.log('\n🎉 Verificación completada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verifyData();