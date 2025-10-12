import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixLoryPrice() {
  console.log('🔧 Corrigiendo precio del producto Lory...\n')

  try {
    // Buscar producto Lory
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, slug, base_price')
      .eq('slug', 'lory')
      .single()

    if (fetchError) {
      console.error('❌ Error al buscar producto Lory:', fetchError.message)
      return
    }

    if (!product) {
      console.log('⚠️  Producto Lory no encontrado')
      return
    }

    console.log('📦 Producto Lory encontrado:')
    console.log(`   ID: ${product.id}`)
    console.log(`   Nombre: ${product.name}`)
    console.log(`   Precio actual: ${product.base_price} centavos (${product.base_price / 100} pesos)`)

    // Precio correcto según CSV: $32,490
    const correctPriceInCentavos = 3249000 // $32,490 * 100

    console.log(`\n🎯 Actualizando precio a: ${correctPriceInCentavos} centavos (${correctPriceInCentavos / 100} pesos)`)

    // Actualizar precio
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ base_price: correctPriceInCentavos })
      .eq('id', product.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Error al actualizar precio:', updateError.message)
      return
    }

    console.log('✅ Precio actualizado exitosamente!')
    console.log(`   Precio anterior: ${product.base_price} centavos`)
    console.log(`   Precio nuevo: ${updatedProduct.base_price} centavos`)
    console.log(`   Precio mostrado: $${(updatedProduct.base_price / 100).toLocaleString('es-AR')}`)

  } catch (error) {
    console.error('❌ Error inesperado:', error.message)
  }
}

fixLoryPrice()