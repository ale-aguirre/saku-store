require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminUser() {
  try {
    console.log('🔍 Verificando usuarios admin...')
    
    // Buscar usuarios con rol admin
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
    
    if (profilesError) {
      console.error('❌ Error al buscar perfiles admin:', profilesError)
      return
    }
    
    console.log(`📊 Usuarios admin encontrados: ${profiles?.length || 0}`)
    
    if (profiles && profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`👤 Admin: ${profile.email || profile.id} (ID: ${profile.id})`)
      })
    } else {
      console.log('⚠️  No se encontraron usuarios admin')
      console.log('💡 Creando usuario admin de prueba...')
      
      // Crear usuario admin de prueba
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@saku.com',
        password: 'admin123',
        email_confirm: true
      })
      
      if (authError) {
        console.error('❌ Error al crear usuario admin:', authError)
        return
      }
      
      console.log('✅ Usuario admin creado:', authData.user.email)
      
      // Actualizar el perfil para que sea admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', authData.user.id)
      
      if (updateError) {
        console.error('❌ Error al actualizar rol admin:', updateError)
        return
      }
      
      console.log('✅ Rol admin asignado correctamente')
    }
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

checkAdminUser()