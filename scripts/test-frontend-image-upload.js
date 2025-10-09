#!/usr/bin/env node

/**
 * Script para probar la subida de imágenes desde el frontend
 * Simula el comportamiento del cliente Supabase en el navegador
 */

import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Configuración:')
console.log(`URL: ${supabaseUrl ? '✅' : '❌'}`)
console.log(`Anon Key: ${supabaseAnonKey ? '✅' : '❌'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

// Crear cliente como en el frontend (anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testFrontendImageUpload() {
  try {
    console.log('\n🧪 Ejecutando: Frontend Image Upload Test')
    
    // 1. Verificar autenticación
    console.log('\n📋 Verificando autenticación...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError.message)
      return
    }
    
    if (!user) {
      console.log('⚠️ Usuario no autenticado')
      
      // Intentar autenticar con admin
      console.log('🔐 Intentando autenticar con admin...')
      const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
        email: 'admin@saku.com',
        password: 'admin123'
      })
      
      if (loginError) {
        console.error('❌ Error de login:', loginError.message)
        return
      }
      
      console.log('✅ Autenticado como:', authData.user?.email)
    } else {
      console.log('✅ Usuario autenticado:', user.email)
    }
    
    // 2. Crear archivo de prueba simulando FormData
    console.log('\n📁 Creando archivo de prueba...')
    const testImagePath = join(__dirname, '..', 'public', 'hero-1.webp')
    const fileBuffer = readFileSync(testImagePath)
    const fileName = `test-frontend-${Date.now()}.webp`
    const filePath = `home/${fileName}`
    
    console.log(`📄 Archivo: ${fileName}`)
    console.log(`📍 Path: ${filePath}`)
    console.log(`📏 Tamaño: ${fileBuffer.length} bytes`)
    
    // 3. Subir archivo usando el cliente anon (como en frontend)
    console.log('\n⬆️ Subiendo archivo...')
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, fileBuffer, {
        contentType: 'image/webp',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Error de subida:', uploadError.message)
      console.error('❌ Detalles:', JSON.stringify(uploadError, null, 2))
      return
    }
    
    console.log('✅ Archivo subido:', uploadData.path)
    
    // 4. Obtener URL pública
    console.log('\n🔗 Obteniendo URL pública...')
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(uploadData.path)
    
    console.log('✅ URL pública:', urlData.publicUrl)
    
    // 5. Verificar acceso a la URL
    console.log('\n🌐 Verificando acceso a URL...')
    try {
      const response = await fetch(urlData.publicUrl)
      if (response.ok) {
        console.log('✅ URL accesible')
      } else {
        console.log(`⚠️ URL no accesible: ${response.status} ${response.statusText}`)
      }
    } catch (fetchError) {
      console.log('❌ Error verificando URL:', fetchError.message)
    }
    
    // 6. Limpiar archivo de prueba
    console.log('\n🗑️ Limpiando archivo de prueba...')
    const { error: deleteError } = await supabase.storage
      .from('images')
      .remove([uploadData.path])
    
    if (deleteError) {
      console.log('⚠️ Error eliminando archivo:', deleteError.message)
    } else {
      console.log('✅ Archivo eliminado')
    }
    
    console.log('\n🎉 Test completado exitosamente')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    console.error('❌ Stack:', error.stack)
  }
}

// Ejecutar test
testFrontendImageUpload()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })