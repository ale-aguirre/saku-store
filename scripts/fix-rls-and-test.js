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

async function fixRLSAndTest() {
  console.log('🔧 CORRIGIENDO RLS Y PROBANDO AUTENTICACIÓN\n');

  try {
    // 1. Deshabilitar RLS temporalmente para probar
    console.log('1️⃣ Deshabilitando RLS temporalmente en profiles...');
    
    const { error: disableRLSError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (disableRLSError) {
      console.log('⚠️ Error accediendo a profiles:', disableRLSError.message);
    } else {
      console.log('✅ Acceso a profiles verificado');
    }

    // 2. Intentar insertar un perfil directamente
    console.log('\n2️⃣ Probando inserción directa en profiles...');
    
    const testUUID = crypto.randomUUID();
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUUID,
        email: testEmail,
        role: 'customer'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error insertando perfil:', insertError.message);
      console.error('Detalles:', insertError);
    } else {
      console.log('✅ Perfil insertado exitosamente:', insertData);
      
      // Limpiar el perfil de prueba
      await supabase.from('profiles').delete().eq('id', testUUID);
      console.log('🧹 Perfil de prueba eliminado');
    }

    // 3. Verificar si el problema está en auth.users
    console.log('\n3️⃣ Probando creación de usuario en auth.users...');
    
    const testAuthEmail = `auth-test-${Date.now()}@example.com`;
    
    // Intentar crear usuario directamente
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testAuthEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Error creando usuario en auth:', authError.message);
      
      // El problema podría estar en la configuración de Supabase Auth
      console.log('\n🔍 Verificando configuración de auth...');
      
      // Intentar con signUp normal
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testAuthEmail,
        password: 'test123456'
      });

      if (signUpError) {
        console.error('❌ Error con signUp normal:', signUpError.message);
        
        // Verificar si es un problema de configuración
        if (signUpError.message.includes('Database error')) {
          console.log('\n💡 DIAGNÓSTICO: El problema está en la configuración de la base de datos');
          console.log('Posibles causas:');
          console.log('1. El trigger no está creado correctamente');
          console.log('2. La función handle_new_user tiene errores');
          console.log('3. Las políticas RLS están bloqueando la inserción');
          console.log('4. Hay un problema con el esquema auth de Supabase');
        }
      } else {
        console.log('✅ SignUp normal exitoso');
        
        if (signUpData.user) {
          // Verificar si se creó el perfil
          setTimeout(async () => {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', signUpData.user.id)
              .single();

            if (profileError) {
              console.error('❌ No se creó el perfil automáticamente:', profileError.message);
            } else {
              console.log('✅ Perfil creado automáticamente:', profile);
            }
          }, 1000);
        }
      }
    } else {
      console.log('✅ Usuario creado en auth exitosamente');
      
      // Verificar si se creó el perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single();

      if (profileError) {
        console.error('❌ No se creó el perfil automáticamente:', profileError.message);
        
        // Intentar crear el perfil manualmente
        console.log('Intentando crear perfil manualmente...');
        const { data: manualProfile, error: manualError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            email: authUser.user.email,
            role: authUser.user.email === 'aguirrealexis.cba@gmail.com' ? 'admin' : 'customer'
          })
          .select()
          .single();

        if (manualError) {
          console.error('❌ Error creando perfil manualmente:', manualError.message);
        } else {
          console.log('✅ Perfil creado manualmente:', manualProfile);
        }
      } else {
        console.log('✅ Perfil creado automáticamente:', profile);
      }

      // Limpiar usuario de prueba
      await supabase.auth.admin.deleteUser(authUser.user.id);
      console.log('🧹 Usuario de prueba eliminado');
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');

  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error);
  }
}

fixRLSAndTest();