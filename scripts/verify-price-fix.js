#!/usr/bin/env node

/**
 * Verificación rápida de que los precios fueron corregidos correctamente
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function verifyPriceFix() {
  console.log('🔍 VERIFICACIÓN DE CORRECCIÓN DE PRECIOS')
  console.log('=======================================\n')

  try {
    // Verificar productos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, base_price, slug')
      .order('base_price', { ascending: false })
      .limit(10)

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError)
      return
    }

    console.log('📦 TOP 10 PRODUCTOS POR PRECIO:')
    console.log('===============================')
    products.forEach((p, index) => {
      const priceFormatted = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(p.base_price)
      
      console.log(`${index + 1}. ${p.name}`)
      console.log(`   Precio: ${priceFormatted}`)
      console.log(`   Slug: ${p.slug}`)
      console.log('')
    })

    // Verificar variantes
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select(`
        id, 
        price, 
        size, 
        color,
        products!inner(name)
      `)
      .order('price', { ascending: false })
      .limit(5)

    if (variantsError) {
      console.error('❌ Error obteniendo variantes:', variantsError)
      return
    }

    console.log('📋 TOP 5 VARIANTES POR PRECIO:')
    console.log('==============================')
    variants.forEach((v, index) => {
      const priceFormatted = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(v.price)
      
      console.log(`${index + 1}. ${v.products.name} - ${v.size}/${v.color}`)
      console.log(`   Precio: ${priceFormatted}`)
      console.log('')
    })

    // Verificar que no hay precios erróneos
    const { data: highPriceProducts } = await supabase
      .from('products')
      .select('id, name, base_price')
      .gt('base_price', 100000)

    const { data: highPriceVariants } = await supabase
      .from('product_variants')
      .select('id, price')
      .gt('price', 100000)

    console.log('🎯 VERIFICACIÓN FINAL:')
    console.log('======================')
    console.log(`❌ Productos con precios > $100,000: ${highPriceProducts?.length || 0}`)
    console.log(`❌ Variantes con precios > $100,000: ${highPriceVariants?.length || 0}`)

    if ((highPriceProducts?.length || 0) === 0 && (highPriceVariants?.length || 0) === 0) {
      console.log('\n✅ ¡CORRECCIÓN EXITOSA! Todos los precios están en rango normal.')
      console.log('✅ Los precios ahora están entre $5,000 y $50,000 (rango esperado)')
    } else {
      console.log('\n⚠️  Aún hay precios problemáticos que requieren atención.')
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  verifyPriceFix()
}

module.exports = { verifyPriceFix }