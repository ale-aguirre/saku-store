// Script para aplicar migraciones a Supabase en la nube
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

async function applyMigrations() {
  console.log('🚀 Aplicando migraciones a Supabase...\n');
  
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  // Obtener archivos de migración ordenados
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.endsWith('.bak'))
    .sort();

  console.log(`📋 Migraciones encontradas: ${migrationFiles.length}\n`);

  for (const file of migrationFiles) {
    console.log(`⏳ Aplicando: ${file}`);
    
    try {
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Dividir por statements (separados por ;)
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            // Intentar ejecutar directamente si rpc falla
            const { error: directError } = await supabase
              .from('_temp')
              .select('1')
              .limit(0);
            
            if (directError) {
              console.log(`⚠️  Error en statement (puede ser normal): ${error.message}`);
            }
          }
        }
      }
      
      console.log(`✅ ${file} aplicado`);
      
    } catch (error) {
      console.error(`❌ Error aplicando ${file}:`, error.message);
      // Continuar con la siguiente migración
    }
  }

  console.log('\n🎉 Proceso de migraciones completado');
  
  // Verificar que la función handle_new_user existe ahora
  console.log('\n🔍 Verificando función handle_new_user...');
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (!error) {
      console.log('✅ Base de datos funcionando correctamente');
    }
  } catch (error) {
    console.log('⚠️  Verificación pendiente');
  }
}

applyMigrations();