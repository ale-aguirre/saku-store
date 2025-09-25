// Script para crear acceso de administrador
// Ejecutar con: node scripts/create-admin-access.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminAccess() {
  const adminEmail = 'aguirrealexis.cba@gmail.com';
  const tempPassword = 'Admin123!'; // Contraseña temporal
  
  console.log('🔧 Creando acceso de administrador...');
  
  try {
    // 1. Primero verificar si el usuario ya existe
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError.message);
      return;
    }

    const existingUser = existingUsers.users.find(user => user.email === adminEmail);
    
    if (existingUser) {
      console.log('✅ Usuario ya existe, actualizando contraseña...');
      
      // Actualizar contraseña del usuario existente
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { 
          password: tempPassword,
          email_confirm: true
        }
      );
      
      if (updateError) {
        console.error('❌ Error actualizando contraseña:', updateError.message);
        return;
      }
      
      console.log('✅ Contraseña actualizada');
    } else {
      console.log('🆕 Creando nuevo usuario...');
      
      // Crear usuario nuevo
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: tempPassword,
        email_confirm: true, // Auto-confirmar email
        user_metadata: {
          first_name: 'Ale',
          last_name: 'Admin'
        }
      });

      if (authError) {
        console.error('❌ Error creando usuario:', authError.message);
        return;
      }
      
      console.log('✅ Usuario creado en Supabase Auth');
    }

    // 2. Verificar que el perfil tiene rol de admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();

    if (profileError) {
      console.log('ℹ️ Perfil no existe, se creará automáticamente en el primer login');
    } else {
      console.log('✅ Perfil encontrado:', profile);
      
      if (profile.role !== 'admin') {
        // Actualizar rol a admin
        const { error: updateRoleError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', adminEmail);
          
        if (updateRoleError) {
          console.error('❌ Error actualizando rol:', updateRoleError.message);
        } else {
          console.log('✅ Rol actualizado a admin');
        }
      }
    }

    console.log('\n🎉 ¡Acceso de administrador configurado!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Contraseña temporal:', tempPassword);
    console.log('🌐 Login en: http://localhost:3000/auth/login');
    console.log('\n⚠️ IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

createAdminAccess();