const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function debugImages() {
  console.log('🔍 Verificando imágenes en la base de datos...')
  
  try {
    // Obtener todos los productos con sus imágenes
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, images')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError)
      return
    }
    
    console.log('\n📦 PRODUCTOS Y SUS IMÁGENES:')
    products.forEach(product => {
      console.log(`\n🏷️  ${product.name} (ID: ${product.id})`)
      console.log(`🖼️  Imágenes:`, product.images)
      console.log(`📊 Tipo:`, typeof product.images)
      console.log(`📏 Cantidad:`, Array.isArray(product.images) ? product.images.length : 'No es array')
    })
    
    // Obtener variantes con sus imágenes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, size, color, images')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (variantsError) {
      console.error('❌ Error obteniendo variantes:', variantsError)
      return
    }
    
    console.log('\n🎨 VARIANTES Y SUS IMÁGENES:')
    variants.forEach(variant => {
      console.log(`\n🔖 Variante ${variant.size} - ${variant.color} (ID: ${variant.id})`)
      console.log(`🖼️  Imágenes:`, variant.images)
      console.log(`📊 Tipo:`, typeof variant.images)
      console.log(`📏 Cantidad:`, Array.isArray(variant.images) ? variant.images.length : 'No es array')
    })
    
  } catch (error) {
    console.error('💥 Error general:', error)
  }
}

debugImages()