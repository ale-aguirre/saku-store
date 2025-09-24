const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTables() {
  console.log('🔍 Checking table structures...')
  
  try {
    // Check products table
    console.log('\n📦 Products table:')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)

    if (productsError) {
      console.error('❌ Products error:', productsError)
    } else {
      console.log('✅ Products table exists')
      if (products && products.length > 0) {
        console.log('- Columns:', Object.keys(products[0]))
      }
    }

    // Check categories table
    console.log('\n📂 Categories table:')
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(1)

    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError)
    } else {
      console.log('✅ Categories table exists')
      if (categories && categories.length > 0) {
        console.log('- Columns:', Object.keys(categories[0]))
      }
    }

    // Check product_variants table
    console.log('\n🎨 Product variants table:')
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)

    if (variantsError) {
      console.error('❌ Product variants error:', variantsError)
    } else {
      console.log('✅ Product variants table exists')
      if (variants && variants.length > 0) {
        console.log('- Columns:', Object.keys(variants[0]))
      }
    }

  } catch (err) {
    console.error('❌ Exception:', err)
  }
}

checkTables()