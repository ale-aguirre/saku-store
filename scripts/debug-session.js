const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function debugSession() {
  console.log('🔍 Verificando estado del usuario admin@saku.com...')
  
  try {
    // 1. Buscar usuario por email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message)
      return
    }
    
    const adminUser = users.users.find(user => user.email === 'admin@saku.com')
    
    if (!adminUser) {
      console.log('❌ Usuario admin@saku.com no encontrado en auth.users')
      console.log('📋 Usuarios existentes:')
      users.users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`)
      })
      return
    }
    
    console.log('👤 Usuario encontrado en auth.users:')
    console.log('  - ID:', adminUser.id)
    console.log('  - Email:', adminUser.email)
    console.log('  - Email confirmado:', adminUser.email_confirmed_at ? 'Sí' : 'No')
    console.log('  - Último login:', adminUser.last_sign_in_at)
    
    // 2. Verificar perfil en public.profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', adminUser.id)
      .single()
    
    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message)
      
      // Listar todos los perfiles
      const { data: allProfiles, error: allError } = await supabase
        .from('profiles')
        .select('*')
      
      if (!allError) {
        console.log('📋 Perfiles existentes:')
        allProfiles.forEach(p => {
          console.log(`  - ${p.email} (ID: ${p.id}, Rol: ${p.role})`)
        })
      }
      return
    }
    
    console.log('\n👤 Perfil en public.profiles:')
    console.log('  - ID:', profile.id)
    console.log('  - Email:', profile.email)
    console.log('  - Nombre:', profile.first_name, profile.last_name)
    console.log('  - Rol:', profile.role)
    console.log('  - Creado:', profile.created_at)
    console.log('  - Actualizado:', profile.updated_at)
    
    // 3. Simular login y verificar sesión
    console.log('\n🔐 Simulando login...')
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    const { data: loginData, error: loginError } = await anonClient.auth.signInWithPassword({
      email: 'admin@saku.com',
      password: 'admin123'
    })
    
    if (loginError) {
      console.error('❌ Error en login:', loginError.message)
      return
    }
    
    console.log('✅ Login exitoso')
    console.log('  - Access token presente:', !!loginData.session?.access_token)
    console.log('  - Refresh token presente:', !!loginData.session?.refresh_token)
    console.log('  - Expira en:', new Date(loginData.session?.expires_at * 1000))
    
    // 4. Verificar perfil con sesión activa
    const { data: sessionProfile, error: sessionError } = await anonClient
      .from('profiles')
      .select('*')
      .eq('id', loginData.user.id)
      .single()
    
    if (sessionError) {
      console.error('❌ Error obteniendo perfil con sesión:', sessionError.message)
    } else {
      console.log('\n✅ Perfil obtenido con sesión activa:')
      console.log('  - Rol:', sessionProfile.role)
      console.log('  - Es admin:', sessionProfile.role === 'admin')
    }
    
    // Cerrar sesión
    await anonClient.auth.signOut()
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

debugSession()