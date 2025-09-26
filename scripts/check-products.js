const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkProducts() {
  try {
    console.log('Verificando conexión a Supabase...')
    
    // Verificar productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, is_active')
      .limit(5)

    if (productsError) {
      console.error('Error al obtener productos:', productsError)
      return
    }

    console.log(`Productos encontrados: ${products?.length || 0}`)
    if (products && products.length > 0) {
      console.log('Primeros productos:')
      products.forEach(p => console.log(`- ${p.name} (slug: ${p.slug}, activo: ${p.is_active})`))
    }

    // Verificar variantes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, sku, size, color, stock_quantity')
      .limit(5)

    if (variantsError) {
      console.error('Error al obtener variantes:', variantsError)
      return
    }

    console.log(`\nVariantes encontradas: ${variants?.length || 0}`)
    if (variants && variants.length > 0) {
      console.log('Primeras variantes:')
      variants.forEach(v => console.log(`- ${v.sku} (${v.size}/${v.color}, stock: ${v.stock_quantity})`))
    }

  } catch (error) {
    console.error('Error general:', error)
  }
}

checkProducts()