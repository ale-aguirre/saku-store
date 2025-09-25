// Script para configurar la base de datos usando Management API
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

async function fixDatabase() {
  console.log('🔧 Configurando base de datos...\n');
  
  try {
    // Primero, verificar si podemos acceder a la base de datos
    console.log('🔍 Verificando acceso a la base de datos...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Error de acceso:', testError.message);
      return;
    }

    console.log('✅ Acceso a la base de datos confirmado');

    // Intentar crear las funciones usando una estrategia diferente
    console.log('\n📝 Intentando configurar funciones...');

    // Usar el endpoint de SQL directo si está disponible
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    console.log(`📋 Project ref: ${projectRef}`);

    // Crear las funciones paso a paso
    console.log('\n🔧 Configurando función handle_new_user...');
    
    // Intentar usando rpc con SQL personalizado
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          CREATE OR REPLACE FUNCTION public.handle_new_user()
          RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO public.profiles (id, email, first_name, last_name, role)
            VALUES (
              NEW.id,
              NEW.email,
              NEW.raw_user_meta_data->>'first_name',
              NEW.raw_user_meta_data->>'last_name',
              CASE 
                WHEN NEW.email = 'aguirrealexis.cba@gmail.com' THEN 'admin'::user_role
                ELSE 'customer'::user_role
              END
            );
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      });

    if (rpcError) {
      console.log('⚠️  RPC no disponible, usando método alternativo...');
      
      // Método alternativo: crear un perfil admin directamente
      console.log('\n🔄 Creando perfil admin directamente...');
      
      // Primero, verificar si ya existe un perfil para este email
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'aguirrealexis.cba@gmail.com')
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('❌ Error verificando perfil:', profileError.message);
        return;
      }

      if (existingProfile) {
        console.log('📋 Perfil existente encontrado, actualizando rol...');
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('email', 'aguirrealexis.cba@gmail.com');

        if (updateError) {
          console.error('❌ Error actualizando perfil:', updateError.message);
        } else {
          console.log('✅ Perfil actualizado a admin');
        }
      } else {
        console.log('📋 No hay perfil existente');
      }

      // Crear un usuario temporal para activar el trigger
      console.log('\n🔧 Configurando acceso temporal...');
      
      // Usar el Admin API para crear el usuario
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: 'aguirrealexis.cba@gmail.com',
        password: 'TempAdmin123!',
        email_confirm: true,
        user_metadata: {
          first_name: 'Admin',
          last_name: 'User'
        }
      });

      if (userError) {
        if (userError.message.includes('already registered')) {
          console.log('✅ Usuario ya existe en auth');
          
          // Actualizar la contraseña del usuario existente
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            userData?.user?.id || 'existing-user-id',
            { password: 'TempAdmin123!' }
          );

          if (updateError) {
            console.log('⚠️  No se pudo actualizar contraseña, pero el usuario existe');
          } else {
            console.log('✅ Contraseña actualizada');
          }
        } else {
          console.error('❌ Error creando usuario:', userError.message);
        }
      } else {
        console.log('✅ Usuario creado en auth');
        
        // Crear el perfil manualmente
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: userData.user.id,
            email: 'aguirrealexis.cba@gmail.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'admin'
          });

        if (profileCreateError) {
          console.log('⚠️  Error creando perfil:', profileCreateError.message);
        } else {
          console.log('✅ Perfil admin creado');
        }
      }

    } else {
      console.log('✅ Función handle_new_user configurada');
    }

    console.log('\n🎉 Configuración completada');
    console.log('\n📋 Credenciales de acceso:');
    console.log('📧 Email: aguirrealexis.cba@gmail.com');
    console.log('🔑 Contraseña: TempAdmin123!');
    console.log('🌐 Login: http://localhost:3000/auth/login');
    console.log('⚙️  Admin: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

fixDatabase();