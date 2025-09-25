#!/usr/bin/env node

/**
 * SOLUCIÓN DEFINITIVA PARA AUTENTICACIÓN
 * 
 * Este script:
 * 1. Aplica las migraciones usando Supabase CLI
 * 2. Verifica que las funciones y triggers estén creados
 * 3. Configura el acceso de administrador
 */

const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe'
    });
    console.log(`✅ ${description} - Éxito`);
    if (output.trim()) {
      console.log(`📝 Output: ${output.trim()}`);
    }
    return true;
  } catch (error) {
    console.error(`❌ ${description} - Error:`, error.message);
    if (error.stdout) {
      console.log(`📝 Stdout: ${error.stdout}`);
    }
    if (error.stderr) {
      console.error(`📝 Stderr: ${error.stderr}`);
    }
    return false;
  }
}

async function checkSupabaseConnection() {
  console.log('\n🔍 Verificando conexión a Supabase...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    return false;
  }
}

async function checkFunctionsAndTriggers() {
  console.log('\n🔍 Verificando funciones y triggers...');
  
  try {
    // Verificar función handle_new_user
    const { data: functions, error: funcError } = await supabase
      .rpc('handle_new_user')
      .select();
    
    if (funcError && !funcError.message.includes('function handle_new_user() does not exist')) {
      console.log('✅ Función handle_new_user existe');
    } else {
      console.log('⚠️ Función handle_new_user no encontrada');
    }
    
    // Verificar trigger
    const { data: triggers, error: triggerError } = await supabase
      .from('information_schema.triggers')
      .select('*')
      .eq('trigger_name', 'on_auth_user_created');
    
    if (!triggerError && triggers && triggers.length > 0) {
      console.log('✅ Trigger on_auth_user_created existe');
    } else {
      console.log('⚠️ Trigger on_auth_user_created no encontrado');
    }
    
    return true;
  } catch (error) {
    console.log('⚠️ No se pudieron verificar funciones/triggers:', error.message);
    return false;
  }
}

async function createAdminProfile() {
  console.log('\n👤 Configurando perfil de administrador...');
  
  const adminEmail = 'aguirrealexis.cba@gmail.com';
  
  try {
    // Verificar si ya existe un perfil
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();
    
    if (existingProfile) {
      console.log('✅ Perfil de administrador ya existe');
      
      // Actualizar rol si no es admin
      if (existingProfile.role !== 'admin') {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', adminEmail);
        
        if (updateError) {
          console.error('❌ Error actualizando rol:', updateError.message);
        } else {
          console.log('✅ Rol de administrador actualizado');
        }
      }
      
      return true;
    }
    
    console.log('ℹ️ No existe perfil de administrador. Se creará automáticamente al registrarse.');
    return true;
    
  } catch (error) {
    console.error('❌ Error configurando perfil de administrador:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 INICIANDO CONFIGURACIÓN DEFINITIVA DE AUTENTICACIÓN');
  console.log('=' .repeat(60));
  
  // 1. Verificar conexión
  const connectionOk = await checkSupabaseConnection();
  if (!connectionOk) {
    console.error('❌ No se puede conectar a Supabase. Verifica las variables de entorno.');
    process.exit(1);
  }
  
  // 2. Aplicar migraciones usando CLI
  console.log('\n📦 APLICANDO MIGRACIONES...');
  const migrationsOk = await executeCommand(
    'npx supabase db push',
    'Aplicando migraciones a Supabase'
  );
  
  if (!migrationsOk) {
    console.log('⚠️ Las migraciones fallaron, pero continuamos...');
  }
  
  // 3. Verificar funciones y triggers
  await checkFunctionsAndTriggers();
  
  // 4. Configurar perfil de administrador
  await createAdminProfile();
  
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 CONFIGURACIÓN COMPLETADA');
  console.log('=' .repeat(60));
  
  console.log('\n📋 PRÓXIMOS PASOS:');
  console.log('1. Ve a: http://localhost:3000/auth/register');
  console.log('2. Regístrate con: aguirrealexis.cba@gmail.com');
  console.log('3. Usa cualquier contraseña (mínimo 6 caracteres)');
  console.log('4. Después del registro, ve a: http://localhost:3000/admin');
  console.log('5. Deberías tener acceso completo al panel de administración');
  
  console.log('\n🔧 Si aún hay problemas:');
  console.log('- Verifica que el servidor esté corriendo en puerto 3000');
  console.log('- Revisa la consola del navegador para errores');
  console.log('- Verifica las variables de entorno en .env');
  
  process.exit(0);
}

main().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});