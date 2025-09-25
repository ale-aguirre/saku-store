// Script para diagnosticar el problema de registro
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

async function debugAuthIssue() {
  console.log('🔍 Diagnosticando problema de autenticación...\n');
  
  try {
    // 1. Verificar que las funciones existen
    console.log('📋 Verificando funciones en la base de datos...');
    
    const { data: functions, error: funcError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_schema')
      .eq('routine_schema', 'public')
      .in('routine_name', ['handle_new_user', 'set_admin_role_for_email']);

    if (funcError) {
      console.error('❌ Error verificando funciones:', funcError.message);
    } else {
      console.log('✅ Funciones encontradas:', functions);
    }

    // 2. Verificar triggers
    console.log('\n🎯 Verificando triggers...');
    
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_object_table, action_statement')
      .eq('trigger_name', 'on_auth_user_created');

    if (triggerError) {
      console.error('❌ Error verificando triggers:', triggerError.message);
    } else {
      console.log('✅ Triggers encontrados:', triggers);
    }

    // 3. Verificar usuarios existentes en auth
    console.log('\n👥 Verificando usuarios en auth...');
    
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error listando usuarios:', authError.message);
    } else {
      console.log(`📊 Usuarios en auth: ${authUsers.users.length}`);
      authUsers.users.forEach(user => {
        console.log(`  - ${user.email} (${user.id})`);
      });
    }

    // 4. Verificar perfiles existentes
    console.log('\n👤 Verificando perfiles...');
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('❌ Error listando perfiles:', profileError.message);
    } else {
      console.log(`📊 Perfiles en DB: ${profiles.length}`);
      profiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.role})`);
      });
    }

    // 5. Intentar crear usuario directamente con Admin API
    console.log('\n🔧 Intentando crear usuario con Admin API...');
    
    const testEmail = 'aguirrealexis.cba@gmail.com';
    
    // Primero eliminar si existe
    const existingUsers = authUsers.users.filter(u => u.email === testEmail);
    if (existingUsers.length > 0) {
      console.log('🗑️  Eliminando usuario existente...');
      for (const user of existingUsers) {
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.log(`⚠️  Error eliminando usuario ${user.id}:`, deleteError.message);
        } else {
          console.log(`✅ Usuario ${user.id} eliminado`);
        }
      }
    }

    // Eliminar perfil si existe
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('email', testEmail);

    if (deleteProfileError) {
      console.log('⚠️  Error eliminando perfil:', deleteProfileError.message);
    } else {
      console.log('✅ Perfil eliminado (si existía)');
    }

    // Crear usuario nuevo
    console.log('\n🆕 Creando usuario nuevo...');
    
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'User'
      }
    });

    if (createError) {
      console.error('❌ Error creando usuario:', createError.message);
      
      // Si falla, intentar con signUp normal
      console.log('\n🔄 Intentando con signUp normal...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'Admin123!',
        options: {
          data: {
            first_name: 'Admin',
            last_name: 'User'
          }
        }
      });

      if (signUpError) {
        console.error('❌ Error con signUp:', signUpError.message);
      } else {
        console.log('✅ SignUp exitoso:', signUpData.user?.email);
      }
    } else {
      console.log('✅ Usuario creado:', newUser.user.email);
    }

    // 6. Verificar si se creó el perfil automáticamente
    console.log('\n🔍 Verificando si se creó el perfil...');
    
    const { data: newProfile, error: newProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (newProfileError) {
      console.log('❌ No se creó perfil automáticamente:', newProfileError.message);
      
      // Crear perfil manualmente
      console.log('🔧 Creando perfil manualmente...');
      
      const userId = newUser?.user?.id || 'temp-id';
      const { error: manualProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: testEmail,
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin'
        });

      if (manualProfileError) {
        console.error('❌ Error creando perfil manual:', manualProfileError.message);
      } else {
        console.log('✅ Perfil creado manualmente');
      }
    } else {
      console.log('✅ Perfil creado automáticamente:', newProfile);
    }

    console.log('\n🎉 Diagnóstico completado');
    console.log('\n📋 Credenciales para probar:');
    console.log('📧 Email: aguirrealexis.cba@gmail.com');
    console.log('🔑 Contraseña: Admin123!');
    console.log('🌐 Login: http://localhost:3000/auth/login');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

debugAuthIssue();