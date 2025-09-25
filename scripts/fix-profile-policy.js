const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testProfileAccess() {
  console.log('🧪 Probando acceso al perfil después del login...')
  
  try {
    const testClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // 1. Login
    console.log('🔐 Haciendo login...')
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: 'admin@saku.com',
      password: 'admin123'
    })
    
    if (loginError) {
      console.error('❌ Error en login:', loginError.message)
      return
    }
    
    console.log('✅ Login exitoso')
    console.log('  - User ID:', loginData.user.id)
    console.log('  - Email:', loginData.user.email)
    
    // 2. Intentar acceder al perfil
    console.log('\n📋 Intentando acceder al perfil...')
    const { data: profile, error: profileError } = await testClient
      .from('profiles')
      .select('id, email, role')
      .eq('id', loginData.user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Error accediendo al perfil:', profileError.message)
      console.error('   Código:', profileError.code)
      console.error('   Detalles:', profileError.details)
      console.error('   Hint:', profileError.hint)
    } else {
      console.log('✅ Acceso al perfil exitoso:')
      console.log('  - ID:', profile.id)
      console.log('  - Email:', profile.email)
      console.log('  - Rol:', profile.role)
      console.log('  - Es admin:', profile.role === 'admin')
    }
    
    // 3. Verificar token JWT
    console.log('\n🔍 Verificando token JWT...')
    const session = await testClient.auth.getSession()
    if (session.data.session) {
      console.log('✅ Sesión activa encontrada')
      console.log('  - Access token presente:', !!session.data.session.access_token)
      console.log('  - User en sesión:', session.data.session.user.id)
    } else {
      console.log('❌ No hay sesión activa')
    }
    
    // 4. Cerrar sesión
    await testClient.auth.signOut()
    console.log('\n🚪 Sesión cerrada')
    
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testProfileAccess()