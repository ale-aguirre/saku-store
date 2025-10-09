#!/usr/bin/env node

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesTable() {
  try {
    console.log('🔍 Checking profiles table...');
    
    // Intentar acceder directamente a la tabla profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    if (profilesError) {
      console.error('❌ Error accessing profiles table:', profilesError);
      
      // Si la tabla no existe, verificar si hay usuarios en auth.users
      console.log('\n🔍 Checking auth.users table...');
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('❌ Error accessing auth.users:', usersError);
      } else {
        console.log(`✅ Found ${users.users.length} user(s) in auth.users:`);
        users.users.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}, Created: ${user.created_at}`);
        });
      }
      return;
    }
    
    console.log('✅ Table "profiles" exists and is accessible');
    console.log(`👥 Found ${profiles.length} profile(s):`);
    
    if (profiles.length > 0) {
      profiles.forEach(profile => {
        console.log(`  - ID: ${profile.id}`);
        console.log(`    Email: ${profile.email || 'N/A'}`);
        console.log(`    Role: ${profile.role || 'N/A'}`);
        console.log(`    Created: ${profile.created_at || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('  No profiles found');
      
      // Verificar usuarios en auth.users
      console.log('\n🔍 Checking auth.users for comparison...');
      const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        console.error('❌ Error accessing auth.users:', usersError);
      } else {
        console.log(`✅ Found ${users.users.length} user(s) in auth.users:`);
        users.users.forEach(user => {
          console.log(`  - ID: ${user.id}, Email: ${user.email}`);
        });
        
        if (users.users.length > 0) {
          console.log('\n⚠️  Users exist in auth.users but no profiles found. This might indicate:');
          console.log('   1. Missing trigger to create profiles automatically');
          console.log('   2. RLS policies preventing access');
          console.log('   3. Profiles not being created on user registration');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkProfilesTable();