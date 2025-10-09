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

async function resetAuthSession() {
  console.log('🔄 Reseteando sesión de autenticación...\n')

  try {
    // 1. Cerrar sesión global
    console.log('1. Cerrando sesión global...')
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' })
    
    if (signOutError) {
      console.log('⚠️  Error cerrando sesión global:', signOutError.message)
    } else {
      console.log('✅ Sesión global cerrada')
    }

    // 2. Verificar que no hay sesión
    console.log('\n2. Verificando estado de sesión...')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      console.log('⚠️  Aún hay una sesión activa')
    } else {
      console.log('✅ No hay sesión activa')
    }

    // 3. Intentar autenticar con el usuario admin
    console.log('\n3. Intentando autenticar con usuario admin...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@saku.com',
      password: 'admin123'
    })

    if (authError) {
      console.log('❌ Error autenticando:', authError.message)
    } else if (authData.session) {
      console.log('✅ Autenticación exitosa')
      console.log(`   Usuario: ${authData.user.email}`)
      console.log(`   ID: ${authData.user.id}`)
      
      // 4. Verificar perfil
      console.log('\n4. Verificando perfil del usuario...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (profileError) {
        console.log('❌ Error obteniendo perfil:', profileError.message)
      } else if (profile) {
        console.log('✅ Perfil encontrado')
        console.log(`   Rol: ${profile.role}`)
        console.log(`   Nombre: ${profile.first_name || 'No definido'}`)
      }
    }

    console.log('\n🎯 Instrucciones para el navegador:')
    console.log('1. Abre DevTools (F12)')
    console.log('2. Ve a Application > Storage')
    console.log('3. Limpia todo el Local Storage')
    console.log('4. Limpia todas las Cookies')
    console.log('5. Recarga la página (Ctrl+F5)')
    console.log('6. Intenta iniciar sesión nuevamente')

  } catch (error) {
    console.error('❌ Error durante el reset:', error.message)
  }
}

resetAuthSession()