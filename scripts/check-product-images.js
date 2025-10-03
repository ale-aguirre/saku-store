import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProductImages() {
  console.log('🔍 Verificando imágenes de productos...\n')

  try {
    // Obtener todos los productos con sus imágenes
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug, images, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener productos:', error.message)
      return
    }

    if (!products || products.length === 0) {
      console.log('⚠️  No se encontraron productos')
      return
    }

    console.log(`📦 Productos encontrados: ${products.length}\n`)

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   Slug: ${product.slug}`)
      console.log(`   Imágenes:`, product.images)
      console.log(`   Tipo de imágenes:`, typeof product.images)
      console.log(`   Es array:`, Array.isArray(product.images))
      
      if (Array.isArray(product.images)) {
        console.log(`   Cantidad de imágenes: ${product.images.length}`)
        product.images.forEach((img, imgIndex) => {
          console.log(`     ${imgIndex + 1}: ${img}`)
        })
      } else if (product.images) {
        console.log(`   Imagen (no array): ${product.images}`)
      } else {
        console.log(`   ⚠️  Sin imágenes`)
      }
      
      console.log(`   Creado: ${new Date(product.created_at).toLocaleDateString('es-ES')}`)
      console.log('')
    })

    // Verificar específicamente el producto "lory"
    const loryProduct = products.find(p => p.slug === 'lory')
    if (loryProduct) {
      console.log('🎯 Producto "lory" encontrado:')
      console.log('   Imágenes:', loryProduct.images)
    } else {
      console.log('⚠️  Producto "lory" no encontrado')
      console.log('   Slugs disponibles:', products.map(p => p.slug).join(', '))
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkProductImages()