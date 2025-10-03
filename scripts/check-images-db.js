const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkImagesInDB() {
  console.log('🔍 Verificando imágenes en la base de datos...')
  
  try {
    // Consultar productos con sus imágenes
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, images')
      .limit(10)
    
    if (error) {
      console.error('❌ Error consultando productos:', error)
      return
    }
    
    console.log('📊 Productos encontrados:', products.length)
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.name} (ID: ${product.id})`)
      console.log('   Imágenes:', product.images)
      console.log('   Tipo de images:', typeof product.images)
      console.log('   Es array:', Array.isArray(product.images))
      if (Array.isArray(product.images)) {
        console.log('   Cantidad de imágenes:', product.images.length)
      }
    })
    
  } catch (error) {
    console.error('💥 Error:', error)
  }
}

checkImagesInDB()