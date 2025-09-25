const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testLogin() {
  console.log('🔐 Probando login con usuario existente...')
  
  try {
    const testEmail = 'admin@saku.com'
    const testPassword = 'admin123'
    
    // Intentar login
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })

    if (signInError) {
      console.error('❌ Error en login:', signInError.message)
      
      // Si el error es de confirmación, intentar confirmar el usuario
      if (signInError.message.includes('Email not confirmed')) {
        console.log('📧 Intentando confirmar usuario...')
        
        // Obtener el usuario por email usando service role
        const serviceSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE
        )
        
        const { data: users, error: usersError } = await serviceSupabase.auth.admin.listUsers()
        if (usersError) {
          console.error('❌ Error obteniendo usuarios:', usersError.message)
          return
        }
        
        const user = users.users.find(u => u.email === testEmail)
        if (user) {
          console.log('👤 Usuario encontrado:', user.id)
          
          // Confirmar el usuario
          const { data: confirmData, error: confirmError } = await serviceSupabase.auth.admin.updateUserById(
            user.id,
            { email_confirm: true }
          )
          
          if (confirmError) {
            console.error('❌ Error confirmando usuario:', confirmError.message)
            return
          }
          
          console.log('✅ Usuario confirmado exitosamente!')
          
          // Intentar login nuevamente
          const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
          })
          
          if (retryError) {
            console.error('❌ Error en segundo intento de login:', retryError.message)
            return
          }
          
          console.log('✅ Login exitoso después de confirmación!')
          console.log('Usuario:', retrySignIn.user?.email)
          console.log('ID:', retrySignIn.user?.id)
        }
      }
      return
    }
    
    console.log('✅ Login exitoso!')
    console.log('Usuario:', signInData.user?.email)
    console.log('ID:', signInData.user?.id)
    
    // Verificar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single()
      
    if (profileError) {
      console.log('⚠️  Error obteniendo perfil:', profileError.message)
      
      // Crear perfil si no existe
      console.log('🔧 Creando perfil...')
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: signInData.user.id,
          email: signInData.user.email,
          full_name: 'Admin Saku',
          role: 'admin'
        })
        .select()
        .single()
        
      if (createError) {
        console.error('❌ Error creando perfil:', createError.message)
      } else {
        console.log('✅ Perfil creado:', newProfile)
      }
    } else {
      console.log('✅ Perfil encontrado:', profile)
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testLogin()