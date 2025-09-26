#!/usr/bin/env node

/**
 * Script de corrección selectiva de precios
 * Permite corregir productos específicos manualmente
 */

require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

// MAPEO MANUAL DE CORRECCIONES
// Formato: { id_producto: nuevo_precio_correcto }
const PRODUCT_CORRECTIONS = {
  // Ejemplo: si un producto tiene ID específico y precio erróneo
  // 'uuid-del-producto': 18000, // Corregir de 1,800,000 a 18,000
}

// MAPEO MANUAL DE CORRECCIONES DE VARIANTES
const VARIANT_CORRECTIONS = {
  // Ejemplo: { id_variante: nuevo_precio_correcto }
  // 'uuid-de-variante': 15000, // Corregir de 1,500,000 a 15,000
}

async function listProblemsForManualReview() {
  console.log('🔍 ANÁLISIS PARA CORRECCIÓN MANUAL')
  console.log('==================================\n')

  // Obtener productos con precios problemáticos
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, base_price, slug')
    .gt('base_price', 100000)
    .order('base_price', { ascending: false })

  if (productsError) {
    console.error('❌ Error obteniendo productos:', productsError)
    return
  }

  // Obtener variantes con precios problemáticos
  const { data: variants, error: variantsError } = await supabase
    .from('product_variants')
    .select(`
      id, 
      product_id, 
      price, 
      size, 
      color,
      products!inner(name, slug)
    `)
    .gt('price', 100000)
    .order('price', { ascending: false })

  if (variantsError) {
    console.error('❌ Error obteniendo variantes:', variantsError)
    return
  }

  console.log('📦 PRODUCTOS CON PRECIOS PROBLEMÁTICOS:')
  console.log('======================================')
  products.forEach((p, index) => {
    const suggestedPrice = Math.round(p.base_price / 100)
    console.log(`${index + 1}. ${p.name}`)
    console.log(`   ID: ${p.id}`)
    console.log(`   Precio actual: $${p.base_price.toLocaleString()}`)
    console.log(`   Precio sugerido: $${suggestedPrice.toLocaleString()}`)
    console.log(`   Slug: ${p.slug}`)
    console.log('')
  })

  console.log('📋 VARIANTES CON PRECIOS PROBLEMÁTICOS:')
  console.log('======================================')
  variants.forEach((v, index) => {
    const suggestedPrice = Math.round(v.price / 100)
    console.log(`${index + 1}. ${v.products.name} - ${v.size}/${v.color}`)
    console.log(`   ID: ${v.id}`)
    console.log(`   Precio actual: $${v.price.toLocaleString()}`)
    console.log(`   Precio sugerido: $${suggestedPrice.toLocaleString()}`)
    console.log('')
  })

  console.log('📝 INSTRUCCIONES PARA CORRECCIÓN MANUAL:')
  console.log('========================================')
  console.log('1. Revisa la lista anterior')
  console.log('2. Edita este archivo (fix-prices-selective.js)')
  console.log('3. Agrega las correcciones en PRODUCT_CORRECTIONS y VARIANT_CORRECTIONS')
  console.log('4. Ejecuta: node scripts/fix-prices-selective.js --apply')
  console.log('')
  console.log('Ejemplo de corrección:')
  console.log('const PRODUCT_CORRECTIONS = {')
  console.log(`  '${products[0]?.id}': ${Math.round((products[0]?.base_price || 0) / 100)},`)
  console.log('}')
  console.log('')
  console.log('const VARIANT_CORRECTIONS = {')
  console.log(`  '${variants[0]?.id}': ${Math.round((variants[0]?.price || 0) / 100)},`)
  console.log('}')

  return { products, variants }
}

async function applySelectiveCorrections() {
  console.log('🔧 APLICANDO CORRECCIONES SELECTIVAS')
  console.log('====================================\n')

  const productIds = Object.keys(PRODUCT_CORRECTIONS)
  const variantIds = Object.keys(VARIANT_CORRECTIONS)

  if (productIds.length === 0 && variantIds.length === 0) {
    console.log('⚠️  No hay correcciones definidas.')
    console.log('   Ejecuta sin --apply primero para ver los productos problemáticos.')
    return
  }

  console.log(`📦 Productos a corregir: ${productIds.length}`)
  console.log(`📋 Variantes a corregir: ${variantIds.length}`)

  // Corregir productos
  let productosCorregidos = 0
  for (const productId of productIds) {
    const newPrice = PRODUCT_CORRECTIONS[productId]
    
    // Obtener info del producto
    const { data: product } = await supabase
      .from('products')
      .select('name, base_price')
      .eq('id', productId)
      .single()

    if (!product) {
      console.log(`❌ Producto no encontrado: ${productId}`)
      continue
    }

    // Aplicar corrección
    const { error } = await supabase
      .from('products')
      .update({ base_price: newPrice })
      .eq('id', productId)

    if (error) {
      console.error(`❌ Error corrigiendo producto ${product.name}:`, error)
    } else {
      productosCorregidos++
      console.log(`✅ ${product.name}: $${product.base_price.toLocaleString()} → $${newPrice.toLocaleString()}`)
    }
  }

  // Corregir variantes
  let variantesCorregidas = 0
  for (const variantId of variantIds) {
    const newPrice = VARIANT_CORRECTIONS[variantId]
    
    // Obtener info de la variante
    const { data: variant } = await supabase
      .from('product_variants')
      .select(`
        price, 
        size, 
        color,
        products!inner(name)
      `)
      .eq('id', variantId)
      .single()

    if (!variant) {
      console.log(`❌ Variante no encontrada: ${variantId}`)
      continue
    }

    // Aplicar corrección
    const { error } = await supabase
      .from('product_variants')
      .update({ price: newPrice })
      .eq('id', variantId)

    if (error) {
      console.error(`❌ Error corrigiendo variante:`, error)
    } else {
      variantesCorregidas++
      console.log(`✅ ${variant.products.name} ${variant.size}/${variant.color}: $${variant.price.toLocaleString()} → $${newPrice.toLocaleString()}`)
    }
  }

  console.log('\n🎉 CORRECCIÓN SELECTIVA COMPLETADA')
  console.log('==================================')
  console.log(`✅ Productos corregidos: ${productosCorregidos}/${productIds.length}`)
  console.log(`✅ Variantes corregidas: ${variantesCorregidas}/${variantIds.length}`)
}

async function main() {
  const args = process.argv.slice(2)
  const shouldApply = args.includes('--apply')

  if (shouldApply) {
    await applySelectiveCorrections()
  } else {
    await listProblemsForManualReview()
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = { 
  listProblemsForManualReview, 
  applySelectiveCorrections,
  PRODUCT_CORRECTIONS,
  VARIANT_CORRECTIONS
}