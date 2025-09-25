const fetch = require('node-fetch');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

async function executeSQL(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function directSQLFix() {
  console.log('🔧 APLICANDO CORRECCIÓN DIRECTA CON SQL\n');

  try {
    // 1. Recrear la función handle_new_user
    console.log('1️⃣ Recreando función handle_new_user...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, role, created_at, updated_at)
        VALUES (
          NEW.id,
          NEW.email,
          CASE 
            WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'
            ELSE 'customer'
          END,
          NOW(),
          NOW()
        );
        
        RETURN NEW;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'Error in handle_new_user: %', SQLERRM;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
      await executeSQL(createFunctionSQL);
      console.log('✅ Función handle_new_user recreada');
    } catch (error) {
      console.log('⚠️ Error recreando función:', error.message);
    }

    // 2. Recrear el trigger
    console.log('\n2️⃣ Recreando trigger...');
    
    const dropTriggerSQL = `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`;
    const createTriggerSQL = `
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    try {
      await executeSQL(dropTriggerSQL);
      await executeSQL(createTriggerSQL);
      console.log('✅ Trigger recreado');
    } catch (error) {
      console.log('⚠️ Error recreando trigger:', error.message);
    }

    // 3. Configurar permisos
    console.log('\n3️⃣ Configurando permisos...');
    
    const permissionsSQL = `
      GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
      GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
      GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
    `;

    try {
      await executeSQL(permissionsSQL);
      console.log('✅ Permisos configurados');
    } catch (error) {
      console.log('⚠️ Error configurando permisos:', error.message);
    }

    console.log('\n🎯 CORRECCIÓN APLICADA');
    
  } catch (error) {
    console.error('💥 Error en la corrección directa:', error.message);
    
    // Si la API REST no funciona, intentemos un enfoque diferente
    console.log('\n🔄 Intentando enfoque alternativo...');
    
    // Usar el cliente de Supabase para crear una función que ejecute SQL
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Intentar crear la función directamente en la base de datos
    console.log('Creando función de utilidad para ejecutar SQL...');
    
    try {
      // Primero, vamos a verificar si podemos acceder a la tabla profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .single();

      if (error) {
        console.error('❌ Error accediendo a profiles:', error.message);
      } else {
        console.log('✅ Acceso a profiles verificado');
        
        // Ahora vamos a intentar crear un usuario de prueba manualmente
        console.log('\n🧪 Probando creación manual de perfil...');
        
        // Generar un UUID válido
        const testUUID = crypto.randomUUID();
        const testEmail = `manual-test-${Date.now()}@example.com`;
        
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
          console.error('❌ Error insertando perfil manualmente:', insertError.message);
          
          // El problema podría estar en que necesitamos crear el usuario en auth.users primero
          console.log('\n💡 El problema es que necesitamos crear el usuario en auth.users primero');
          console.log('Esto confirma que el trigger no está funcionando correctamente');
          
        } else {
          console.log('✅ Perfil insertado manualmente:', insertData);
          
          // Limpiar
          await supabase.from('profiles').delete().eq('id', testUUID);
          console.log('🧹 Perfil de prueba eliminado');
        }
      }
      
    } catch (err) {
      console.error('💥 Error en enfoque alternativo:', err.message);
    }
  }

  console.log('\n📋 RESUMEN DEL PROBLEMA:');
  console.log('1. El trigger on_auth_user_created no se está ejecutando correctamente');
  console.log('2. La función handle_new_user podría no estar creada o tener errores');
  console.log('3. Los permisos podrían no estar configurados correctamente');
  console.log('4. Supabase Auth podría tener un problema de configuración');
  
  console.log('\n🔧 PRÓXIMOS PASOS:');
  console.log('1. Verificar la configuración de Supabase Auth en el dashboard');
  console.log('2. Revisar los logs de la base de datos');
  console.log('3. Considerar crear los perfiles manualmente como workaround temporal');
}

directSQLFix();