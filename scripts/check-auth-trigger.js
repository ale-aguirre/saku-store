require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthTrigger() {
  try {
    console.log('🔍 Verificando configuración de autenticación...');
    
    // 1. Intentar llamar a la función handle_new_user directamente
    console.log('\n1️⃣ Verificando función handle_new_user...');
    const { data: funcTest, error: funcError } = await supabase.rpc('handle_new_user');
    
    if (funcError) {
      if (funcError.message.includes('does not exist')) {
        console.log('❌ Función handle_new_user NO existe');
      } else {
        console.log('✅ Función handle_new_user existe (error esperado sin parámetros)');
        console.log(`   Error: ${funcError.message}`);
      }
    } else {
      console.log('✅ Función handle_new_user existe y responde');
    }
    
    // 2. Verificar acceso a la tabla profiles
    console.log('\n2️⃣ Verificando acceso a tabla profiles...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error accediendo a profiles:', profilesError);
    } else {
      console.log('✅ Tabla profiles accesible');
    }
    
    // 3. Verificar si hay usuarios en auth.users
    console.log('\n3️⃣ Verificando usuarios en auth.users...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accediendo a auth.users:', authError);
    } else {
      console.log(`✅ Auth.users accesible - ${authUsers.users.length} usuarios encontrados`);
      
      if (authUsers.users.length > 0) {
        console.log('\n👥 Usuarios en auth.users:');
        authUsers.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Creado: ${user.created_at}`);
          console.log(`      Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
        });
        
        // 4. Para cada usuario en auth.users, verificar si tiene perfil
        console.log('\n4️⃣ Verificando perfiles correspondientes...');
        for (const user of authUsers.users) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError) {
            console.log(`❌ Usuario ${user.email} NO tiene perfil: ${profileError.message}`);
          } else {
            console.log(`✅ Usuario ${user.email} tiene perfil`);
          }
        }
      }
    }
    
    // 5. Verificar configuración actual del hook use-auth
    console.log('\n5️⃣ Diagnóstico del problema...');
    console.log('El error "Error fetching user profile: {}" indica que:');
    console.log('- El hook use-auth.tsx intenta obtener un perfil para un usuario autenticado');
    console.log('- Pero no encuentra el perfil en la tabla profiles');
    console.log('- Esto puede ocurrir si:');
    console.log('  a) No hay usuarios autenticados (caso actual)');
    console.log('  b) El trigger handle_new_user no funciona');
    console.log('  c) Las políticas RLS bloquean el acceso');
    
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkAuthTrigger().then(() => {
  console.log('\n✅ Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});