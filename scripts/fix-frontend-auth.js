#!/usr/bin/env node

/**
 * Script para verificar y corregir la autenticación en el frontend
 */

import { config } from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Cargar variables de entorno
config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔧 Verificando configuración de autenticación frontend...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes')
  process.exit(1)
}

// Crear cliente como en el frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

async function fixFrontendAuth() {
  try {
    console.log('\n🔍 Paso 1: Verificando estado actual de autenticación...')
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('❌ Error obteniendo sesión:', sessionError.message)
    }
    
    if (session) {
      console.log('✅ Sesión existente encontrada para:', session.user.email)
      console.log('🕒 Expira:', new Date(session.expires_at * 1000).toLocaleString())
    } else {
      console.log('⚠️ No hay sesión activa')
    }
    
    console.log('\n🔐 Paso 2: Intentando autenticación...')
    
    // Limpiar sesión existente
    await supabase.auth.signOut()
    console.log('🧹 Sesión limpiada')
    
    // Autenticar con admin
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@saku.com',
      password: 'admin123'
    })
    
    if (authError) {
      console.error('❌ Error de autenticación:', authError.message)
      return false
    }
    
    console.log('✅ Autenticación exitosa')
    console.log('👤 Usuario:', authData.user.email)
    console.log('🔑 Rol:', authData.user.user_metadata?.role || 'No definido')
    
    console.log('\n🧪 Paso 3: Probando subida de imagen...')
    
    // Crear un archivo de prueba pequeño
    const testContent = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]) // PNG header
    const fileName = `test-auth-${Date.now()}.png`
    const filePath = `home/${fileName}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, testContent, {
        contentType: 'image/png',
        upsert: true
      })
    
    if (uploadError) {
      console.error('❌ Error de subida:', uploadError.message)
      console.error('❌ Código:', uploadError.statusCode)
      
      // Verificar políticas específicas
      if (uploadError.message.includes('policy')) {
        console.log('\n🔍 Verificando políticas de storage...')
        
        // Intentar listar archivos para verificar permisos
        const { data: listData, error: listError } = await supabase.storage
          .from('images')
          .list('home', { limit: 1 })
        
        if (listError) {
          console.error('❌ Error listando archivos:', listError.message)
        } else {
          console.log('✅ Permisos de lectura OK')
        }
      }
      
      return false
    }
    
    console.log('✅ Subida exitosa:', uploadData.path)
    
    // Limpiar archivo de prueba
    await supabase.storage.from('images').remove([uploadData.path])
    console.log('🗑️ Archivo de prueba eliminado')
    
    console.log('\n🎉 Autenticación frontend corregida exitosamente')
    
    console.log('\n📋 Instrucciones para el usuario:')
    console.log('1. Abre el navegador en http://localhost:3000/auth/login')
    console.log('2. Ingresa: admin@saku.com / admin123')
    console.log('3. Ve a /admin/contenido-home')
    console.log('4. Intenta subir una imagen del hero')
    
    return true
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
    return false
  }
}

// Ejecutar fix
fixFrontendAuth()
  .then((success) => {
    if (success) {
      console.log('\n✅ Fix completado exitosamente')
      process.exit(0)
    } else {
      console.log('\n❌ Fix falló')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
  })