#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkLoryProduct() {
  try {
    console.log('🔍 Verificando producto Lory en Supabase...\n')
    
    // Buscar producto por slug 'lory'
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          sku,
          size,
          color,
          material,
          price_adjustment,
          stock_quantity,
          low_stock_threshold,
          is_active
        )
      `)
      .eq('slug', 'lory')
      .single()

    if (error) {
      console.error('❌ Error:', error)
      return
    }

    if (!product) {
      console.log('❌ Producto Lory no encontrado')
      return
    }

    console.log('📦 Producto Lory encontrado:\n')
    console.log(`   ID: ${product.id}`)
    console.log(`   Nombre: ${product.name}`)
    console.log(`   Slug: ${product.slug}`)
    console.log(`   Descripción: ${product.description}`)
    console.log(`   Precio base: ${product.base_price}`)
    console.log(`   Precio comparación: ${product.compare_at_price}`)
    console.log(`   Activo: ${product.is_active}`)
    console.log(`   Imagen URL: ${product.image_url || 'NO DEFINIDA'}`)
    console.log(`   Imágenes: ${product.images ? JSON.stringify(product.images, null, 2) : 'NO DEFINIDAS'}`)
    console.log(`   Creado: ${new Date(product.created_at).toLocaleDateString('es-AR')}`)
    console.log('')

    console.log('🎨 Variantes:')
    if (product.product_variants && product.product_variants.length > 0) {
      product.product_variants.forEach((variant, index) => {
        console.log(`   ${index + 1}. Talle: ${variant.size}, Color: ${variant.color}`)
        console.log(`      Stock: ${variant.stock_quantity}`)
        console.log(`      Ajuste precio: ${variant.price_adjustment}`)
        console.log(`      Activo: ${variant.is_active}`)
        console.log('')
      })
    } else {
      console.log('   No hay variantes definidas')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkLoryProduct()