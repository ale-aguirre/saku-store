#!/usr/bin/env node

/**
 * Script para probar el trigger directamente usando Admin API
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

async function testTriggerDirect() {
  console.log('🧪 Probando trigger directamente con Admin API\n');

  const testEmail = `trigger-test-${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    // 1. Crear usuario usando Admin API (esto debería activar el trigger)
    console.log('1️⃣ Creando usuario con Admin API...');
    const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        first_name: 'Trigger',
        last_name: 'Test',
        phone: '+5493511234567',
        marketing_consent: true
      }
    });

    if (createError) {
      console.error('❌ Error creando usuario:', createError.message);
      return false;
    }

    console.log('✅ Usuario creado:', userData.user?.id);

    // 2. Esperar un momento para que el trigger se ejecute
    console.log('⏳ Esperando trigger...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 3. Verificar que se creó el perfil
    console.log('2️⃣ Verificando perfil creado...');
    const { data: profiles, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', userData.user?.id);

    if (profileError) {
      console.error('❌ Error obteniendo perfil:', profileError.message);
      return false;
    }

    console.log('📊 Perfiles encontrados:', profiles?.length || 0);
    
    if (!profiles || profiles.length === 0) {
      console.error('❌ Perfil no encontrado - el trigger no se ejecutó');
      
      // Intentar crear el perfil manualmente para verificar que la tabla funciona
      console.log('3️⃣ Intentando crear perfil manualmente...');
      const { data: manualProfile, error: manualError } = await adminClient
        .from('profiles')
        .insert({
          id: userData.user?.id,
          email: testEmail,
          first_name: 'Manual',
          last_name: 'Test',
          role: 'customer'
        })
        .select()
        .single();

      if (manualError) {
        console.error('❌ Error creando perfil manual:', manualError.message);
      } else {
        console.log('✅ Perfil manual creado exitosamente');
        console.log('  → Esto confirma que la tabla profiles funciona');
        console.log('  → El problema está en el trigger automático');
      }
    } else {
      const profile = profiles[0];
      console.log('✅ Perfil creado correctamente por el trigger:');
      console.log('  - ID:', profile.id);
      console.log('  - Email:', profile.email);
      console.log('  - Nombre:', profile.first_name, profile.last_name);
      console.log('  - Teléfono:', profile.phone);
      console.log('  - Marketing:', profile.marketing_consent);
      console.log('  - Rol:', profile.role);
    }

    // 4. Limpiar datos de prueba
    console.log('4️⃣ Limpiando datos de prueba...');
    
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
      userData.user?.id
    );

    if (deleteUserError) {
      console.error('⚠️ Error eliminando usuario:', deleteUserError.message);
    } else {
      console.log('✅ Usuario eliminado');
    }

    return profiles && profiles.length > 0;

  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔐 Test Directo del Trigger\n');
  
  const success = await testTriggerDirect();
  
  console.log('\n📊 Resultado:');
  if (success) {
    console.log('✅ Trigger funcionando correctamente');
    process.exit(0);
  } else {
    console.log('❌ Trigger no funciona - necesita investigación adicional');
    process.exit(1);
  }
}

main().catch(console.error);