#!/usr/bin/env node

/**
 * Script para verificar la estructura de la tabla products
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkProductsSchema() {
  console.log('🔍 Verificando estructura de la tabla products...\n')

  try {
    // Obtener información de las columnas de la tabla products
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: 'products' })
      .single()

    if (error) {
      console.log('⚠️ No se pudo obtener información de columnas con RPC, intentando consulta directa...')
      
      // Intentar obtener un producto para ver su estructura
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .limit(1)

      if (productsError) {
        console.error('❌ Error al obtener productos:', productsError.message)
        return
      }

      if (products && products.length > 0) {
        console.log('✅ Estructura del producto (columnas disponibles):')
        const columns = Object.keys(products[0])
        columns.forEach((column, index) => {
          console.log(`  ${index + 1}. ${column}: ${typeof products[0][column]} (${products[0][column]})`)
        })
      } else {
        console.log('⚠️ No hay productos en la tabla')
      }
    } else {
      console.log('✅ Información de columnas obtenida:', data)
    }

    // También verificar la tabla product_images
    console.log('\n🖼️ Verificando tabla product_images...')
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .limit(5)

    if (imagesError) {
      console.error('❌ Error al obtener product_images:', imagesError.message)
    } else {
      console.log(`✅ Imágenes encontradas: ${images.length}`)
      if (images.length > 0) {
        console.log('Estructura de product_images:')
        const imageColumns = Object.keys(images[0])
        imageColumns.forEach((column, index) => {
          console.log(`  ${index + 1}. ${column}`)
        })
      }
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message)
  }
}

// Ejecutar verificación
checkProductsSchema()
  .then(() => {
    console.log('\n✅ Verificación de esquema completada')
  })
  .catch((error) => {
    console.error('❌ Error en la verificación:', error)
    process.exit(1)
  })