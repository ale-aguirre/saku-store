require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function analyzePrices() {
  console.log('🔍 Analizando precios en la base de datos...\n')

  try {
    // Obtener productos con sus precios
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, base_price, compare_price, active')
      .order('name')

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError)
      return
    }

    console.log(`📦 Total de productos: ${products.length}\n`)

    // Analizar productos
    console.log('=== ANÁLISIS DE PRODUCTOS ===')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.slug})`)
      console.log(`   - Base Price: ${product.base_price} (tipo: ${typeof product.base_price})`)
      console.log(`   - Compare Price: ${product.compare_price} (tipo: ${typeof product.compare_price})`)
      console.log(`   - Activo: ${product.active}`)
      
      // Detectar problemas potenciales
      const issues = []
      if (product.base_price === 0) issues.push('Precio base es 0')
      if (product.base_price > 100000) issues.push('Precio base muy alto (posible error de centavos)')
      if (product.compare_price && product.compare_price <= product.base_price) {
        issues.push('Precio de comparación menor o igual al precio base')
      }
      
      if (issues.length > 0) {
        console.log(`   ⚠️  PROBLEMAS: ${issues.join(', ')}`)
      }
      console.log('')
    })

    // Obtener variantes con sus precios
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id, 
        product_id, 
        size, 
        color, 
        price_adjustment, 
        stock,
        products!inner(name, base_price)
      `)
      .order('product_id')

    if (variantsError) {
      console.error('❌ Error obteniendo variantes:', variantsError)
      return
    }

    console.log(`\n📋 Total de variantes: ${variants.length}\n`)

    // Analizar variantes
    console.log('=== ANÁLISIS DE VARIANTES ===')
    variants.forEach((variant, index) => {
      const finalPrice = variant.products.base_price + (variant.price_adjustment || 0)
      console.log(`${index + 1}. ${variant.products.name} - ${variant.size}/${variant.color}`)
      console.log(`   - Precio base producto: ${variant.products.base_price}`)
      console.log(`   - Ajuste precio: ${variant.price_adjustment || 0}`)
      console.log(`   - Precio final: ${finalPrice}`)
      console.log(`   - Stock: ${variant.stock}`)
      
      // Detectar problemas en variantes
      const issues = []
      if (finalPrice === 0) issues.push('Precio final es 0')
      if (finalPrice > 100000) issues.push('Precio final muy alto (posible error de centavos)')
      if (variant.stock < 0) issues.push('Stock negativo')
      
      if (issues.length > 0) {
        console.log(`   ⚠️  PROBLEMAS: ${issues.join(', ')}`)
      }
      console.log('')
    })

    // Resumen de problemas
    console.log('\n=== RESUMEN DE PROBLEMAS DETECTADOS ===')
    
    const productIssues = products.filter(p => 
      p.base_price === 0 || 
      p.base_price > 100000 || 
      (p.compare_price && p.compare_price <= p.base_price)
    )
    
    const variantIssues = variants.filter(v => {
      const finalPrice = v.products.base_price + (v.price_adjustment || 0)
      return finalPrice === 0 || finalPrice > 100000 || v.stock < 0
    })

    console.log(`📦 Productos con problemas: ${productIssues.length}/${products.length}`)
    console.log(`📋 Variantes con problemas: ${variantIssues.length}/${variants.length}`)

    if (productIssues.length > 0) {
      console.log('\n🚨 PRODUCTOS PROBLEMÁTICOS:')
      productIssues.forEach(p => {
        console.log(`- ${p.name}: base_price=${p.base_price}, compare_price=${p.compare_price}`)
      })
    }

    if (variantIssues.length > 0) {
      console.log('\n🚨 VARIANTES PROBLEMÁTICAS:')
      variantIssues.forEach(v => {
        const finalPrice = v.products.base_price + (v.price_adjustment || 0)
        console.log(`- ${v.products.name} ${v.size}/${v.color}: precio_final=${finalPrice}, stock=${v.stock}`)
      })
    }

  } catch (error) {
    console.error('❌ Error en análisis:', error)
  }
}

analyzePrices()