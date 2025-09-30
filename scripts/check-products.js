const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProducts() {
  try {
    console.log('🔍 Verificando productos en Supabase...\n')
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, base_price, sku, is_active, created_at')
      .limit(5)

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    console.log(`📦 Productos encontrados: ${products.length}\n`)
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   ID: ${product.id}`)
      console.log(`   SKU: ${product.sku}`)
      console.log(`   Base Price: ${product.base_price}`)
      console.log(`   Activo: ${product.is_active}`)
      console.log(`   Creado: ${new Date(product.created_at).toLocaleDateString('es-AR')}`)
      console.log('')
    })

    // Verificar estructura de tabla
    console.log('🔍 Verificando estructura de tabla products...\n')
    
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .single()

    if (columnsError) {
      console.log('⚠️  No se pudo obtener estructura de tabla (función no existe)')
    } else {
      console.log('📋 Columnas de la tabla products:', columns)
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkProducts()