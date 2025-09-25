// Script simple para configurar admin
// Solo actualiza el perfil existente a rol admin

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  const adminEmail = 'aguirrealexis.cba@gmail.com';
  
  console.log('🔧 Configurando admin para:', adminEmail);
  
  try {
    // 1. Verificar si existe perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error buscando perfil:', profileError.message);
      return;
    }

    if (profile) {
      console.log('✅ Perfil encontrado:', profile.email, 'Rol actual:', profile.role);
      
      if (profile.role !== 'admin') {
        // Actualizar a admin
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', adminEmail);
          
        if (updateError) {
          console.error('❌ Error actualizando rol:', updateError.message);
        } else {
          console.log('✅ Rol actualizado a admin');
        }
      } else {
        console.log('✅ Ya es admin');
      }
    } else {
      console.log('ℹ️ No hay perfil. Se creará automáticamente cuando te registres.');
      console.log('📝 La función handle_new_user() asignará rol admin automáticamente.');
    }

    console.log('\n🎯 INSTRUCCIONES:');
    console.log('1. Ve a: http://localhost:3000/auth/register');
    console.log('2. Registrate con: aguirrealexis.cba@gmail.com');
    console.log('3. Usa cualquier contraseña (ej: Admin123!)');
    console.log('4. Confirma el email si es necesario');
    console.log('5. Luego ve a: http://localhost:3000/admin');
    console.log('\n✨ El sistema te asignará rol admin automáticamente');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupAdmin();