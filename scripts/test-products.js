const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testProducts() {
  console.log('🔍 Testing products query...')
  
  try {
    const { data: products, error } = await supabase
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
      .eq('is_active', true)

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log(`✅ Found ${products?.length || 0} products`)
    
    if (products && products.length > 0) {
      console.log('\n📦 First product:')
      console.log('- Name:', products[0].name)
      console.log('- Slug:', products[0].slug)
      console.log('- Base price:', products[0].base_price)
      console.log('- Variants:', products[0].product_variants?.length || 0)
      console.log('- Category:', products[0].categories?.name || 'No category')
    }

  } catch (err) {
    console.error('❌ Exception:', err)
  }
}

testProducts()