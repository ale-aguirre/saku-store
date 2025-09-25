const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function applyAuthFix() {
  console.log('🔧 APLICANDO CORRECCIÓN DE AUTENTICACIÓN\n');

  try {
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250123000010_fix_auth_trigger_and_constraints.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('1️⃣ Aplicando migración de corrección...');

    // Dividir el SQL en statements individuales
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`Ejecutando statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.log(`⚠️ Error en statement ${i + 1}:`, error.message);
            // Continuar con el siguiente statement
          } else {
            console.log(`✅ Statement ${i + 1} ejecutado exitosamente`);
          }
        } catch (err) {
          console.log(`⚠️ Error ejecutando statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n2️⃣ Verificando que el trigger esté funcionando...');

    // Probar creación de usuario
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: 'test123456',
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Error creando usuario de prueba:', authError.message);
      
      // Intentar con signUp normal
      console.log('Probando con signUp normal...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: 'test123456'
      });

      if (signUpError) {
        console.error('❌ Error con signUp:', signUpError.message);
      } else {
        console.log('✅ SignUp exitoso, verificando perfil...');
        
        if (signUpData.user) {
          // Esperar un momento para que el trigger se ejecute
          await new Promise(resolve => setTimeout(resolve, 2000));
          
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
        }
      }
    } else {
      console.log('✅ Usuario creado exitosamente');
      
      // Verificar si se creó el perfil
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single();

      if (profileError) {
        console.error('❌ No se creó el perfil automáticamente:', profileError.message);
      } else {
        console.log('✅ Perfil creado automáticamente:', profile);
      }

      // Limpiar usuario de prueba
      await supabase.auth.admin.deleteUser(authUser.user.id);
      console.log('🧹 Usuario de prueba eliminado');
    }

    console.log('\n🎯 CORRECCIÓN APLICADA');
    console.log('🌐 Ahora puedes probar el registro en: http://localhost:3000/auth/register');
    console.log('📧 Usa el email: aguirrealexis.cba@gmail.com para obtener rol de admin');

  } catch (error) {
    console.error('💥 Error aplicando la corrección:', error);
  }
}

applyAuthFix();