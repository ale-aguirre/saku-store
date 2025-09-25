#!/usr/bin/env node

/**
 * Script para verificar y corregir las imágenes de productos
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

async function fixProductImages() {
  console.log('🖼️ Verificando y corrigiendo imágenes de productos...\n')

  try {
    // 1. Obtener productos actuales
    console.log('📦 Obteniendo productos actuales...')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')

    if (productsError) {
      console.error('❌ Error al obtener productos:', productsError.message)
      return
    }

    console.log(`✅ Productos encontrados: ${products.length}`)
    products.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}`)
      console.log(`     Imágenes actuales: ${product.images ? product.images.join(', ') : 'sin imágenes'}`)
      console.log(`     Categoría: ${product.category}`)
    })

    // 2. Mapeo de imágenes para productos existentes
    const imageAssignments = [
      {
        name: 'Conjunto Encaje Negro',
        images: ['/productos/conjunto-elegance.jpg']
      },
      {
        name: 'Conjunto Satén Rojo',
        images: ['/productos/conjunto-romantic.jpg']
      },
      {
        name: 'Conjunto Algodón Blanco',
        images: ['/productos/brasier-comfort.jpg']
      }
    ]

    // 3. Asignar imágenes
    console.log('\n🔧 Asignando imágenes a productos...')
    
    for (const assignment of imageAssignments) {
      const product = products.find(p => p.name === assignment.name)
      
      if (product) {
        console.log(`\n📝 Asignando imagen a ${product.name}...`)
        console.log(`   De: ${product.images ? product.images.join(', ') : 'sin imágenes'}`)
        console.log(`   A:  ${assignment.images.join(', ')}`)
        
        const { error: updateError } = await supabase
          .from('products')
          .update({ images: assignment.images })
          .eq('id', product.id)

        if (updateError) {
          console.error(`❌ Error al actualizar ${product.name}:`, updateError.message)
        } else {
          console.log(`✅ ${product.name} actualizado correctamente`)
        }
      } else {
        console.log(`⚠️ Producto no encontrado: ${assignment.name}`)
      }
    }

    // 4. Verificar resultados
    console.log('\n🔍 Verificando resultados...')
    const { data: updatedProducts, error: verifyError } = await supabase
      .from('products')
      .select('*')

    if (verifyError) {
      console.error('❌ Error al verificar productos:', verifyError.message)
      return
    }

    console.log('✅ Estado final de productos:')
    updatedProducts.forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.name}`)
      console.log(`     Imágenes: ${product.images ? product.images.join(', ') : 'sin imágenes'}`)
    })

  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message)
  }
}

// Ejecutar corrección
fixProductImages()
  .then(() => {
    console.log('\n✅ Corrección de imágenes de productos completada')
  })
  .catch((error) => {
    console.error('❌ Error en la corrección:', error)
    process.exit(1)
  })