import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const _supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filename) {
  console.log(`\n📄 Processing migration: ${filename}`);
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', filename);
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('Please execute the following SQL in your Supabase SQL editor:');
  console.log('=' .repeat(60));
  console.log(sql);
  console.log('=' .repeat(60));
  console.log(`\n✅ Migration ${filename} ready for execution\n`);
}

async function main() {
  try {
    console.log('🚀 Setting up Sakú Lencería database...\n');
    
    // Display migrations for manual execution
    await runMigration('001_initial_schema.sql');
    await runMigration('002_rls_policies.sql');
    await runMigration('003_seed_data.sql');
    
    console.log('📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute each migration SQL shown above in order');
    console.log('4. Verify tables are created successfully');
    console.log('\n🎉 Database setup instructions completed!');
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  }
}

main();