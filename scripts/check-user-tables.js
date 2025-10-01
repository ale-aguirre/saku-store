require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserTables() {
  console.log('🔍 Checking user-related tables...\n');

  // Check if 'users' table exists
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ users table:', usersError.message);
    } else {
      console.log('✅ users table exists');
      if (usersData && usersData.length > 0) {
        console.log('- Sample columns:', Object.keys(usersData[0]));
      }
    }
  } catch (error) {
    console.log('❌ users table error:', error.message);
  }

  // Check if 'profiles' table exists
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ profiles table:', profilesError.message);
    } else {
      console.log('✅ profiles table exists');
      if (profilesData && profilesData.length > 0) {
        console.log('- Sample columns:', Object.keys(profilesData[0]));
      }
    }
  } catch (error) {
    console.log('❌ profiles table error:', error.message);
  }

  // Check auth.users (Supabase built-in)
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ auth.users:', authError.message);
    } else {
      console.log('✅ auth.users exists (Supabase built-in)');
      console.log('- Total users:', authData.users.length);
      if (authData.users.length > 0) {
        console.log('- Sample user fields:', Object.keys(authData.users[0]));
      }
    }
  } catch (error) {
    console.log('❌ auth.users error:', error.message);
  }

  // List all tables in public schema
  try {
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (tablesError) {
      console.log('\n📋 Attempting to list all tables...');
      // Alternative method
      const { data: altData, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (altError) {
        console.log('❌ Could not list tables:', altError.message);
      } else {
        console.log('✅ Available tables:', altData.map(t => t.table_name));
      }
    } else {
      console.log('\n📋 Available tables:', tablesData);
    }
  } catch (error) {
    console.log('\n❌ Error listing tables:', error.message);
  }
}

checkUserTables().catch(console.error);