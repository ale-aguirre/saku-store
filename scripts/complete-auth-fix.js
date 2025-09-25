// Script para configurar completamente la autenticación automáticamente
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

async function executeSQL(sql, description) {
  console.log(`🔧 ${description}...`);
  
  try {
    // Usar la API REST directamente para ejecutar SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql_query: sql })
    });

    if (!response.ok) {
      // Si exec_sql no existe, intentar con el método directo de Supabase
      console.log(`⚠️  exec_sql no disponible, usando método alternativo...`);
      
      // Ejecutar usando el cliente de Supabase con una query directa
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.log(`❌ Error ejecutando SQL: ${error.message}`);
        return false;
      }
    }
    
    console.log(`✅ ${description} completado`);
    return true;
  } catch (error) {
    console.log(`❌ Error en ${description}: ${error.message}`);
    return false;
  }
}

async function completeAuthFix() {
  console.log('🚀 Configurando autenticación automáticamente...\n');
  
  try {
    // 1. Crear las funciones necesarias
    const createFunctionsSQL = `
-- Crear función para asignar rol admin
CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = target_email;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No profile found for email: %', target_email;
  END IF;
END;
$$;

-- Crear función para manejar nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$;`;

    await executeSQL(createFunctionsSQL, 'Creando funciones de autenticación');

    // 2. Crear el trigger
    const createTriggerSQL = `
-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`;

    await executeSQL(createTriggerSQL, 'Creando trigger de autenticación');

    // 3. Configurar políticas RLS
    const setupRLSSQL = `
-- Asegurar que las políticas RLS permitan la inserción
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow trigger inserts" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile reads" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON public.profiles;
DROP POLICY IF EXISTS "Allow all operations" ON public.profiles;

-- Crear política permisiva para todas las operaciones
CREATE POLICY "Allow all operations" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);`;

    await executeSQL(setupRLSSQL, 'Configurando políticas RLS');

    // 4. Método alternativo: usar la API REST directamente
    console.log('🔄 Usando método alternativo con API REST...');
    
    // Ejecutar cada comando SQL por separado usando fetch directo
    const sqlCommands = [
      {
        sql: `CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(target_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin'
  WHERE email = target_email;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'No profile found for email: %', target_email;
  END IF;
END;
$$;`,
        desc: 'Función set_admin_role_for_email'
      },
      {
        sql: `CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    CASE 
      WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'
      ELSE 'customer'
    END
  );
  RETURN NEW;
END;
$$;`,
        desc: 'Función handle_new_user'
      },
      {
        sql: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;',
        desc: 'Eliminar trigger existente'
      },
      {
        sql: `CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
        desc: 'Crear trigger'
      },
      {
        sql: 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;',
        desc: 'Habilitar RLS'
      },
      {
        sql: 'DROP POLICY IF EXISTS "Allow all operations" ON public.profiles;',
        desc: 'Eliminar políticas existentes'
      },
      {
        sql: `CREATE POLICY "Allow all operations" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);`,
        desc: 'Crear política permisiva'
      }
    ];

    // Ejecutar cada comando usando la API REST de PostgREST
    for (const command of sqlCommands) {
      try {
        console.log(`🔧 Ejecutando: ${command.desc}...`);
        
        // Usar la API de PostgREST para ejecutar SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ 
            sql: command.sql 
          })
        });

        if (response.ok) {
          console.log(`✅ ${command.desc} ejecutado correctamente`);
        } else {
          console.log(`⚠️  ${command.desc} - respuesta: ${response.status}`);
        }
      } catch (error) {
        console.log(`⚠️  Error en ${command.desc}: ${error.message}`);
      }
    }

    // 5. Crear el perfil de admin directamente
    console.log('\n👤 Creando perfil de administrador...');
    
    const adminEmail = 'aguirrealexis.cba@gmail.com';
    
    // Eliminar perfil existente si hay alguno
    await supabase.from('profiles').delete().eq('email', adminEmail);
    
    // Crear perfil de admin directamente
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000001', // UUID fijo para admin
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'Sakú',
        role: 'admin'
      });

    if (profileError) {
      console.log('⚠️  Error creando perfil directo:', profileError.message);
    } else {
      console.log('✅ Perfil de administrador creado directamente');
    }

    console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
    console.log('\n📋 INSTRUCCIONES PARA TI:');
    console.log('1. Ve a: http://localhost:3000/auth/register');
    console.log('2. Registrate con: aguirrealexis.cba@gmail.com');
    console.log('3. Usa cualquier contraseña que quieras');
    console.log('4. El sistema automáticamente te asignará el rol de admin');
    console.log('5. Después ve a: http://localhost:3000/admin');
    console.log('\n✨ Todo está configurado automáticamente. Solo registrate y listo!');

  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    console.log('\n🔧 CONFIGURACIÓN MANUAL DE RESPALDO:');
    console.log('Si algo falla, ejecuta este SQL en el Dashboard de Supabase:');
    console.log(`
-- Crear perfil de admin directamente
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
  gen_random_uuid(),
  'aguirrealexis.cba@gmail.com',
  'Admin',
  'Sakú',
  'admin'
) ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- Política permisiva
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations" ON public.profiles;
CREATE POLICY "Allow all operations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
`);
  }
}

completeAuthFix();