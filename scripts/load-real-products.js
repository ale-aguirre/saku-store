const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
);

// Productos reales basados en las imágenes disponibles
const realProducts = [
  {
    name: "Body Agatha",
    slug: "body-agatha",
    sku: "BODY-AGATHA",
    description: "Body elegante con encaje delicado, perfecto para ocasiones especiales. Diseño sofisticado que realza la figura femenina.",
    price: 15900,
    category_slug: "corpinos", // Bodies van en corpiños
    images: ["/productos/body_agatha.jpg"],
    variants: [
      // Bodies requieren talle
      { size: "85", color: "negro", stock: 5, sku: "BODY-AGATHA-85-NEG" },
      { size: "90", color: "negro", stock: 8, sku: "BODY-AGATHA-90-NEG" },
      { size: "95", color: "negro", stock: 6, sku: "BODY-AGATHA-95-NEG" },
      { size: "100", color: "negro", stock: 4, sku: "BODY-AGATHA-100-NEG" }
    ]
  },
  {
    name: "Bombacha Picco",
    slug: "bombacha-picco",
    sku: "BOMBACHA-PICCO",
    description: "Bombacha clásica con terminaciones delicadas. Comodidad y estilo en una sola prenda.",
    price: 4900,
    category_slug: "bombachas",
    images: ["/productos/bombacha_picco.webp"],
    variants: [
      // Bombachas no requieren talle específico
      { size: "UNICO", color: "negro", stock: 12, sku: "BOMB-PICCO-NEG" },
      { size: "UNICO", color: "rojo", stock: 8, sku: "BOMB-PICCO-ROJ" },
      { size: "UNICO", color: "blanco", stock: 10, sku: "BOMB-PICCO-BLA" }
    ]
  },
  {
    name: "Brasier Comfort",
    slug: "brasier-comfort",
    sku: "BRASIER-COMFORT",
    description: "Brasier de uso diario con máximo confort. Diseño sin aros para comodidad todo el día.",
    price: 12900,
    category_slug: "corpinos",
    images: ["/productos/brasier-comfort.jpg"],
    variants: [
      // Brasiers requieren talle
      { size: "85", color: "negro", stock: 6, sku: "BRAS-COMF-85-NEG" },
      { size: "85", color: "blanco", stock: 4, sku: "BRAS-COMF-85-BLA" },
      { size: "90", color: "negro", stock: 8, sku: "BRAS-COMF-90-NEG" },
      { size: "90", color: "blanco", stock: 6, sku: "BRAS-COMF-90-BLA" },
      { size: "95", color: "negro", stock: 5, sku: "BRAS-COMF-95-NEG" },
      { size: "95", color: "blanco", stock: 3, sku: "BRAS-COMF-95-BLA" },
      { size: "100", color: "negro", stock: 4, sku: "BRAS-COMF-100-NEG" },
      { size: "100", color: "blanco", stock: 2, sku: "BRAS-COMF-100-BLA" }
    ]
  },
  {
    name: "Brasier Push-up",
    slug: "brasier-pushup",
    sku: "BRASIER-PUSHUP",
    description: "Brasier push-up que realza y define el busto. Ideal para looks que requieren mayor volumen.",
    price: 16900,
    category_slug: "corpinos",
    images: ["/productos/brasier-pushup.jpg"],
    variants: [
      // Brasiers requieren talle
      { size: "85", color: "negro", stock: 7, sku: "BRAS-PUSH-85-NEG" },
      { size: "85", color: "rojo", stock: 5, sku: "BRAS-PUSH-85-ROJ" },
      { size: "90", color: "negro", stock: 9, sku: "BRAS-PUSH-90-NEG" },
      { size: "90", color: "rojo", stock: 6, sku: "BRAS-PUSH-90-ROJ" },
      { size: "95", color: "negro", stock: 6, sku: "BRAS-PUSH-95-NEG" },
      { size: "95", color: "rojo", stock: 4, sku: "BRAS-PUSH-95-ROJ" },
      { size: "100", color: "negro", stock: 3, sku: "BRAS-PUSH-100-NEG" },
      { size: "100", color: "rojo", stock: 2, sku: "BRAS-PUSH-100-ROJ" }
    ]
  },
  {
    name: "Conjunto Praga",
    slug: "conjunto-praga",
    sku: "CONJUNTO-PRAGA",
    description: "Conjunto de encaje con detalles únicos. Brasier y bombacha a juego para un look completo y elegante.",
    price: 24900,
    category_slug: "conjuntos",
    images: ["/productos/conjunto_praga.jpg"],
    variants: [
      // Conjuntos requieren talle
      { size: "85", color: "negro", stock: 4, sku: "CONJ-PRAGA-85-NEG" },
      { size: "85", color: "rojo", stock: 3, sku: "CONJ-PRAGA-85-ROJ" },
      { size: "90", color: "negro", stock: 6, sku: "CONJ-PRAGA-90-NEG" },
      { size: "90", color: "rojo", stock: 4, sku: "CONJ-PRAGA-90-ROJ" },
      { size: "95", color: "negro", stock: 5, sku: "CONJ-PRAGA-95-NEG" },
      { size: "95", color: "rojo", stock: 3, sku: "CONJ-PRAGA-95-ROJ" },
      { size: "100", color: "negro", stock: 2, sku: "CONJ-PRAGA-100-NEG" },
      { size: "100", color: "rojo", stock: 1, sku: "CONJ-PRAGA-100-ROJ" }
    ]
  },
  {
    name: "Liguero Sienna",
    slug: "liguero-sienna",
    sku: "LIGUERO-SIENNA",
    description: "Liguero sensual con detalles de encaje. Perfecto para ocasiones especiales y looks íntimos.",
    price: 8900,
    category_slug: "bombachas", // Ligueros van en bombachas por ahora
    images: ["/productos/liguero_sienna.jpg"],
    variants: [
      // Ligueros no requieren talle específico
      { size: "UNICO", color: "negro", stock: 8, sku: "LIG-SIENNA-NEG" },
      { size: "UNICO", color: "rojo", stock: 5, sku: "LIG-SIENNA-ROJ" },
      { size: "UNICO", color: "blanco", stock: 6, sku: "LIG-SIENNA-BLA" }
    ]
  }
];

