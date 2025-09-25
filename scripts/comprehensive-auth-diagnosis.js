const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runDiagnosis() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN\n');

  try {
    // 1. Verificar conexión
    console.log('1️⃣ Verificando conexión a Supabase...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      return;
    }
    console.log('✅ Conexión exitosa\n');

    // 2. Verificar estructura de la tabla profiles
    console.log('2️⃣ Verificando estructura de tabla profiles...');
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'profiles' AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (tableError) {
      console.log('⚠️ No se pudo verificar estructura con RPC, intentando método alternativo...');
      
      // Método alternativo: intentar insertar un registro de prueba para ver qué falla
      const testId = 'test-' + Date.now();
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: testId,
          email: 'test@example.com',
          role: 'customer'
        });
      
      if (insertError) {
        console.error('❌ Error al insertar en profiles:', insertError.message);
        console.error('Detalles:', insertError);
      } else {
        console.log('✅ Inserción de prueba exitosa');
        // Limpiar el registro de prueba
        await supabase.from('profiles').delete().eq('id', testId);
      }
    } else {
      console.log('✅ Estructura de tabla profiles:', tableInfo);
    }
    console.log('');

    // 3. Verificar funciones existentes
    console.log('3️⃣ Verificando funciones...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT routine_name, routine_type 
          FROM information_schema.routines 
          WHERE routine_schema = 'public' 
          AND routine_name IN ('handle_new_user', 'set_admin_role_for_email');
        `
      });

    if (functionsError) {
      console.log('⚠️ No se pudieron verificar funciones con RPC');
    } else {
      console.log('📋 Funciones encontradas:', functions);
    }
    console.log('');

    // 4. Verificar triggers
    console.log('4️⃣ Verificando triggers...');
    const { data: triggers, error: triggersError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT trigger_name, event_manipulation, action_timing
          FROM information_schema.triggers 
          WHERE trigger_schema = 'public' 
          AND trigger_name = 'on_auth_user_created';
        `
      });

    if (triggersError) {
      console.log('⚠️ No se pudieron verificar triggers con RPC');
    } else {
      console.log('📋 Triggers encontrados:', triggers);
    }
    console.log('');

    // 5. Verificar políticas RLS
    console.log('5️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
          FROM pg_policies 
          WHERE tablename = 'profiles';
        `
      });

    if (policiesError) {
      console.log('⚠️ No se pudieron verificar políticas RLS con RPC');
    } else {
      console.log('📋 Políticas RLS encontradas:', policies);
    }
    console.log('');

    // 6. Probar creación de usuario con Admin API
    console.log('6️⃣ Probando creación de usuario con Admin API...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (userError) {
      console.error('❌ Error creando usuario:', userError.message);
      console.error('Detalles:', userError);
    } else {
      console.log('✅ Usuario creado exitosamente:', newUser.user.id);
      
      // Verificar si se creó el perfil automáticamente
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', newUser.user.id)
        .single();

      if (profileError) {
        console.error('❌ No se creó el perfil automáticamente:', profileError.message);
      } else {
        console.log('✅ Perfil creado automáticamente:', profile);
      }

      // Limpiar usuario de prueba
      await supabase.auth.admin.deleteUser(newUser.user.id);
      console.log('🧹 Usuario de prueba eliminado');
    }
    console.log('');

    // 7. Verificar configuración de auth en Supabase
    console.log('7️⃣ Verificando configuración de auth...');
    const { data: authConfig, error: authError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT name, setting 
          FROM pg_settings 
          WHERE name LIKE '%auth%' OR name LIKE '%trigger%'
          LIMIT 10;
        `
      });

    if (authError) {
      console.log('⚠️ No se pudo verificar configuración de auth');
    } else {
      console.log('📋 Configuración de auth:', authConfig);
    }

    console.log('\n🎯 RESUMEN DEL DIAGNÓSTICO:');
    console.log('- Conexión a Supabase: ✅');
    console.log('- Tabla profiles: Verificar logs arriba');
    console.log('- Funciones: Verificar logs arriba');
    console.log('- Triggers: Verificar logs arriba');
    console.log('- Políticas RLS: Verificar logs arriba');
    console.log('- Creación de usuario: Verificar logs arriba');

  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error);
  }
}

runDiagnosis();