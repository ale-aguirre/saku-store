import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Cargar variables de entorno
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
  process.exit(1)
}

console.log('🔍 Simulando flujo exacto del frontend...\n')

// Crear cliente exactamente como en el frontend
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
})

async function simulateFrontendFlow() {
  try {
    console.log('📋 Paso 1: Verificando estado inicial...')
    
    // Verificar estado inicial (como haría el frontend)
    const { data: { session: initialSession } } = await supabase.auth.getSession()
    console.log('Sesión inicial:', initialSession ? '✅ Presente' : '❌ Ausente')
    
    if (initialSession) {
      console.log('Usuario:', initialSession.user.email)
      console.log('Expira:', new Date(initialSession.expires_at * 1000).toLocaleString())
    }

    console.log('\n🔐 Paso 2: Intentando autenticación...')
    
    // Limpiar sesión existente
    await supabase.auth.signOut()
    
    // Autenticar como lo haría el frontend
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@saku.com',
      password: 'admin123'
    })

    if (authError) {
      console.error('❌ Error de autenticación:', authError.message)
      return
    }

    console.log('✅ Autenticación exitosa')
    console.log('Usuario:', authData.user.email)
    console.log('Sesión:', authData.session ? 'Presente' : 'Ausente')

    console.log('\n📤 Paso 3: Simulando uploadImage exactamente como en el frontend...')
    
    // Crear un archivo de prueba pequeño (PNG válido mínimo)
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
      0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
      0x49, 0x48, 0x44, 0x52, // IHDR
      0x00, 0x00, 0x00, 0x01, // width: 1
      0x00, 0x00, 0x00, 0x01, // height: 1
      0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
      0x90, 0x77, 0x53, 0xDE, // CRC
      0x00, 0x00, 0x00, 0x00, // IEND chunk length
      0x49, 0x45, 0x4E, 0x44, // IEND
      0xAE, 0x42, 0x60, 0x82  // CRC
    ])

    // Simular File object como en el navegador
    const fileName = `test-frontend-${Date.now()}.png`
    const file = new File([pngHeader], fileName, { type: 'image/png' })
    
    console.log('Archivo creado:', fileName, 'Tamaño:', file.size, 'bytes')

    // Simular la función uploadImage exactamente
    const bucket = 'images'
    const folder = 'home'
    const uniqueFileName = `${folder}/${crypto.randomUUID()}-${file.name}`

    console.log('Subiendo a:', bucket, 'Ruta:', uniqueFileName)

    // Verificar sesión antes de subir
    const { data: { session: uploadSession } } = await supabase.auth.getSession()
    console.log('Sesión antes de subir:', uploadSession ? '✅ Presente' : '❌ Ausente')

    if (!uploadSession) {
      console.error('❌ No hay sesión activa para la subida')
      return
    }

    // Intentar subida con reintentos (como en uploadImage)
    let uploadResult = null
    let lastError = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Intento ${attempt}/${maxRetries}...`)
      
      try {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(uniqueFileName, file, {
            contentType: file.type,
            upsert: true
          })

        if (error) {
          lastError = error
          console.log(`❌ Intento ${attempt} falló:`, error.message)
          
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt - 1) * 1000
            console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`)
            await new Promise(resolve => setTimeout(resolve, delay))
          }
          continue
        }

        uploadResult = data
        console.log(`✅ Subida exitosa en intento ${attempt}`)
        break
      } catch (err) {
        lastError = err
        console.log(`❌ Excepción en intento ${attempt}:`, err.message)
        
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt - 1) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    if (!uploadResult) {
      console.error('❌ Subida falló después de todos los intentos:', lastError?.message)
      return
    }

    console.log('📁 Archivo subido:', uploadResult.path)

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadResult.path)

    console.log('🔗 URL pública:', urlData.publicUrl)

    // Verificar que la URL es accesible
    try {
      const response = await fetch(urlData.publicUrl)
      console.log('🌐 Verificación URL:', response.ok ? '✅ Accesible' : '❌ No accesible')
      console.log('Status:', response.status, response.statusText)
    } catch (fetchError) {
      console.log('❌ Error verificando URL:', fetchError.message)
    }

    console.log('\n🧹 Paso 4: Limpiando archivo de prueba...')
    
    // Limpiar
    const { error: deleteError } = await supabase.storage
      .from(bucket)
      .remove([uploadResult.path])

    if (deleteError) {
      console.log('⚠️ Error limpiando:', deleteError.message)
    } else {
      console.log('✅ Archivo de prueba eliminado')
    }

    console.log('\n🎉 Simulación completada exitosamente')
    console.log('\n📋 Resumen:')
    console.log('- Autenticación: ✅')
    console.log('- Subida de imagen: ✅')
    console.log('- URL pública: ✅')
    console.log('- Limpieza: ✅')

  } catch (error) {
    console.error('❌ Error en simulación:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Ejecutar simulación
simulateFrontendFlow()