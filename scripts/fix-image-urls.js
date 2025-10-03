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

async function fixImageUrls() {
  console.log('🔧 Corrigiendo URLs de imágenes...\n')

  try {
    // Obtener el producto lory específicamente
    const { data: loryProduct, error } = await supabase
      .from('products')
      .select('id, name, slug, images')
      .eq('slug', 'lory')
      .single()

    if (error) {
      console.error('❌ Error al obtener producto lory:', error.message)
      return
    }

    if (!loryProduct) {
      console.log('⚠️  Producto lory no encontrado')
      return
    }

    console.log('📦 Producto lory encontrado:')
    console.log('   Imágenes actuales:', JSON.stringify(loryProduct.images, null, 2))

    // Corregir la URL manualmente
    const correctedUrl = 'https://yhddnpcwhmeupwsjkchb.supabase.co/storage/v1/object/public/products/uploads/f376eda9-2eba-4c52-a548-5f1b4ffbf4e3_1759434066753.jpg'
    
    const { error: updateError } = await supabase
      .from('products')
      .update({ images: [correctedUrl] })
      .eq('id', loryProduct.id)

    if (updateError) {
      console.error('❌ Error al actualizar:', updateError.message)
    } else {
      console.log('✅ URL corregida para lory')
      console.log('   Nueva URL:', correctedUrl)
    }

    // Verificar la corrección
    const { data: updatedProduct } = await supabase
      .from('products')
      .select('name, slug, images')
      .eq('slug', 'lory')
      .single()

    if (updatedProduct) {
      console.log('\n🎯 Producto "lory" después de la corrección:')
      console.log('   Imágenes:', updatedProduct.images)
    }

  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

fixImageUrls()