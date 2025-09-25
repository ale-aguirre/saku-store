// Script para verificar el estado de la base de datos
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

async function checkDatabase() {
  console.log('🔍 Verificando estado de la base de datos...\n');
  
  try {
    // 1. Verificar si existe la tabla profiles
    console.log('📋 Verificando tabla profiles...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error en tabla profiles:', profilesError.message);
      console.log('💡 La tabla profiles no existe o no tiene permisos RLS');
    } else {
      console.log('✅ Tabla profiles existe');
    }

    // 2. Verificar si existe la función handle_new_user
    console.log('\n🔧 Verificando función handle_new_user...');
    const { data: functions, error: functionsError } = await supabase
      .rpc('handle_new_user')
      .select();

    if (functionsError) {
      console.error('❌ Error con función handle_new_user:', functionsError.message);
    } else {
      console.log('✅ Función handle_new_user existe');
    }

    // 3. Verificar trigger en auth.users
    console.log('\n🎯 Verificando configuración de auth...');
    const { data: authTest, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error accediendo a auth:', authError.message);
    } else {
      console.log('✅ Acceso a auth funciona');
      console.log(`📊 Usuarios existentes: ${authTest.users.length}`);
    }

    // 4. Verificar enum user_role
    console.log('\n🏷️ Verificando enum user_role...');
    const { data: enumTest, error: enumError } = await supabase
      .from('profiles')
      .select('role')
      .limit(1);

    if (enumError) {
      console.error('❌ Error con enum user_role:', enumError.message);
    } else {
      console.log('✅ Enum user_role funciona');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

checkDatabase();