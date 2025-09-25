// Script para diagnosticar el estado de Supabase remoto
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

console.log('🔍 Diagnóstico de Supabase Remoto\n');

// Verificar variables de entorno
console.log('📋 Variables de entorno:');
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓ Configurada' : '❌ Faltante'}`);
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓ Configurada' : '❌ Faltante'}`);
console.log(`SUPABASE_SERVICE_ROLE: ${serviceRoleKey ? '✓ Configurada' : '❌ Faltante'}`);

if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
  console.error('\n❌ Faltan variables de entorno críticas');
  process.exit(1);
}

// Crear clientes
const anonClient = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testConnectivity() {
  console.log('\n🌐 Probando conectividad...');
  
  try {
    // Test con cliente anónimo
    const { data: anonData, error: anonError } = await anonClient
      .from('products')
      .select('count')
      .limit(1);
    
    if (anonError) {
      console.log(`❌ Cliente anónimo: ${anonError.message}`);
    } else {
      console.log('✓ Cliente anónimo: Conectado');
    }

    // Test con cliente admin
    const { data: adminData, error: adminError } = await adminClient
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (adminError) {
      console.log(`❌ Cliente admin: ${adminError.message}`);
    } else {
      console.log('✓ Cliente admin: Conectado');
    }

  } catch (error) {
    console.error(`❌ Error de conectividad: ${error.message}`);
  }
}

async function checkTablesStructure() {
  console.log('\n📊 Verificando estructura de tablas...');
  
  try {
    // Verificar tabla profiles
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log(`❌ Tabla profiles: ${profilesError.message}`);
    } else {
      console.log('✓ Tabla profiles: Accesible');
      if (profiles && profiles.length > 0) {
        console.log(`  - Campos disponibles: ${Object.keys(profiles[0]).join(', ')}`);
      }
    }

    // Verificar tabla auth.users (solo con admin)
    const { data: users, error: usersError } = await adminClient
      .from('auth.users')
      .select('id, email')
      .limit(1);
    
    if (usersError) {
      console.log(`❌ Tabla auth.users: ${usersError.message}`);
    } else {
      console.log('✓ Tabla auth.users: Accesible');
    }

  } catch (error) {
    console.error(`❌ Error verificando tablas: ${error.message}`);
  }
}

async function checkConstraints() {
  console.log('\n🔗 Verificando restricciones...');
  
  try {
    // Intentar crear un perfil de prueba sin usuario en auth.users
    const testId = '00000000-0000-0000-0000-000000000001';
    
    const { data, error } = await adminClient
      .from('profiles')
      .insert({
        id: testId,
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .select();
    
    if (error) {
      console.log(`❌ Restricción FK activa: ${error.message}`);
      
      // Verificar si es específicamente la clave foránea
      if (error.message.includes('profiles_id_fkey') || error.message.includes('foreign key')) {
        console.log('  → Confirmado: La clave foránea profiles_id_fkey está bloqueando la inserción');
      }
    } else {
      console.log('✓ Perfil de prueba creado (sin restricción FK)');
      
      // Limpiar el perfil de prueba
      await adminClient
        .from('profiles')
        .delete()
        .eq('id', testId);
      console.log('  → Perfil de prueba eliminado');
    }

  } catch (error) {
    console.error(`❌ Error verificando restricciones: ${error.message}`);
  }
}

async function checkAuthTriggers() {
  console.log('\n⚡ Verificando triggers de autenticación...');
  
  try {
    // Intentar crear un usuario con Admin API
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: user, error: userError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true,
      user_metadata: {
        first_name: 'Test',
        last_name: 'User'
      }
    });

    if (userError) {
      console.log(`❌ Error creando usuario: ${userError.message}`);
      return;
    }

    console.log(`✓ Usuario creado: ${user.user.id}`);

    // Verificar si se creó el perfil automáticamente
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (profileError) {
      console.log(`❌ Perfil NO creado automáticamente: ${profileError.message}`);
      console.log('  → El trigger handle_new_user NO está funcionando');
    } else {
      console.log('✓ Perfil creado automáticamente por trigger');
      console.log(`  → Datos: ${JSON.stringify(profile, null, 2)}`);
    }

    // Limpiar usuario de prueba
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.user.id);
    if (deleteError) {
      console.log(`⚠️ No se pudo eliminar usuario de prueba: ${deleteError.message}`);
    } else {
      console.log('✓ Usuario de prueba eliminado');
    }

  } catch (error) {
    console.error(`❌ Error verificando triggers: ${error.message}`);
  }
}

async function main() {
  await testConnectivity();
  await checkTablesStructure();
  await checkConstraints();
  await checkAuthTriggers();
  
  console.log('\n📋 Resumen del diagnóstico:');
  console.log('1. Si hay errores de conectividad → verificar URLs y claves');
  console.log('2. Si profiles_id_fkey bloquea → necesitamos deshabilitar o arreglar el trigger');
  console.log('3. Si el trigger no funciona → necesitamos recrearlo');
  console.log('4. Si todo funciona → el problema está en el frontend');
}

main().catch(console.error);