async function loadRealProducts() {
  console.log('🚀 Cargando productos reales...');
  
  try {
    // Obtener categorías
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, slug');
      
    if (categoriesError) {
      console.error('Error obteniendo categorías:', categoriesError);
      return;
    }
    
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
    
    console.log('📂 Categorías mapeadas:', categoryMap);
    
    // Cargar cada producto
    for (const productData of realProducts) {
      console.log(`\n📦 Cargando producto: ${productData.name}`);
      
      const categoryId = categoryMap[productData.category_slug];
      if (!categoryId) {
        console.error(`❌ Categoría no encontrada: ${productData.category_slug}`);
        continue;
      }
      
      // Insertar producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: productData.name,
          slug: productData.slug,
          sku: productData.sku,
          description: productData.description,
          base_price: productData.price / 100,
          category_id: categoryId,
          images: productData.images,
          is_active: true,
          is_featured: false
        })
        .select()
        .single();
        
      if (productError) {
        console.error(`❌ Error insertando producto ${productData.name}:`, productError);
        continue;
      }
      
      console.log(`✅ Producto creado: ${product.name} (ID: ${product.id})`);
      
      // Insertar variantes
      const variantInserts = productData.variants.map(variant => ({
        product_id: product.id,
        size: variant.size,
        color: variant.color,
        stock_quantity: variant.stock,
        sku: variant.sku,
        price_adjustment: 0, // Sin ajuste de precio por ahora
        is_active: true
      }));
      
      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantInserts);
        
      if (variantsError) {
        console.error(`❌ Error insertando variantes para ${productData.name}:`, variantsError);
        continue;
      }
      
      console.log(`✅ ${variantInserts.length} variantes creadas para ${product.name}`);
    }
    
    console.log('\n🎉 ¡Productos reales cargados exitosamente!');
    
    // Verificar productos cargados
    const { data: loadedProducts, error: verifyError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name, slug),
        product_variants(*)
      `)
      .order('created_at');
      
    if (verifyError) {
      console.error('Error verificando productos:', verifyError);
      return;
    }
    
    console.log('\n📋 Resumen de productos cargados:');
    loadedProducts.forEach((product, index) => {
      const variantCount = product.product_variants?.length || 0;
      const totalStock = product.product_variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
      console.log(`${index + 1}. ${product.name} - ${product.category?.name} - ${variantCount} variantes - Stock total: ${totalStock}`);
    });
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

loadRealProducts();