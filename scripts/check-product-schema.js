require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function checkProductSchema() {
  console.log('🔍 Verificando esquema de productos...\n')

  try {
    // Obtener un producto para ver su estructura
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError)
      return
    }

    if (products.length > 0) {
      console.log('📦 Estructura de la tabla products:')
      console.log(JSON.stringify(products[0], null, 2))
    }

    // Obtener todos los productos con sus precios
    const { data: allProducts, error: allError } = await supabase
      .from('products')
      .select('id, name, slug, base_price, is_active')
      .order('name')

    if (allError) {
      console.error('❌ Error obteniendo todos los productos:', allError)
      return
    }

    console.log(`\n📊 Total de productos: ${allProducts.length}`)
    console.log('\n=== ANÁLISIS DE PRECIOS ===')
    
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   - Slug: ${product.slug}`)
      console.log(`   - Base Price: ${product.base_price} (${typeof product.base_price})`)
      console.log(`   - Activo: ${product.is_active}`)
      
      // Detectar problemas
      const issues = []
      if (product.base_price === 0 || product.base_price === null) {
        issues.push('Precio es 0 o null')
      }
      if (product.base_price > 100000) {
        issues.push('Precio muy alto (posible error de centavos)')
      }
      if (product.base_price < 100 && product.base_price > 0) {
        issues.push('Precio muy bajo (posible error de formato)')
      }
      
      if (issues.length > 0) {
        console.log(`   🚨 PROBLEMAS: ${issues.join(', ')}`)
      }
      console.log('')
    })

    // Obtener variantes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)

    if (variantsError) {
      console.error('❌ Error obteniendo variantes:', variantsError)
      return
    }

    if (variants.length > 0) {
      console.log('\n📋 Estructura de la tabla product_variants:')
      console.log(JSON.stringify(variants[0], null, 2))
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkProductSchema()