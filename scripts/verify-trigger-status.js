#!/usr/bin/env node

/**
 * Script para verificar el estado del trigger y función
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

async function verifyTriggerStatus() {
  console.log('🔍 Verificando estado del trigger y función\n');

  try {
    // 1. Verificar que la función existe
    console.log('1️⃣ Verificando función handle_new_user...');
    const { data: functions, error: funcError } = await adminClient
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            proname as function_name,
            prosrc as function_body
          FROM pg_proc 
          WHERE proname = 'handle_new_user' 
          AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        `
      });

    if (funcError) {
      console.log('⚠️ No se puede verificar función via exec_sql:', funcError.message);
    } else if (functions && functions.length > 0) {
      console.log('✅ Función handle_new_user encontrada');
    } else {
      console.log('❌ Función handle_new_user no encontrada');
    }

    // 2. Verificar triggers
    console.log('2️⃣ Verificando triggers...');
    const { data: triggers, error: triggerError } = await adminClient
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            trigger_name,
            event_manipulation,
            action_timing,
            action_statement
          FROM information_schema.triggers 
          WHERE trigger_name = 'on_auth_user_created'
        `
      });

    if (triggerError) {
      console.log('⚠️ No se puede verificar triggers via exec_sql:', triggerError.message);
    } else if (triggers && triggers.length > 0) {
      console.log('✅ Trigger on_auth_user_created encontrado');
      console.log('  - Evento:', triggers[0].event_manipulation);
      console.log('  - Timing:', triggers[0].action_timing);
    } else {
      console.log('❌ Trigger on_auth_user_created no encontrado');
    }

    // 3. Probar creación manual de perfil
    console.log('3️⃣ Probando creación manual de perfil...');
    const testUserId = 'test-' + Date.now();
    
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: testUserId,
        email: 'test@manual.com',
        first_name: 'Test',
        last_name: 'Manual',
        role: 'customer'
      })
      .select()
      .single();

    if (profileError) {
      console.log('❌ Error creando perfil manual:', profileError.message);
    } else {
      console.log('✅ Perfil manual creado exitosamente');
      
      // Limpiar
      await adminClient.from('profiles').delete().eq('id', testUserId);
      console.log('✅ Perfil manual eliminado');
    }

    // 4. Verificar políticas RLS
    console.log('4️⃣ Verificando políticas RLS...');
    const { data: policies, error: policyError } = await adminClient
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual
          FROM pg_policies 
          WHERE tablename = 'profiles'
        `
      });

    if (policyError) {
      console.log('⚠️ No se puede verificar políticas via exec_sql:', policyError.message);
    } else if (policies && policies.length > 0) {
      console.log(`✅ ${policies.length} políticas RLS encontradas para profiles`);
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname} (${policy.cmd})`);
      });
    } else {
      console.log('❌ No se encontraron políticas RLS para profiles');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

async function main() {
  await verifyTriggerStatus();
}

main().catch(console.error);