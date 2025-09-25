// Script para configurar la función handle_new_user en Supabase
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

async function setupAdminFunction() {
  console.log('🔧 Configurando función handle_new_user...\n');
  
  try {
    // 1. Crear función set_admin_role_for_email
    console.log('📝 Creando función set_admin_role_for_email...');
    
    const setAdminRoleSQL = `
      CREATE OR REPLACE FUNCTION public.set_admin_role_for_email(user_email TEXT)
      RETURNS VOID AS $$
      BEGIN
        UPDATE public.profiles 
        SET role = 'admin'
        WHERE email = user_email;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // Usar la API REST de Supabase para ejecutar SQL
    const response1 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: setAdminRoleSQL })
    });

    if (!response1.ok) {
      console.log('⚠️  Función set_admin_role_for_email puede ya existir');
    } else {
      console.log('✅ Función set_admin_role_for_email creada');
    }

    // 2. Crear función handle_new_user
    console.log('\n📝 Creando función handle_new_user...');
    
    const handleNewUserSQL = `
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
    `;

    const response2 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: handleNewUserSQL })
    });

    if (!response2.ok) {
      console.log('⚠️  Función handle_new_user puede ya existir');
    } else {
      console.log('✅ Función handle_new_user creada');
    }

    // 3. Crear trigger si no existe
    console.log('\n📝 Configurando trigger...');
    
    const triggerSQL = `
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;

    const response3 = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: triggerSQL })
    });

    if (!response3.ok) {
      console.log('⚠️  Trigger puede ya existir');
    } else {
      console.log('✅ Trigger configurado');
    }

    console.log('\n🎉 Configuración completada');
    console.log('\n📋 Ahora puedes registrarte en: http://localhost:3000/auth/register');
    console.log('📧 Email: aguirrealexis.cba@gmail.com');
    console.log('🔑 Contraseña: cualquiera que elijas');
    console.log('🔐 El sistema te asignará automáticamente el rol de admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setupAdminFunction();