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

async function verifyAuthSetup() {
  console.log('🔍 VERIFICANDO CONFIGURACIÓN DE AUTENTICACIÓN\n');

  try {
    // 1. Verificar si la función handle_new_user existe
    console.log('1️⃣ Verificando función handle_new_user...');
    const { data: functionExists, error: functionError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user')
      .limit(1);

    if (functionError) {
      console.error('❌ Error verificando función:', functionError.message);
    } else if (functionExists && functionExists.length > 0) {
      console.log('✅ Función handle_new_user existe');
    } else {
      console.log('❌ Función handle_new_user NO existe');
    }

    // 2. Verificar si el trigger existe
    console.log('\n2️⃣ Verificando trigger on_auth_user_created...');
    const { data: triggerExists, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgname', 'on_auth_user_created')
      .limit(1);

    if (triggerError) {
      console.error('❌ Error verificando trigger:', triggerError.message);
    } else if (triggerExists && triggerExists.length > 0) {
      console.log('✅ Trigger on_auth_user_created existe');
    } else {
      console.log('❌ Trigger on_auth_user_created NO existe');
    }

    // 3. Verificar estructura de la tabla profiles
    console.log('\n3️⃣ Verificando tabla profiles...');
    const { data: profilesTest, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(1);

    if (profilesError) {
      console.error('❌ Error accediendo a tabla profiles:', profilesError.message);
    } else {
      console.log('✅ Tabla profiles accesible');
    }

    // 4. Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('pg_policies')
      .select('policyname, tablename')
      .eq('tablename', 'profiles')
      .limit(5);

    if (rlsError) {
      console.error('❌ Error verificando RLS:', rlsError.message);
    } else {
      console.log('✅ Políticas RLS encontradas:', rlsTest?.length || 0);
      if (rlsTest && rlsTest.length > 0) {
        rlsTest.forEach(policy => {
          console.log(`  - ${policy.policyname}`);
        });
      }
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    
  } catch (error) {
    console.error('💥 Error durante la verificación:', error);
  }
}

verifyAuthSetup();