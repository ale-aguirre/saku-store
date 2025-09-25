// Script para diagnosticar el estado actual de la base de datos
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

async function debugDatabaseState() {
  console.log('🔍 DIAGNÓSTICO DEL ESTADO DE LA BASE DE DATOS\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      return;
    }
    console.log('✅ Conexión exitosa');

    // 2. Verificar estructura de la tabla profiles
    console.log('\n2️⃣ Verificando estructura de tabla profiles...');
    const { data: profilesStructure, error: structureError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'profiles' AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (structureError) {
      console.log('⚠️  No se pudo obtener estructura via RPC, intentando método alternativo...');
      
      // Intentar insertar un registro de prueba para ver qué falla
      const testId = '00000000-0000-0000-0000-000000000001';
      const { data: insertTest, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testId,
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          role: 'customer'
        })
        .select();

      if (insertError) {
        console.error('❌ Error en inserción de prueba:', insertError.message);
        console.error('📋 Detalles:', insertError);
      } else {
        console.log('✅ Inserción de prueba exitosa');
        
        // Limpiar
        await supabase.from('profiles').delete().eq('id', testId);
        console.log('✅ Registro de prueba eliminado');
      }
    } else {
      console.log('✅ Estructura de profiles:', profilesStructure);
    }

    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...');
    const { data: rlsPolicies, error: rlsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
          FROM pg_policies 
          WHERE tablename = 'profiles';
        `
      });

    if (rlsError) {
      console.log('⚠️  No se pudieron obtener políticas RLS:', rlsError.message);
    } else {
      console.log('📋 Políticas RLS activas:', rlsPolicies);
    }

    // 4. Verificar si RLS está habilitado
    console.log('\n4️⃣ Verificando estado de RLS...');
    const { data: rlsStatus, error: rlsStatusError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE tablename = 'profiles' AND schemaname = 'public';
        `
      });

    if (rlsStatusError) {
      console.log('⚠️  No se pudo verificar estado RLS:', rlsStatusError.message);
    } else {
      console.log('🔒 Estado RLS:', rlsStatus);
    }

    // 5. Verificar triggers
    console.log('\n5️⃣ Verificando triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT trigger_name, event_manipulation, action_statement, action_timing
          FROM information_schema.triggers 
          WHERE event_object_table = 'users' AND event_object_schema = 'auth';
        `
      });

    if (triggersError) {
      console.log('⚠️  No se pudieron obtener triggers:', triggersError.message);
    } else {
      console.log('⚡ Triggers en auth.users:', triggers);
    }

    // 6. Verificar función handle_new_user
    console.log('\n6️⃣ Verificando función handle_new_user...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT routine_name, routine_definition
          FROM information_schema.routines 
          WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';
        `
      });

    if (functionsError) {
      console.log('⚠️  No se pudo verificar función:', functionsError.message);
    } else {
      console.log('🔧 Función handle_new_user:', functions);
    }

    // 7. Probar creación directa de usuario con Admin API
    console.log('\n7️⃣ Probando creación directa con Admin API...');
    const testEmail = `admin-test-${Date.now()}@example.com`;
    
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Test'
      }
    });

    if (adminError) {
      console.error('❌ Error creando usuario con Admin API:', adminError.message);
    } else {
      console.log('✅ Usuario creado con Admin API:', adminUser.user.id);
      
      // Verificar si se creó el perfil automáticamente
      const { data: autoProfile, error: autoProfileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', adminUser.user.id)
        .single();

      if (autoProfileError) {
        console.log('❌ No se creó perfil automáticamente:', autoProfileError.message);
        
        // Intentar crear perfil manualmente
        const { data: manualProfile, error: manualProfileError } = await supabase
          .from('profiles')
          .insert({
            id: adminUser.user.id,
            email: adminUser.user.email,
            first_name: 'Admin',
            last_name: 'Test',
            role: 'customer'
          })
          .select()
          .single();

        if (manualProfileError) {
          console.error('❌ Error creando perfil manualmente:', manualProfileError.message);
        } else {
          console.log('✅ Perfil creado manualmente:', manualProfile);
        }
      } else {
        console.log('✅ Perfil creado automáticamente:', autoProfile);
      }

      // Limpiar
      await supabase.from('profiles').delete().eq('id', adminUser.user.id);
      await supabase.auth.admin.deleteUser(adminUser.user.id);
      console.log('✅ Usuario de prueba eliminado');
    }

    console.log('\n📊 DIAGNÓSTICO COMPLETADO');

  } catch (error) {
    console.error('💥 Error durante diagnóstico:', error);
  }
}

debugDatabaseState();