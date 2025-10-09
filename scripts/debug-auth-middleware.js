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

async function debugAuthMiddleware() {
  console.log('🔍 Diagnosticando problema de autenticación en middleware...\n')

  try {
    // 1. Verificar sesión actual
    console.log('1. Verificando sesión actual:')
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.log('❌ Error obteniendo sesión:', sessionError.message)
    } else if (session) {
      console.log('✅ Sesión activa encontrada')
      console.log(`   Usuario: ${session.user.email}`)
      console.log(`   ID: ${session.user.id}`)
      console.log(`   Expira: ${new Date(session.expires_at * 1000).toLocaleString()}`)
    } else {
      console.log('❌ No hay sesión activa')
    }

    // 2. Verificar usuario actual
    console.log('\n2. Verificando usuario actual:')
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.log('❌ Error obteniendo usuario:', userError.message)
    } else if (user) {
      console.log('✅ Usuario autenticado')
      console.log(`   Email: ${user.email}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`)
    } else {
      console.log('❌ No hay usuario autenticado')
    }

    // 3. Verificar perfil del usuario
    if (user) {
      console.log('\n3. Verificando perfil del usuario:')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.log('❌ Error obteniendo perfil:', profileError.message)
        console.log(`   Código: ${profileError.code}`)
      } else if (profile) {
        console.log('✅ Perfil encontrado')
        console.log(`   Nombre: ${profile.first_name || 'No definido'}`)
        console.log(`   Email: ${profile.email}`)
        console.log(`   Rol: ${profile.role}`)
        console.log(`   Creado: ${profile.created_at}`)
      } else {
        console.log('❌ No se encontró perfil')
      }
    }

    // 4. Simular validación del middleware
    console.log('\n4. Simulando validación del middleware:')
    if (!user) {
      console.log('❌ Middleware redirigirá a /auth/login (no hay usuario)')
    } else {
      console.log('✅ Usuario presente, verificando rol...')
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile) {
        console.log('⚠️  No se encontró perfil, middleware permitirá acceso')
      } else if (profile.role === 'admin' || profile.role === 'super_admin') {
        console.log('✅ Rol de admin confirmado, acceso permitido')
      } else {
        console.log('❌ Rol insuficiente, middleware redirigirá a /')
      }
    }

    // 5. Verificar cookies de autenticación
    console.log('\n5. Verificando estado de cookies:')
    console.log('   (Nota: Las cookies solo son visibles en el navegador)')
    console.log('   Verifica en DevTools > Application > Cookies si existen:')
    console.log('   - sb-[project-id]-auth-token')
    console.log('   - sb-[project-id]-auth-token.0')
    console.log('   - sb-[project-id]-auth-token.1')

    // 6. Recomendaciones
    console.log('\n6. Posibles soluciones:')
    console.log('   a) Limpiar cookies del navegador completamente')
    console.log('   b) Cerrar sesión y volver a iniciar sesión')
    console.log('   c) Verificar que el middleware esté usando las mismas variables de entorno')
    console.log('   d) Revisar si hay problemas de CORS o configuración de dominio')

  } catch (error) {
    console.error('❌ Error durante el diagnóstico:', error.message)
  }
}

debugAuthMiddleware()