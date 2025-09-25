#!/usr/bin/env node

/**
 * Script para verificar logs y estado del trigger en Supabase
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes');
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function checkTriggerStatus() {
  console.log('🔍 Verificando estado del trigger\n');

  try {
    // 1. Verificar que la función existe
    console.log('1️⃣ Verificando función handle_new_user...');
    const { data: functions, error: funcError } = await adminClient
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            proname as function_name,
            prosecdef as security_definer,
            proowner::regrole as owner
          FROM pg_proc 
          WHERE proname = 'handle_new_user'
        `
      });

    if (funcError) {
      console.log('⚠️ No se puede verificar función directamente');
    } else {
      console.log('✅ Función encontrada:', functions);
    }

    // 2. Verificar triggers
    console.log('\n2️⃣ Verificando triggers...');
    const { data: triggers, error: triggerError } = await adminClient
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_object_table,
            event_object_schema,
            action_timing,
            event_manipulation
          FROM information_schema.triggers 
          WHERE trigger_name = 'on_auth_user_created'
        `
      });

    if (triggerError) {
      console.log('⚠️ No se puede verificar triggers directamente');
    } else {
      console.log('✅ Triggers encontrados:', triggers);
    }

    // 3. Probar creación de usuario con logging
    console.log('\n3️⃣ Probando creación con logging...');
    
    const testEmail = `log-test-${Date.now()}@gmail.com`;
    
    // Crear usuario
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Log',
        last_name: 'Test'
      }
    });

    if (createError) {
      console.error('❌ Error creando usuario:', createError.message);
      return;
    }

    console.log('✅ Usuario creado:', userData.user?.id);

    // Esperar y verificar
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userData.user?.id);

    console.log('📊 Perfiles encontrados:', profiles?.length || 0);

    // Limpiar
    await adminClient.auth.admin.deleteUser(userData.user?.id);

    // 4. Intentar ejecutar la función manualmente
    console.log('\n4️⃣ Probando función manualmente...');
    
    const { data: manualResult, error: manualError } = await adminClient
      .rpc('exec_sql', { 
        sql: `
          SELECT public.handle_new_user() as test_result;
        `
      });

    if (manualError) {
      console.log('⚠️ No se puede ejecutar función manualmente:', manualError.message);
    } else {
      console.log('✅ Función manual:', manualResult);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🔐 Verificación de Estado del Trigger\n');
  await checkTriggerStatus();
}

main().catch(console.error);