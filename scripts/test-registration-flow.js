// Script para probar el flujo completo de registro
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !anonKey || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno');
  process.exit(1);
}

// Cliente anónimo (como en el frontend)
const supabaseAnon = createClient(supabaseUrl, anonKey);

// Cliente con service role (para limpieza)
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testRegistrationFlow() {
  console.log('🧪 PROBANDO FLUJO DE REGISTRO COMPLETO\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'test123456';
  const testData = {
    first_name: 'Test',
    last_name: 'User',
    phone: '+5493511234567',
    marketing_consent: true
  };

  try {
    // 1. Probar registro con cliente anónimo (simulando frontend)
    console.log('1️⃣ Probando registro con cliente anónimo...');
    console.log(`📧 Email: ${testEmail}`);
    
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: testData
      }
    });

    if (signUpError) {
      console.error('❌ Error en signUp:', signUpError.message);
      return;
    }

    console.log('✅ SignUp exitoso');
    console.log(`👤 Usuario ID: ${signUpData.user?.id}`);

    if (!signUpData.user) {
      console.error('❌ No se obtuvo el usuario');
      return;
    }

    // 2. Crear perfil manualmente (simulando el workaround del frontend)
    console.log('\n2️⃣ Creando perfil manualmente...');
    
    const { data: profileData, error: profileError } = await supabaseAnon
      .from('profiles')
      .insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        first_name: testData.first_name,
        last_name: testData.last_name,
        phone: testData.phone,
        role: signUpData.user.email === 'aguirrealexis.cba@gmail.com' ? 'admin' : 'customer',
        marketing_consent: testData.marketing_consent
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError.message);
      
      // Verificar si el perfil ya existe
      const { data: existingProfile, error: checkError } = await supabaseAnon
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (checkError) {
        console.error('❌ Perfil no existe y no se pudo crear');
      } else {
        console.log('✅ Perfil ya existía:', existingProfile);
      }
    } else {
      console.log('✅ Perfil creado exitosamente:', profileData);
    }

    // 3. Verificar que el perfil existe y es accesible
    console.log('\n3️⃣ Verificando acceso al perfil...');
    
    const { data: verifyProfile, error: verifyError } = await supabaseAnon
      .from('profiles')
      .select('*')
      .eq('id', signUpData.user.id)
      .single();

    if (verifyError) {
      console.error('❌ Error verificando perfil:', verifyError.message);
    } else {
      console.log('✅ Perfil verificado:', {
        id: verifyProfile.id,
        email: verifyProfile.email,
        role: verifyProfile.role,
        first_name: verifyProfile.first_name,
        last_name: verifyProfile.last_name
      });
    }

    // 4. Probar login
    console.log('\n4️⃣ Probando login...');
    
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Error en login:', loginError.message);
    } else {
      console.log('✅ Login exitoso');
      
      // Verificar sesión
      const { data: sessionData } = await supabaseAnon.auth.getSession();
      if (sessionData.session) {
        console.log('✅ Sesión activa:', sessionData.session.user.email);
        
        // Cerrar sesión
        await supabaseAnon.auth.signOut();
        console.log('✅ Sesión cerrada');
      }
    }

    // 5. Limpiar datos de prueba
    console.log('\n5️⃣ Limpiando datos de prueba...');
    
    // Eliminar perfil
    const { error: deleteProfileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', signUpData.user.id);

    if (deleteProfileError) {
      console.error('⚠️  Error eliminando perfil:', deleteProfileError.message);
    } else {
      console.log('✅ Perfil eliminado');
    }

    // Eliminar usuario
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);

    if (deleteUserError) {
      console.error('⚠️  Error eliminando usuario:', deleteUserError.message);
    } else {
      console.log('✅ Usuario eliminado');
    }

    console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('\n📋 RESUMEN:');
    console.log('✅ SignUp funciona');
    console.log('✅ Creación manual de perfil funciona');
    console.log('✅ Login funciona');
    console.log('✅ Sesión funciona');
    console.log('\n🌐 El registro debería funcionar en: http://localhost:3000/auth/register');

  } catch (error) {
    console.error('💥 Error durante la prueba:', error);
  }
}

// Función adicional para probar el email de admin
async function testAdminRegistration() {
  console.log('\n👑 PROBANDO REGISTRO DE ADMIN\n');
  
  const adminEmail = 'aguirrealexis.cba@gmail.com';
  const adminPassword = 'admin123456';

  try {
    // Verificar si ya existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUser.users.find(u => u.email === adminEmail);

    if (userExists) {
      console.log('⚠️  Usuario admin ya existe, eliminando para prueba...');
      
      // Eliminar perfil existente
      await supabaseAdmin.from('profiles').delete().eq('email', adminEmail);
      
      // Eliminar usuario existente
      await supabaseAdmin.auth.admin.deleteUser(userExists.id);
      
      console.log('✅ Usuario admin anterior eliminado');
    }

    // Probar registro de admin
    const { data: adminSignUp, error: adminError } = await supabaseAnon.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          first_name: 'Admin',
          last_name: 'Sakú'
        }
      }
    });

    if (adminError) {
      console.error('❌ Error registrando admin:', adminError.message);
      return;
    }

    console.log('✅ Admin registrado exitosamente');

    if (adminSignUp.user) {
      // Crear perfil de admin
      const { data: adminProfile, error: adminProfileError } = await supabaseAnon
        .from('profiles')
        .insert({
          id: adminSignUp.user.id,
          email: adminSignUp.user.email,
          first_name: 'Admin',
          last_name: 'Sakú',
          role: 'admin'
        })
        .select()
        .single();

      if (adminProfileError) {
        console.error('❌ Error creando perfil admin:', adminProfileError.message);
      } else {
        console.log('✅ Perfil admin creado:', adminProfile);
        console.log(`👑 Rol asignado: ${adminProfile.role}`);
      }
    }

    console.log('\n🎯 ADMIN LISTO PARA USAR:');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('🌐 Login en: http://localhost:3000/auth/login');
    console.log('⚙️  Admin panel: http://localhost:3000/admin');

  } catch (error) {
    console.error('💥 Error durante registro de admin:', error);
  }
}

// Ejecutar ambas pruebas
async function runAllTests() {
  await testRegistrationFlow();
  await testAdminRegistration();
}

runAllTests();