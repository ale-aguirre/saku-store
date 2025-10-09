require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseState() {
  console.log('🔍 Verificando estado completo de la base de datos...\n');

  try {
    // 1. Verificar productos
    console.log('📦 PRODUCTOS:');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, is_active, created_at')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('❌ Error consultando productos:', productsError);
    } else {
      console.log(`   Total productos: ${products.length}`);
      products.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.slug}) - ${product.is_active ? 'Activo' : 'Inactivo'}`);
      });
    }

    // 2. Verificar categorías
    console.log('\n🏷️ CATEGORÍAS:');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, slug, is_active, created_at')
      .order('created_at', { ascending: false });

    if (categoriesError) {
      console.error('❌ Error consultando categorías:', categoriesError);
    } else {
      console.log(`   Total categorías: ${categories.length}`);
      categories.forEach((category, index) => {
        console.log(`   ${index + 1}. ${category.name} (${category.slug}) - ${category.is_active ? 'Activo' : 'Inactivo'}`);
      });
    }

    // 3. Verificar variantes de productos (usando stock_quantity)
    console.log('\n🎨 VARIANTES DE PRODUCTOS:');
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, size, color, stock_quantity, created_at')
      .order('created_at', { ascending: false });

    if (variantsError) {
      console.error('❌ Error consultando variantes:', variantsError);
    } else {
      console.log(`   Total variantes: ${variants.length}`);
      variants.forEach((variant, index) => {
        console.log(`   ${index + 1}. Producto ${variant.product_id} - ${variant.size}/${variant.color} - Stock: ${variant.stock_quantity || 'N/A'}`);
      });
    }

    // 4. Verificar secciones del home (sin columna content)
    console.log('\n🏠 SECCIONES DEL HOME:');
    const { data: homeSections, error: homeSectionsError } = await supabase
      .from('home_sections')
      .select('id, section_type, title, subtitle, image_url, is_active, created_at')
      .order('created_at', { ascending: false });

    if (homeSectionsError) {
      console.error('❌ Error consultando secciones del home:', homeSectionsError);
    } else {
      console.log(`   Total secciones: ${homeSections.length}`);
      homeSections.forEach((section, index) => {
        console.log(`   ${index + 1}. ${section.section_type} - ${section.title || 'Sin título'} - ${section.is_active ? 'Activo' : 'Inactivo'}`);
        if (section.image_url) {
          console.log(`      Imagen: ${section.image_url}`);
        }
        if (section.subtitle) {
          console.log(`      Subtítulo: ${section.subtitle}`);
        }
      });
    }

    // 5. Verificar usuarios admin (usando profiles)
    console.log('\n👤 USUARIOS ADMIN:');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('❌ Error consultando usuarios admin:', usersError);
    } else {
      console.log(`   Total usuarios admin: ${users.length}`);
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} - ${user.role}`);
      });
    }

    console.log('\n✅ Verificación completa de la base de datos finalizada');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkDatabaseState();