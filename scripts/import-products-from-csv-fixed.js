#!/usr/bin/env node

/**
 * Script de importación de productos desde CSV (VERSIÓN CORREGIDA)
 * 
 * CORRECCIÓN: No multiplica por 100 los precios, ya que están en pesos completos
 * FORMATO CSV: "18,000.00" = 18 mil pesos (no centavos)
 */

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

// FUNCIÓN CORREGIDA: No multiplica por 100
function priceToInteger(priceString) {
  if (!priceString || priceString === '') return 0
  
  // Remover símbolos de moneda, espacios y comas (separadores de miles)
  const cleanPrice = priceString
    .toString()
    .replace(/[$\s]/g, '') // Remover $ y espacios
    .replace(/,/g, '') // Remover comas (separadores de miles)
  
  const price = parseFloat(cleanPrice)
  
  // NO multiplicar por 100 - los precios ya están en pesos completos
  return Math.round(price)
}

function generateSKU(productName, size, color) {
  const cleanName = productName
    .replace(/[^a-zA-Z0-9]/g, '')
    .substring(0, 4)
    .toUpperCase()
  
  const sizeCode = size ? size.toString().substring(0, 3).toUpperCase() : 'STD'
  const colorCode = color ? color.substring(0, 3).toUpperCase() : 'DEF'
  
  return `${cleanName}-${sizeCode}-${colorCode}`
}

async function clearExistingData() {
  console.log('🗑️  Limpiando datos existentes...')
  
  // Eliminar en orden correcto (por foreign keys)
  await supabase.from('product_variants').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  console.log('✅ Datos existentes eliminados')
}

async function importProductsFromCSV() {
  console.log('📦 IMPORTACIÓN DE PRODUCTOS (VERSIÓN CORREGIDA)')
  console.log('===============================================\n')

  const csvPath = path.join(__dirname, '..', 'data', 'productos_exportados.csv')
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ Archivo CSV no encontrado: ${csvPath}`)
    return
  }

  console.log(`📄 Leyendo CSV: ${csvPath}`)

  const products = new Map()
  const errors = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const productName = row['Nombre del producto']?.trim()
          const variantName = row['Nombre de la variante']?.trim()
          const price = row['Precio']?.trim()
          const comparePrice = row['Precio de comparación']?.trim()
          const sku = row['SKU de la variante']?.trim()
          const stock = row['Inventario disponible']?.trim()
          const images = row['Src de la imagen']?.trim()

          if (!productName) return

          // Extraer talle y color del nombre de la variante
          let size = 'Único'
          let color = 'Negro'

          if (variantName && variantName !== productName) {
            const parts = variantName.split(' / ')
            if (parts.length >= 2) {
              size = parts[0].trim()
              color = parts[1].trim()
            }
          }

          // Procesar precios con función corregida
          const basePrice = priceToInteger(price)
          const basePriceCompare = comparePrice ? priceToInteger(comparePrice) : null

          console.log(`📊 Procesando: ${productName} - ${size}/${color}`)
          console.log(`   Precio original: "${price}" → ${basePrice}`)
          if (comparePrice) {
            console.log(`   Precio comparación: "${comparePrice}" → ${basePriceCompare}`)
          }

          if (!products.has(productName)) {
            products.set(productName, {
              name: productName,
              description: `Lencería ${productName}`,
              base_price: basePrice,
              compare_price: basePriceCompare,
              category: 'Lencería',
              brand: 'Sakú',
              is_active: true,
              is_featured: false,
              images: images ? [images] : [],
              variants: []
            })
          }

          const product = products.get(productName)
          
          product.variants.push({
            size,
            color,
            sku: sku || generateSKU(productName, size, color),
            price: basePrice,
            stock_quantity: parseInt(stock) || 0,
            is_active: true,
            images: images ? [images] : []
          })

        } catch (error) {
          errors.push({ row, error: error.message })
          console.error(`❌ Error procesando fila:`, error.message)
        }
      })
      .on('end', async () => {
        try {
          console.log(`\n📊 RESUMEN DE PROCESAMIENTO:`)
          console.log(`- Productos únicos: ${products.size}`)
          console.log(`- Errores: ${errors.length}`)

          // Mostrar preview de precios
          console.log('\n🔍 PREVIEW DE PRECIOS CORREGIDOS:')
          Array.from(products.values()).slice(0, 5).forEach(p => {
            console.log(`- ${p.name}: $${p.base_price.toLocaleString()}`)
            p.variants.slice(0, 2).forEach(v => {
              console.log(`  └─ ${v.size}/${v.color}: $${v.price.toLocaleString()}`)
            })
          })

          console.log('\n⚠️  ¿Continuar con la importación? (5 segundos para cancelar)')
          await new Promise(resolve => setTimeout(resolve, 5000))

          // Limpiar datos existentes
          await clearExistingData()

          // Importar productos
          console.log('\n📦 Importando productos...')
          let productosImportados = 0
          let variantesImportadas = 0

          for (const [productName, productData] of products) {
            try {
              // Insertar producto
              const { data: insertedProduct, error: productError } = await supabase
                .from('products')
                .insert({
                  name: productData.name,
                  description: productData.description,
                  sku: generateSKU(productData.name),
                  base_price: productData.base_price,
                  category: productData.category,
                  brand: productData.brand,
                  is_active: productData.is_active,
                  is_featured: productData.is_featured,
                  images: productData.images,
                  slug: productData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
                })
                .select()
                .single()

              if (productError) {
                console.error(`❌ Error insertando producto ${productName}:`, productError)
                continue
              }

              productosImportados++
              console.log(`✅ Producto: ${productName} ($${productData.base_price.toLocaleString()})`)

              // Insertar variantes
              for (const variant of productData.variants) {
                const { error: variantError } = await supabase
                  .from('product_variants')
                  .insert({
                    product_id: insertedProduct.id,
                    size: variant.size,
                    color: variant.color,
                    sku: variant.sku,
                    price: variant.price,
                    stock_quantity: variant.stock_quantity,
                    is_active: variant.is_active,
                    images: variant.images
                  })

                if (variantError) {
                  console.error(`❌ Error insertando variante:`, variantError)
                } else {
                  variantesImportadas++
                  console.log(`  └─ ${variant.size}/${variant.color}: $${variant.price.toLocaleString()}`)
                }
              }

            } catch (error) {
              console.error(`❌ Error procesando producto ${productName}:`, error)
            }
          }

          console.log('\n🎉 IMPORTACIÓN COMPLETADA')
          console.log('=========================')
          console.log(`✅ Productos importados: ${productosImportados}`)
          console.log(`✅ Variantes importadas: ${variantesImportadas}`)
          console.log(`❌ Errores: ${errors.length}`)

          resolve()

        } catch (error) {
          console.error('❌ Error durante la importación:', error)
          reject(error)
        }
      })
      .on('error', reject)
  })
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  importProductsFromCSV()
}

module.exports = { importProductsFromCSV }