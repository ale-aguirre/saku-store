#!/usr/bin/env node

/**
 * Script de corrección masiva de precios
 * Divide todos los precios por 100 para corregir el error de importación
 * 
 * PROBLEMA: Los precios se importaron multiplicados por 100 incorrectamente
 * SOLUCIÓN: Dividir todos los precios por 100
 * 
 * Ejemplo: 1,800,000 → 18,000 (18 mil pesos)
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function fixPricesMassive() {
  console.log('🔧 CORRECCIÓN MASIVA DE PRECIOS')
  console.log('===============================\n')

  try {
    // 1. Analizar productos afectados
    console.log('📊 Analizando productos afectados...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, base_price')
      .gt('base_price', 100000) // Precios mayores a 100k (claramente erróneos)

    if (productsError) {
      console.error('❌ Error obteniendo productos:', productsError)
      return
    }

    console.log(`📦 Productos afectados: ${products.length}`)
    
    // 2. Analizar variantes afectadas
    const { data: variants, error: variantsError } = await supabase
      .from('product_variants')
      .select('id, product_id, price, size, color, products!inner(name)')
      .gt('price', 100000) // Precios mayores a 100k

    if (variantsError) {
      console.error('❌ Error obteniendo variantes:', variantsError)
      return
    }

    console.log(`📋 Variantes afectadas: ${variants.length}`)

    // 3. Mostrar preview de cambios
    console.log('\n🔍 PREVIEW DE CAMBIOS:')
    console.log('=====================')
    
    console.log('\n📦 PRODUCTOS:')
    products.slice(0, 5).forEach(p => {
      const oldPrice = p.base_price
      const newPrice = Math.round(oldPrice / 100)
      console.log(`- ${p.name}: $${oldPrice.toLocaleString()} → $${newPrice.toLocaleString()}`)
    })
    if (products.length > 5) {
      console.log(`... y ${products.length - 5} productos más`)
    }

    console.log('\n📋 VARIANTES:')
    variants.slice(0, 5).forEach(v => {
      const oldPrice = v.price
      const newPrice = Math.round(oldPrice / 100)
      console.log(`- ${v.products.name} ${v.size}/${v.color}: $${oldPrice.toLocaleString()} → $${newPrice.toLocaleString()}`)
    })
    if (variants.length > 5) {
      console.log(`... y ${variants.length - 5} variantes más`)
    }

    // 4. Confirmación
    console.log('\n⚠️  CONFIRMACIÓN REQUERIDA')
    console.log('==========================')
    console.log('Esta operación:')
    console.log(`- Corregirá ${products.length} productos`)
    console.log(`- Corregirá ${variants.length} variantes`)
    console.log('- Dividirá todos los precios por 100')
    console.log('- NO es reversible fácilmente')
    
    console.log('\n⏳ Esperando 5 segundos antes de continuar...')
    console.log('   (Presiona Ctrl+C para cancelar)')
    
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 5. Ejecutar corrección de productos
    console.log('\n🔄 Corrigiendo precios de productos...')
    let productosCorregidos = 0
    
    for (const product of products) {
      const newPrice = Math.round(product.base_price / 100)
      
      const { error } = await supabase
        .from('products')
        .update({ base_price: newPrice })
        .eq('id', product.id)

      if (error) {
        console.error(`❌ Error corrigiendo producto ${product.name}:`, error)
      } else {
        productosCorregidos++
        console.log(`✅ ${product.name}: $${product.base_price.toLocaleString()} → $${newPrice.toLocaleString()}`)
      }
    }

    // 6. Ejecutar corrección de variantes
    console.log('\n🔄 Corrigiendo precios de variantes...')
    let variantesCorregidas = 0
    
    for (const variant of variants) {
      const newPrice = Math.round(variant.price / 100)
      
      const { error } = await supabase
        .from('product_variants')
        .update({ price: newPrice })
        .eq('id', variant.id)

      if (error) {
        console.error(`❌ Error corrigiendo variante:`, error)
      } else {
        variantesCorregidas++
        console.log(`✅ ${variant.products.name} ${variant.size}/${variant.color}: $${variant.price.toLocaleString()} → $${newPrice.toLocaleString()}`)
      }
    }

    // 7. Resumen final
    console.log('\n🎉 CORRECCIÓN COMPLETADA')
    console.log('========================')
    console.log(`✅ Productos corregidos: ${productosCorregidos}/${products.length}`)
    console.log(`✅ Variantes corregidas: ${variantesCorregidas}/${variants.length}`)
    
    if (productosCorregidos === products.length && variantesCorregidas === variants.length) {
      console.log('\n🎯 ¡Todos los precios fueron corregidos exitosamente!')
    } else {
      console.log('\n⚠️  Algunos precios no pudieron ser corregidos. Revisar logs.')
    }

    // 8. Verificación post-corrección
    console.log('\n🔍 Verificando corrección...')
    const { data: remainingProducts } = await supabase
      .from('products')
      .select('id, name, base_price')
      .gt('base_price', 100000)

    const { data: remainingVariants } = await supabase
      .from('product_variants')
      .select('id, price')
      .gt('price', 100000)

    console.log(`📦 Productos con precios altos restantes: ${remainingProducts?.length || 0}`)
    console.log(`📋 Variantes con precios altos restantes: ${remainingVariants?.length || 0}`)

    if ((remainingProducts?.length || 0) === 0 && (remainingVariants?.length || 0) === 0) {
      console.log('\n✅ ¡Verificación exitosa! No quedan precios erróneos.')
    }

  } catch (error) {
    console.error('❌ Error durante la corrección:', error)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  fixPricesMassive()
}

module.exports = { fixPricesMassive }