#!/usr/bin/env node

/**
 * Script para diagnosticar problemas con la subida de imagen del hero
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkStorageBuckets() {
  console.log('\n🗂️ Verificando buckets de storage...')
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      console.error('❌ Error obteniendo buckets:', error)
      return false
    }
    
    console.log('📋 Buckets disponibles:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.id} (público: ${bucket.public})`)
    })
    
    const imagesBucket = buckets.find(b => b.id === 'images')
    if (!imagesBucket) {
      console.error('❌ Bucket "images" no encontrado')
      return false
    }
    
    console.log('✅ Bucket "images" encontrado')
    return true
  } catch (error) {
    console.error('❌ Error verificando buckets:', error)
    return false
  }
}

async function checkStoragePolicies() {
  console.log('\n🔐 Verificando políticas de storage...')
  
  try {
    // Verificar políticas usando una consulta SQL
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .like('tablename', '%objects%')
    
    if (error) {
      console.warn('⚠️ No se pudieron verificar las políticas directamente')
      console.log('Esto es normal si no tienes permisos de lectura en pg_policies')
    } else {
      console.log('📋 Políticas encontradas:', policies?.length || 0)
    }
    
    return true
  } catch (error) {
    console.warn('⚠️ Error verificando políticas:', error.message)
    return true // No es crítico
  }
}

async function testImageUpload() {
  console.log('\n📸 Probando subida de imagen de prueba...')
  
  try {
    // Crear un archivo de prueba (imagen 1x1 pixel PNG)
    const testImageData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00,
      0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33,
      0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const fileName = `test-hero-${Date.now()}.png`
    const filePath = `home/${fileName}`
    
    console.log(`📁 Subiendo archivo de prueba: ${filePath}`)
    
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, testImageData, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: true
      })
    
    if (error) {
      console.error('❌ Error subiendo imagen de prueba:', error)
      return false
    }
    
    console.log('✅ Imagen de prueba subida exitosamente:', data.path)
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(data.path)
    
    console.log('🔗 URL pública:', publicUrl)
    
    // Verificar que la URL sea accesible
    try {
      const response = await fetch(publicUrl, { method: 'HEAD' })
      if (response.ok) {
        console.log('✅ URL pública accesible')
      } else {
        console.error('❌ URL pública no accesible:', response.status)
      }
    } catch (fetchError) {
      console.error('❌ Error verificando URL:', fetchError.message)
    }
    
    // Limpiar archivo de prueba
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([data.path])
    
    if (deleteError) {
      console.warn('⚠️ No se pudo eliminar archivo de prueba:', deleteError)
    } else {
      console.log('🗑️ Archivo de prueba eliminado')
    }
    
    return true
  } catch (error) {
    console.error('❌ Error en test de subida:', error)
    return false
  }
}

async function checkHomeSections() {
  console.log('\n🏠 Verificando tabla home_sections...')
  
  try {
    const { data: sections, error } = await supabase
      .from('home_sections')
      .select('*')
      .eq('section_type', 'hero')
    
    if (error) {
      console.error('❌ Error consultando home_sections:', error)
      return false
    }
    
    console.log('📋 Secciones hero encontradas:', sections?.length || 0)
    if (sections && sections.length > 0) {
      sections.forEach(section => {
        console.log(`  - ID: ${section.id}, Activa: ${section.is_active}`)
        console.log(`    Imagen: ${section.image_url || 'Sin imagen'}`)
      })
    }
    
    return true
  } catch (error) {
    console.error('❌ Error verificando home_sections:', error)
    return false
  }
}

async function main() {
  console.log('🔍 Diagnóstico de subida de imagen del hero\n')
  
  const checks = [
    { name: 'Storage Buckets', fn: checkStorageBuckets },
    { name: 'Storage Policies', fn: checkStoragePolicies },
    { name: 'Test Image Upload', fn: testImageUpload },
    { name: 'Home Sections', fn: checkHomeSections }
  ]
  
  const results = []
  
  for (const check of checks) {
    console.log(`\n🔄 Ejecutando: ${check.name}`)
    const result = await check.fn()
    results.push({ name: check.name, success: result })
  }
  
  console.log('\n📊 Resumen de diagnóstico:')
  results.forEach(result => {
    const status = result.success ? '✅' : '❌'
    console.log(`${status} ${result.name}`)
  })
  
  const allPassed = results.every(r => r.success)
  
  if (allPassed) {
    console.log('\n🎉 Todos los checks pasaron. El problema podría estar en:')
    console.log('  - Permisos de usuario en el frontend')
    console.log('  - Configuración del cliente Supabase')
    console.log('  - Manejo de errores en la UI')
  } else {
    console.log('\n⚠️ Se encontraron problemas. Revisa los errores arriba.')
  }
  
  console.log('\n💡 Recomendaciones:')
  console.log('  1. Verifica que el usuario esté autenticado en el frontend')
  console.log('  2. Revisa la consola del navegador para errores específicos')
  console.log('  3. Asegúrate de que las migraciones se hayan ejecutado')
  console.log('  4. Verifica las variables de entorno en el frontend')
}

main().catch(console.error)