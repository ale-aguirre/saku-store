const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

async function updateUserRole() {
  console.log('🔧 Actualizando rol de usuario a admin...')
  
  try {
    const testEmail = 'admin@saku.com'
    
    // Buscar el usuario por email
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single()
      
    if (findError) {
      console.error('❌ Error buscando usuario:', findError.message)
      return
    }
    
    console.log('👤 Usuario encontrado:', profile)
    
    // Actualizar el rol a admin
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profile.id)
      .select()
      .single()
      
    if (updateError) {
      console.error('❌ Error actualizando rol:', updateError.message)
      return
    }
    
    console.log('✅ Rol actualizado exitosamente!')
    console.log('Perfil actualizado:', updatedProfile)
    
    // Verificar que el cambio se aplicó
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single()
      
    if (verifyError) {
      console.error('❌ Error verificando cambio:', verifyError.message)
      return
    }
    
    console.log('🔍 Verificación final:', verifyProfile)
    
    if (verifyProfile.role === 'admin') {
      console.log('✅ El usuario ahora tiene rol de admin y puede acceder al panel!')
    } else {
      console.log('❌ El rol no se actualizó correctamente')
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

updateUserRole()