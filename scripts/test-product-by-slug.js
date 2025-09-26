const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testProductBySlug(slug) {
  try {
    console.log(`Probando getProductBySlug con slug: "${slug}"`)
    
    const { data, error } = await supabase
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

    if (error) {
      console.error('Error:', error)
      return
    }

    if (!data) {
      console.log('No se encontró producto')
      return
    }

    console.log('Producto encontrado:')
    console.log(`- ID: ${data.id}`)
    console.log(`- Nombre: ${data.name}`)
    console.log(`- Slug: ${data.slug}`)
    console.log(`- Precio base: ${data.base_price}`)
    console.log(`- Variantes: ${data.product_variants?.length || 0}`)
    
    if (data.product_variants && data.product_variants.length > 0) {
      console.log('Primeras variantes:')
      data.product_variants.slice(0, 3).forEach(v => {
        console.log(`  - ${v.sku} (${v.size}/${v.color}, stock: ${v.stock_quantity})`)
      })
    }

  } catch (error) {
    console.error('Error general:', error)
  }
}

// Probar con diferentes slugs
async function runTests() {
  await testProductBySlug('print')
  console.log('\n---\n')
  await testProductBySlug('amore')
  console.log('\n---\n')
  await testProductBySlug('jess')
}

runTests()