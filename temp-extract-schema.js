import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function extractSchema() {
  try {
    // Obtener un registro de product_variants para ver la estructura
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Error:', error)
      return
    }

    if (data && data.length > 0) {
      console.log('Estructura de product_variants:')
      const variant = data[0]
      Object.keys(variant).forEach(key => {
        const value = variant[key]
        const type = typeof value
        console.log(`  ${key}: ${type} (valor: ${value})`)
      })

      // Verificar específicamente compare_at_price
      const hasCompareAtPrice = 'compare_at_price' in variant
      console.log('\ncompare_at_price encontrado:', hasCompareAtPrice)
      if (hasCompareAtPrice) {
        console.log('Valor actual:', variant.compare_at_price)
      }
    } else {
      console.log('No hay datos en product_variants')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

extractSchema()