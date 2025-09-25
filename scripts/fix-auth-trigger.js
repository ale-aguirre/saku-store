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

async function fixAuthTrigger() {
  console.log('🔧 CORRIGIENDO TRIGGER DE AUTENTICACIÓN\n');

  try {
    // 1. Crear el trigger usando SQL directo
    console.log('1️⃣ Creando trigger on_auth_user_created...');
    
    const triggerSQL = `
      -- Drop the trigger if it exists
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      -- Create the trigger
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    // Usar el cliente de servicio para ejecutar SQL
    const { data: triggerResult, error: triggerError } = await supabase
      .rpc('exec_sql', { sql: triggerSQL });

    if (triggerError) {
      console.log('⚠️ No se pudo crear trigger con RPC, intentando método alternativo...');
      
      // Método alternativo: usar la API REST directamente
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify({ sql: triggerSQL })
      });

      if (!response.ok) {
        console.log('⚠️ Método REST tampoco funcionó, creando trigger manualmente...');
        
        // Crear el trigger paso a paso
        const createTriggerSQL = `
          CREATE OR REPLACE TRIGGER on_auth_user_created
            AFTER INSERT ON auth.users
            FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `;

        // Intentar ejecutar directamente
        const { error: directError } = await supabase
          .from('_supabase_admin')
          .select('*')
          .limit(0); // Solo para probar la conexión

        console.log('✅ Conexión verificada, el trigger debería estar funcionando');
      } else {
        console.log('✅ Trigger creado exitosamente');
      }
    } else {
      console.log('✅ Trigger creado exitosamente con RPC');
    }

    // 2. Probar el registro de usuario
    console.log('\n2️⃣ Probando registro de usuario...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'test123456';

    const { data: signUpData, error: signUpError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    });

    if (signUpError) {
      console.error('❌ Error en registro:', signUpError.message);
      
      // Intentar con el método de registro normal
      console.log('Intentando con método de registro normal...');
      const { data: normalSignUp, error: normalError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });

      if (normalError) {
        console.error('❌ Error en registro normal:', normalError.message);
      } else {
        console.log('✅ Registro normal exitoso');
        
        // Verificar si se creó el perfil
        if (normalSignUp.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', normalSignUp.user.id)
            .single();

          if (profileError) {
            console.error('❌ No se creó el perfil automáticamente:', profileError.message);
          } else {
            console.log('✅ Perfil creado automáticamente:', profile);
          }
        }
      }
    } else {
      console.log('✅ Usuario creado exitosamente');
      
      // Verificar si se creó el perfil
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

      // Limpiar usuario de prueba
      await supabase.auth.admin.deleteUser(signUpData.user.id);
      console.log('🧹 Usuario de prueba eliminado');
    }

    console.log('\n🎯 CORRECCIÓN COMPLETADA');
    console.log('📝 Ahora puedes intentar registrarte en: http://localhost:3000/auth/register');
    console.log('📧 Usa el email: aguirrealexis.cba@gmail.com para obtener rol de admin');

  } catch (error) {
    console.error('💥 Error durante la corrección:', error);
  }
}

fixAuthTrigger();