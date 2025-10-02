#!/usr/bin/env node

/**
 * Script de prueba completa para la funcionalidad de subida de imágenes a Supabase Storage
 * Verifica: subida, almacenamiento, visualización y eliminación
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testImageUpload() {
  console.log('🧪 Iniciando prueba completa de subida de imágenes...\n')

  try {
    // 1. Verificar que el bucket existe
    console.log('1️⃣ Verificando bucket "products"...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      throw new Error(`Error al listar buckets: ${bucketsError.message}`)
    }

    const productsBucket = buckets.find(bucket => bucket.name === 'products')
    if (!productsBucket) {
      throw new Error('Bucket "products" no encontrado')
    }
    console.log('✅ Bucket "products" encontrado')

    // 2. Leer archivo de prueba
    console.log('\n2️⃣ Leyendo archivo de prueba...')
    const testImagePath = path.join(__dirname, '..', 'public', 'hero-2.png')
    
    if (!fs.existsSync(testImagePath)) {
      throw new Error(`Archivo de prueba no encontrado: ${testImagePath}`)
    }

    const fileBuffer = fs.readFileSync(testImagePath)
    console.log(`✅ Archivo leído: ${fileBuffer.length} bytes`)

    // 3. Subir imagen
    console.log('\n3️⃣ Subiendo imagen a Supabase Storage...')
    const fileName = `test-upload-${Date.now()}.png`
    const filePath = `test/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, fileBuffer, {
        contentType: 'image/png',
        upsert: false
      })

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`)
    }
    console.log('✅ Imagen subida exitosamente:', uploadData.path)

    // 4. Obtener URL pública
    console.log('\n4️⃣ Obteniendo URL pública...')
    const { data: urlData } = supabase.storage
      .from('products')
      .getPublicUrl(filePath)

    console.log('✅ URL pública generada:', urlData.publicUrl)

    // 5. Verificar que el archivo existe
    console.log('\n5️⃣ Verificando que el archivo existe...')
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('products')
      .download(filePath)

    if (downloadError) {
      throw new Error(`Error al descargar archivo: ${downloadError.message}`)
    }
    console.log('✅ Archivo verificado, tamaño:', fileData.size, 'bytes')

    // 6. Listar archivos en el bucket
    console.log('\n6️⃣ Listando archivos en bucket...')
    const { data: files, error: listError } = await supabase.storage
      .from('products')
      .list('test', {
        limit: 10,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (listError) {
      throw new Error(`Error al listar archivos: ${listError.message}`)
    }
    console.log(`✅ Archivos encontrados: ${files.length}`)
    files.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`)
    })

    // 7. Probar actualización de producto con la nueva imagen
    console.log('\n7️⃣ Probando actualización de producto...')
    
    // Buscar el producto Lory
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, images')
      .eq('slug', 'lory')
      .single()

    if (productsError) {
      throw new Error(`Error al buscar producto: ${productsError.message}`)
    }

    console.log(`✅ Producto encontrado: ${products.name}`)
    console.log(`   Imágenes actuales: ${products.images?.length || 0}`)

    // Agregar la nueva imagen al array
    const currentImages = products.images || []
    const newImages = [...currentImages, urlData.publicUrl]

    const { error: updateError } = await supabase
      .from('products')
      .update({ images: newImages })
      .eq('id', products.id)

    if (updateError) {
      throw new Error(`Error al actualizar producto: ${updateError.message}`)
    }
    console.log('✅ Producto actualizado con nueva imagen')

    // 8. Limpiar - eliminar archivo de prueba
    console.log('\n8️⃣ Limpiando archivo de prueba...')
    const { error: deleteError } = await supabase.storage
      .from('products')
      .remove([filePath])

    if (deleteError) {
      console.warn(`⚠️ Error al eliminar archivo: ${deleteError.message}`)
    } else {
      console.log('✅ Archivo de prueba eliminado')
    }

    // Restaurar imágenes originales del producto
    const { error: restoreError } = await supabase
      .from('products')
      .update({ images: currentImages })
      .eq('id', products.id)

    if (restoreError) {
      console.warn(`⚠️ Error al restaurar imágenes: ${restoreError.message}`)
    } else {
      console.log('✅ Imágenes del producto restauradas')
    }

    console.log('\n🎉 ¡Prueba completa exitosa!')
    console.log('\n📋 Resumen:')
    console.log('   ✅ Bucket verificado')
    console.log('   ✅ Imagen subida correctamente')
    console.log('   ✅ URL pública generada')
    console.log('   ✅ Archivo verificado en Storage')
    console.log('   ✅ Producto actualizado')
    console.log('   ✅ Limpieza completada')

  } catch (error) {
    console.error('\n❌ Error en la prueba:', error.message)
    process.exit(1)
  }
}

// Ejecutar prueba
testImageUpload()