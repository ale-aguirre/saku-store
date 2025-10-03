// Test script to verify product image update functionality
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testProductImageUpdate() {
  try {
    console.log('🔍 Testing product image update functionality...')
    
    // 1. Get the first product
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (fetchError) throw fetchError
    
    if (!products || products.length === 0) {
      console.log('❌ No products found')
      return
    }
    
    const product = products[0]
    console.log(`📦 Found product: ${product.name} (ID: ${product.id})`)
    console.log(`🖼️ Current images:`, product.images)
    
    // 2. Backup current images
    const originalImages = product.images || []
    
    // 3. Test update with new images
    const testImages = [
      'https://via.placeholder.com/300x300/ff0000/ffffff?text=Test1',
      'https://via.placeholder.com/300x300/00ff00/ffffff?text=Test2'
    ]
    
    console.log(`🔄 Updating product with test images:`, testImages)
    
    const { data: updateData, error: updateError } = await supabase
      .from('products')
      .update({
        images: testImages
      })
      .eq('id', product.id)
      .select()
    
    if (updateError) throw updateError
    
    console.log('✅ Update successful:', updateData)
    
    // 4. Verify the update
    const { data: verifyData, error: verifyError } = await supabase
      .from('products')
      .select('images')
      .eq('id', product.id)
      .single()
    
    if (verifyError) throw verifyError
    
    console.log(`🔍 Verified images after update:`, verifyData.images)
    
    // 5. Test the form data structure that the frontend sends
    console.log('\n🧪 Testing frontend form data structure...')
    
    const formDataTest = {
      name: product.name,
      description: product.description,
      base_price: product.base_price,
      category: product.category,
      is_active: product.is_active,
      images: testImages
    }
    
    console.log('📝 Form data that would be sent:', formDataTest)
    
    // 6. Simulate the exact update that the frontend does
    const { data: frontendUpdateData, error: frontendUpdateError } = await supabase
      .from('products')
      .update({
        name: formDataTest.name,
        description: formDataTest.description,
        base_price: formDataTest.base_price,
        category: formDataTest.category,
        is_active: formDataTest.is_active,
        images: formDataTest.images
      })
      .eq('id', product.id)
      .select()
    
    if (frontendUpdateError) throw frontendUpdateError
    
    console.log('✅ Frontend-style update successful:', frontendUpdateData)
    
    // 7. Restore original images
    console.log(`🔄 Restoring original images:`, originalImages)
    
    const { error: restoreError } = await supabase
      .from('products')
      .update({
        images: originalImages
      })
      .eq('id', product.id)
    
    if (restoreError) throw restoreError
    
    console.log('✅ Original images restored successfully')
    
    // 8. Final verification
    const { data: finalData, error: finalError } = await supabase
      .from('products')
      .select('images')
      .eq('id', product.id)
      .single()
    
    if (finalError) throw finalError
    
    console.log(`🔍 Final verification - images:`, finalData.images)
    console.log('✅ Product image update test completed successfully')
    
  } catch (error) {
    console.error('❌ Error during product image update test:', error)
  }
}

testProductImageUpdate()