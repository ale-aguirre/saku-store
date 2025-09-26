const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugPDP() {
  try {
    console.log('🔍 Debug completo de la página de detalle del producto')
    console.log('================================================\n')
    
    // 1. Verificar variables de entorno
    console.log('1. Variables de entorno:')
    console.log(`   - SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'OK' : 'MISSING'}`)
    console.log(`   - SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'OK' : 'MISSING'}`)
    console.log('')
    
    // 2. Probar conexión a Supabase
    console.log('2. Probando conexión a Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.log(`   ❌ Error de conexión: ${testError.message}`)
      return
    } else {
      console.log('   ✅ Conexión exitosa')
    }
    console.log('')
    
    // 3. Verificar producto específico
    const slug = 'print'
    console.log(`3. Verificando producto con slug "${slug}":`)
    
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          sku,
          size,
          color,
          material,
          price_adjustment,
          stock_quantity,
          low_stock_threshold,
          is_active
        ),
        categories (
          id,
          name,
          slug
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (productError) {
      console.log(`   ❌ Error obteniendo producto: ${productError.message}`)
      return
    }
    
    if (!product) {
      console.log('   ❌ Producto no encontrado')
      return
    }
    
    console.log('   ✅ Producto encontrado:')
    console.log(`      - ID: ${product.id}`)
    console.log(`      - Nombre: ${product.name}`)
    console.log(`      - Slug: ${product.slug}`)
    console.log(`      - Precio base: ${product.base_price}`)
    console.log(`      - Descripción: ${product.description ? 'Sí' : 'No'}`)
    console.log(`      - Imágenes: ${product.images ? product.images.length : 0}`)
    console.log(`      - Variantes: ${product.product_variants ? product.product_variants.length : 0}`)
    console.log(`      - Categoría: ${product.categories ? product.categories.name : 'Sin categoría'}`)
    console.log('')
    
    // 4. Verificar variantes
    if (product.product_variants && product.product_variants.length > 0) {
      console.log('4. Variantes del producto:')
      product.product_variants.forEach((variant, index) => {
        console.log(`   ${index + 1}. ${variant.sku}`)
        console.log(`      - Talle: ${variant.size}`)
        console.log(`      - Color: ${variant.color}`)
        console.log(`      - Stock: ${variant.stock_quantity}`)
        console.log(`      - Activa: ${variant.is_active}`)
        console.log(`      - Ajuste precio: ${variant.price_adjustment}`)
      })
    } else {
      console.log('4. ❌ No hay variantes para este producto')
    }
    console.log('')
    
    // 5. Simular procesamiento como en getProductBySlug
    console.log('5. Simulando procesamiento de getProductBySlug:')
    
    const variants = (product.product_variants || []).map((variant) => ({
      ...variant,
      is_in_stock: variant.stock_quantity > 0,
      is_low_stock: variant.stock_quantity <= variant.low_stock_threshold && variant.stock_quantity > 0
    }))
    
    const availableSizes = [...new Set(variants.filter(v => v.is_active).map(v => v.size))]
    const availableColors = [...new Set(variants.filter(v => v.is_active).map(v => v.color))]
    
    const priceRange = variants.reduce(
      (range, variant) => {
        const price = product.base_price + (variant.price_adjustment || 0)
        return {
          min: Math.min(range.min, price),
          max: Math.max(range.max, price)
        }
      },
      { min: Infinity, max: -Infinity }
    )
    
    const totalStock = variants.reduce((sum, variant) => sum + variant.stock_quantity, 0)
    
    console.log(`   - Talles disponibles: [${availableSizes.join(', ')}]`)
    console.log(`   - Colores disponibles: [${availableColors.join(', ')}]`)
    console.log(`   - Rango de precios: $${priceRange.min} - $${priceRange.max}`)
    console.log(`   - Stock total: ${totalStock}`)
    console.log('')
    
    console.log('✅ Debug completado exitosamente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

debugPDP()