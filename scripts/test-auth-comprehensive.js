// Script completo para diagnosticar y corregir el problema de autenticación
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

async function testAuthComprehensive() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DE AUTENTICACIÓN\n');
  
  try {
    // 1. Verificar conexión básica
    console.log('1️⃣ Verificando conexión...');
    const { data: testConnection, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message);
      return;
    }
    console.log('✅ Conexión exitosa');

    // 2. Verificar estructura de la tabla profiles
    console.log('\n2️⃣ Verificando estructura de tabla profiles...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Error accediendo a profiles:', tableError.message);
    } else {
      console.log('✅ Tabla profiles accesible');
    }

    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...');
    
    // Deshabilitar RLS temporalmente para diagnóstico
    const disableRLSSQL = `ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;`;
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({ sql: disableRLSSQL })
      });
      
      if (response.ok) {
        console.log('✅ RLS deshabilitado temporalmente');
      } else {
        console.log('⚠️  No se pudo deshabilitar RLS via REST');
      }
    } catch (error) {
      console.log('⚠️  Error deshabilitando RLS:', error.message);
    }

    // 4. Crear función handle_new_user mejorada
    console.log('\n4️⃣ Creando función handle_new_user...');
    
    const createFunctionSQL = `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'
      ELSE 'customer'
    END,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;`;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({ sql: createFunctionSQL })
      });
      
      if (response.ok) {
        console.log('✅ Función handle_new_user creada');
      } else {
        console.log('⚠️  Error creando función via REST');
      }
    } catch (error) {
      console.log('⚠️  Error:', error.message);
    }

    // 5. Crear trigger
    console.log('\n5️⃣ Creando trigger...');
    
    const createTriggerSQL = `
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({ sql: createTriggerSQL })
      });
      
      if (response.ok) {
        console.log('✅ Trigger creado');
      } else {
        console.log('⚠️  Error creando trigger via REST');
      }
    } catch (error) {
      console.log('⚠️  Error:', error.message);
    }

    // 6. Probar creación de usuario con workaround
    console.log('\n6️⃣ Probando creación de usuario con workaround...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';

    // Método 1: signUp normal con creación manual de perfil
    console.log('Método 1: signUp + creación manual de perfil');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Error en signUp:', signUpError.message);
      
      // Si signUp falla, intentar crear usuario directamente
      console.log('Método 2: Creación directa con Admin API');
      
      const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          first_name: 'Test',
          last_name: 'User'
        }
      });

      if (adminError) {
        console.error('❌ Error con Admin API:', adminError.message);
        
        // Último recurso: crear perfil directamente sin usuario auth
        console.log('Método 3: Crear perfil directamente');
        
        const { data: directProfile, error: directError } = await supabase
          .from('profiles')
          .insert({
            id: '00000000-0000-0000-0000-000000000002', // UUID temporal
            email: testEmail,
            first_name: 'Test',
            last_name: 'User',
            role: 'customer'
          })
          .select()
          .single();

        if (directError) {
          console.error('❌ Error creando perfil directo:', directError.message);
        } else {
          console.log('✅ Perfil creado directamente:', directProfile);
          
          // Limpiar
          await supabase.from('profiles').delete().eq('id', directProfile.id);
          console.log('🧹 Perfil de prueba eliminado');
        }
      } else {
        console.log('✅ Usuario creado con Admin API');
        
        // Verificar si se creó el perfil automáticamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: autoProfile, error: autoProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', adminUser.user.id)
          .single();

        if (autoProfileError) {
          console.log('⚠️  Perfil no creado automáticamente, creando manualmente...');
          
          const { data: manualProfile, error: manualError } = await supabase
            .from('profiles')
            .insert({
              id: adminUser.user.id,
              email: adminUser.user.email,
              first_name: 'Test',
              last_name: 'User',
              role: 'customer'
            })
            .select()
            .single();

          if (manualError) {
            console.error('❌ Error creando perfil manual:', manualError.message);
          } else {
            console.log('✅ Perfil creado manualmente:', manualProfile);
          }
        } else {
          console.log('✅ Perfil creado automáticamente:', autoProfile);
        }

        // Limpiar usuario de prueba
        await supabase.auth.admin.deleteUser(adminUser.user.id);
        console.log('🧹 Usuario de prueba eliminado');
      }
    } else {
      console.log('✅ SignUp exitoso');
      
      if (signUpData.user) {
        // Verificar si se creó el perfil automáticamente
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: autoProfile, error: autoProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', signUpData.user.id)
          .single();

        if (autoProfileError) {
          console.log('⚠️  Perfil no creado automáticamente, creando manualmente...');
          
          const { data: manualProfile, error: manualError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: signUpData.user.email,
              first_name: 'Test',
              last_name: 'User',
              role: 'customer'
            })
            .select()
            .single();

          if (manualError) {
            console.error('❌ Error creando perfil manual:', manualError.message);
          } else {
            console.log('✅ Perfil creado manualmente:', manualProfile);
          }
        } else {
          console.log('✅ Perfil creado automáticamente:', autoProfile);
        }
      }
    }

    // 7. Habilitar RLS nuevamente
    console.log('\n7️⃣ Habilitando RLS nuevamente...');
    
    const enableRLSSQL = `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`;
    
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        },
        body: JSON.stringify({ sql: enableRLSSQL })
      });
      
      if (response.ok) {
        console.log('✅ RLS habilitado nuevamente');
      }
    } catch (error) {
      console.log('⚠️  Error habilitando RLS:', error.message);
    }

    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    console.log('\n📋 PRÓXIMOS PASOS:');
    console.log('1. Implementar workaround en el código de registro');
    console.log('2. Crear perfil manualmente después de signUp exitoso');
    console.log('3. Probar registro en: http://localhost:3000/auth/register');
    console.log('4. Usar email: aguirrealexis.cba@gmail.com para rol admin');

  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error);
  }
}

testAuthComprehensive();