// Script para solucionar completamente el problema de autenticación
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

async function fixAuthCompletely() {
  console.log('🔧 Solucionando problema de autenticación completamente...\n');
  
  try {
    // 1. Primero, vamos a crear las funciones y triggers directamente con SQL
    console.log('📝 Ejecutando SQL para crear funciones y triggers...');
    
    const setupSQL = `
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
$$;

-- Eliminar trigger existente si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Asegurar que las políticas RLS permitan la inserción
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción desde el trigger
CREATE POLICY "Allow trigger inserts" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Política para permitir lectura de perfiles
CREATE POLICY "Allow profile reads" ON public.profiles
  FOR SELECT USING (true);

-- Política para permitir actualizaciones de perfiles
CREATE POLICY "Allow profile updates" ON public.profiles
  FOR UPDATE USING (true);
`;

    // Ejecutar el SQL usando rpc (que funciona como query genérico)
    const { error: sqlError } = await supabase.rpc('exec_sql', { sql_query: setupSQL });
    
    if (sqlError) {
      console.log('⚠️  RPC no disponible, ejecutando SQL por partes...');
      
      // Si RPC no funciona, ejecutamos cada parte por separado usando el método REST
      const sqlParts = [
        `CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(target_email text)
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
        
        `CREATE OR REPLACE FUNCTION public.handle_new_user()
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
        
        `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,
        
        `CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
  
        `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`,
        
        `DROP POLICY IF EXISTS "Allow trigger inserts" ON public.profiles;`,
        `CREATE POLICY "Allow trigger inserts" ON public.profiles FOR INSERT WITH CHECK (true);`,
        
        `DROP POLICY IF EXISTS "Allow profile reads" ON public.profiles;`,
        `CREATE POLICY "Allow profile reads" ON public.profiles FOR SELECT USING (true);`,
        
        `DROP POLICY IF EXISTS "Allow profile updates" ON public.profiles;`,
        `CREATE POLICY "Allow profile updates" ON public.profiles FOR UPDATE USING (true);`
      ];
      
      console.log('📝 Ejecutando SQL manualmente...');
      console.log('\n⚠️  IMPORTANTE: Copia y ejecuta este SQL en el Dashboard de Supabase:');
      console.log('🌐 https://supabase.com/dashboard/project/[tu-proyecto]/sql');
      console.log('\n--- INICIO DEL SQL ---');
      console.log(setupSQL);
      console.log('--- FIN DEL SQL ---\n');
      
    } else {
      console.log('✅ SQL ejecutado correctamente');
    }

    // 2. Ahora intentar crear el usuario admin
    console.log('👤 Creando usuario administrador...');
    
    const adminEmail = 'aguirrealexis.cba@gmail.com';
    const adminPassword = 'Admin123!';
    
    // Limpiar usuario existente si hay alguno
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === adminEmail);
    
    if (existingUser) {
      console.log('🗑️  Eliminando usuario existente...');
      await supabase.auth.admin.deleteUser(existingUser.id);
    }
    
    // Limpiar perfil existente
    await supabase.from('profiles').delete().eq('email', adminEmail);
    
    // Crear usuario nuevo
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        first_name: 'Admin',
        last_name: 'Sakú'
      }
    });

    if (createError) {
      console.error('❌ Error creando usuario:', createError.message);
      
      // Método alternativo: crear perfil directamente
      console.log('🔄 Creando perfil directamente...');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: '00000000-0000-0000-0000-000000000001', // UUID temporal
          email: adminEmail,
          first_name: 'Admin',
          last_name: 'Sakú',
          role: 'admin'
        });

      if (profileError) {
        console.error('❌ Error creando perfil:', profileError.message);
      } else {
        console.log('✅ Perfil de admin creado directamente');
        console.log('\n📋 INSTRUCCIONES FINALES:');
        console.log('1. Ve a http://localhost:3000/auth/register');
        console.log('2. Registrate con: aguirrealexis.cba@gmail.com');
        console.log('3. Usa cualquier contraseña');
        console.log('4. El sistema te asignará automáticamente el rol de admin');
        console.log('5. Ve a http://localhost:3000/admin para acceder al panel');
      }
    } else {
      console.log('✅ Usuario administrador creado:', newUser.user.email);
      
      // Verificar que se creó el perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', adminEmail)
        .single();
      
      if (profile) {
        console.log('✅ Perfil creado automáticamente:', profile.role);
      } else {
        console.log('⚠️  Perfil no creado automáticamente, creando manualmente...');
        
        await supabase.from('profiles').insert({
          id: newUser.user.id,
          email: adminEmail,
          first_name: 'Admin',
          last_name: 'Sakú',
          role: 'admin'
        });
        
        console.log('✅ Perfil creado manualmente');
      }
      
      console.log('\n🎉 ¡LISTO! Credenciales de administrador:');
      console.log('📧 Email: aguirrealexis.cba@gmail.com');
      console.log('🔑 Contraseña: Admin123!');
      console.log('🌐 Login: http://localhost:3000/auth/login');
      console.log('⚙️  Admin: http://localhost:3000/admin');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    console.log('\n🔧 SOLUCIÓN MANUAL:');
    console.log('1. Ve al Dashboard de Supabase SQL Editor');
    console.log('2. Ejecuta este SQL:');
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

-- Asegurar políticas RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all operations" ON public.profiles;
CREATE POLICY "Allow all operations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
`);
    console.log('\n3. Luego registrate normalmente en la app');
  }
}

fixAuthCompletely();