#!/usr/bin/env node

/**
 * Script para probar la nueva solución de registro con creación manual de perfil
 */

import 'dotenv/config';

async function testNewAuthSolution() {
  console.log('🧪 Probando nueva solución de autenticación\n');

  const testEmail = `new-auth-test-${Date.now()}@gmail.com`;
  const testData = {
    email: testEmail,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+5493511234567',
    marketingConsent: true
  };

  try {
    // 1. Probar el endpoint de registro
    console.log('1️⃣ Probando endpoint de registro...');
    console.log('📧 Email de prueba:', testEmail);

    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Error en el registro:', result.error);
      console.error('   Detalles:', result.details);
      return false;
    }

    console.log('✅ Registro exitoso:');
    console.log('   - Usuario ID:', result.user?.id);
    console.log('   - Email:', result.user?.email);
    console.log('   - Email confirmado:', result.user?.emailConfirmed);
    console.log('   - Perfil creado:', !!result.profile);

    if (result.profile) {
      console.log('   - Perfil ID:', result.profile.id);
      console.log('   - Nombre:', result.profile.first_name, result.profile.last_name);
      console.log('   - Teléfono:', result.profile.phone);
      console.log('   - Marketing:', result.profile.marketing_consent);
      console.log('   - Rol:', result.profile.role);
    }

    // 2. Verificar que el perfil existe en la base de datos
    console.log('\n2️⃣ Verificando perfil en base de datos...');
    
    const { createClient } = await import('@supabase/supabase-js');
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE
    );

    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('email', testEmail);

    if (profileError) {
      console.error('❌ Error verificando perfil:', profileError.message);
      return false;
    }

    console.log('📊 Perfiles encontrados:', profiles?.length || 0);

    if (profiles && profiles.length > 0) {
      const profile = profiles[0];
      console.log('✅ Perfil verificado en DB:');
      console.log('   - ID:', profile.id);
      console.log('   - Email:', profile.email);
      console.log('   - Nombre completo:', profile.first_name, profile.last_name);
      console.log('   - Teléfono:', profile.phone);
      console.log('   - Marketing consent:', profile.marketing_consent);
      console.log('   - Rol:', profile.role);
      console.log('   - Creado:', profile.created_at);
    }

    // 3. Limpiar datos de prueba
    console.log('\n3️⃣ Limpiando datos de prueba...');
    
    if (result.user?.id) {
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
        result.user.id
      );

      if (deleteUserError) {
        console.error('⚠️ Error eliminando usuario:', deleteUserError.message);
      } else {
        console.log('✅ Usuario y perfil eliminados');
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔐 Test de Nueva Solución de Autenticación\n');
  
  // Verificar que el servidor esté corriendo
  try {
    const healthCheck = await fetch('http://localhost:3000/api/health');
    if (!healthCheck.ok) {
      console.error('❌ El servidor no está corriendo en localhost:3000');
      console.log('   Ejecuta: npm run dev');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ No se puede conectar al servidor en localhost:3000');
    console.log('   Ejecuta: npm run dev');
    process.exit(1);
  }

  const success = await testNewAuthSolution();
  
  console.log('\n📊 Resultado:');
  if (success) {
    console.log('✅ Nueva solución de autenticación funciona correctamente');
    process.exit(0);
  } else {
    console.log('❌ La nueva solución necesita ajustes');
    process.exit(1);
  }
}

main().catch(console.error);