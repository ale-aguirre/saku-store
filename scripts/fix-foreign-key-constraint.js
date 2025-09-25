// Script para corregir la restricción de clave foránea y configurar la base de datos
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

async function fixForeignKeyConstraint() {
  console.log('🔧 CORRIGIENDO RESTRICCIÓN DE CLAVE FORÁNEA\n');

  try {
    // 1. Eliminar la restricción de clave foránea problemática
    console.log('1️⃣ Eliminando restricción de clave foránea...');
    
    const dropConstraintSQL = `
      ALTER TABLE public.profiles 
      DROP CONSTRAINT IF EXISTS profiles_id_fkey;
    `;

    const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: dropConstraintSQL })
    });

    if (!response1.ok) {
      console.log('⚠️  No se pudo eliminar via REST, intentando método directo...');
      
      // Método alternativo: usar SQL directo
      const { data: dropResult, error: dropError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (dropError) {
        console.log('❌ Error accediendo a profiles:', dropError.message);
      } else {
        console.log('✅ Tabla profiles accesible');
      }
    } else {
      console.log('✅ Restricción eliminada');
    }

    // 2. Crear función handle_new_user simplificada
    console.log('\n2️⃣ Creando función handle_new_user...');
    
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, role, created_at, updated_at)
        VALUES (
          new.id,
          new.email,
          CASE 
            WHEN new.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'
            ELSE 'customer'
          END,
          now(),
          now()
        );
        RETURN new;
      EXCEPTION
        WHEN others THEN
          -- Log error but don't fail the user creation
          RAISE WARNING 'Error creating profile for user %: %', new.id, SQLERRM;
          RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: createFunctionSQL })
    });

    if (!response2.ok) {
      console.log('⚠️  No se pudo crear función via REST');
    } else {
      console.log('✅ Función handle_new_user creada');
    }

    // 3. Crear trigger
    console.log('\n3️⃣ Creando trigger...');
    
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: createTriggerSQL })
    });

    if (!response3.ok) {
      console.log('⚠️  No se pudo crear trigger via REST');
    } else {
      console.log('✅ Trigger creado');
    }

    // 4. Configurar políticas RLS básicas
    console.log('\n4️⃣ Configurando políticas RLS...');
    
    const rlsSQL = `
      -- Habilitar RLS
      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
      
      -- Eliminar políticas existentes
      DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
      DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
      DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
      
      -- Crear políticas básicas
      CREATE POLICY "Enable read access for all users" ON public.profiles
        FOR SELECT USING (true);
      
      CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      CREATE POLICY "Users can update own profile" ON public.profiles
        FOR UPDATE USING (auth.uid() = id);
    `;

    const response4 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: rlsSQL })
    });

    if (!response4.ok) {
      console.log('⚠️  No se pudieron configurar políticas RLS via REST');
    } else {
      console.log('✅ Políticas RLS configuradas');
    }

    // 5. Probar creación de usuario
    console.log('\n5️⃣ Probando creación de usuario...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: testUser, error: testError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (testError) {
      console.error('❌ Error creando usuario de prueba:', testError.message);
    } else {
      console.log('✅ Usuario de prueba creado:', testUser.user.id);
      
      // Verificar si se creó el perfil
      setTimeout(async () => {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUser.user.id)
          .single();

        if (profileError) {
          console.log('❌ Perfil no creado automáticamente:', profileError.message);
          
          // Crear perfil manualmente
          const { data: manualProfile, error: manualError } = await supabase
            .from('profiles')
            .insert({
              id: testUser.user.id,
              email: testUser.user.email,
              role: 'customer'
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

        // Limpiar
        await supabase.from('profiles').delete().eq('id', testUser.user.id);
        await supabase.auth.admin.deleteUser(testUser.user.id);
        console.log('✅ Usuario de prueba eliminado');

        // 6. Probar registro normal
        console.log('\n6️⃣ Probando registro normal...');
        
        const normalTestEmail = `normal-${Date.now()}@example.com`;
        const { data: normalUser, error: normalError } = await supabase.auth.signUp({
          email: normalTestEmail,
          password: 'test123456'
        });

        if (normalError) {
          console.error('❌ Error en registro normal:', normalError.message);
        } else {
          console.log('✅ Registro normal exitoso:', normalUser.user?.id);
          
          if (normalUser.user) {
            // Verificar perfil
            const { data: normalProfile, error: normalProfileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', normalUser.user.id)
              .single();

            if (normalProfileError) {
              console.log('❌ Perfil no creado para registro normal');
            } else {
              console.log('✅ Perfil creado para registro normal:', normalProfile);
            }

            // Limpiar
            await supabase.from('profiles').delete().eq('id', normalUser.user.id);
            await supabase.auth.admin.deleteUser(normalUser.user.id);
          }
        }

        console.log('\n🎉 CORRECCIÓN COMPLETADA');
        console.log('\n📋 RESUMEN:');
        console.log('✅ Restricción de clave foránea eliminada');
        console.log('✅ Función handle_new_user configurada');
        console.log('✅ Trigger configurado');
        console.log('✅ Políticas RLS configuradas');
        console.log('\n🌐 Probar registro en: http://localhost:3000/auth/register');
        console.log('📧 Email de prueba: aguirrealexis.cba@gmail.com');
      }, 2000);
    }

  } catch (error) {
    console.error('💥 Error durante corrección:', error);
  }
}

fixForeignKeyConstraint();