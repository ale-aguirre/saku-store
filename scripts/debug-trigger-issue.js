require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugTriggerIssue() {
  console.log('🔍 Debugging Trigger Issue...\n');

  try {
    // 1. Check if function exists
    console.log('1. Checking if handle_new_user function exists...');
    const { data: functionData, error: functionError } = await supabaseAdmin
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'handle_new_user');

    if (functionError) {
      console.log('❌ Cannot query pg_proc:', functionError.message);
      
      // Try alternative query
      console.log('   Trying alternative query...');
      const { data: altData, error: altError } = await supabaseAdmin.rpc('sql', {
        query: `
          SELECT proname, prosrc 
          FROM pg_proc 
          WHERE proname = 'handle_new_user';
        `
      });
      
      if (altError) {
        console.log('❌ Alternative query failed:', altError.message);
      } else {
        console.log('✅ Function found via RPC:', altData);
      }
    } else {
      console.log('✅ Function found:', functionData);
    }

    // 2. Check if trigger exists
    console.log('\n2. Checking if trigger exists...');
    const { data: triggerData, error: triggerError } = await supabaseAdmin.rpc('sql', {
      query: `
        SELECT tgname, tgtype, tgenabled 
        FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created';
      `
    });

    if (triggerError) {
      console.log('❌ Cannot query triggers:', triggerError.message);
    } else {
      console.log('✅ Trigger query result:', triggerData);
    }

    // 3. Test function directly
    console.log('\n3. Testing function directly...');
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const testEmail = 'test.direct@example.com';
    
    const { data: directTest, error: directError } = await supabaseAdmin.rpc('handle_new_user', {
      user_id: testUserId,
      user_email: testEmail
    });

    if (directError) {
      console.log('❌ Direct function test failed:', directError.message);
    } else {
      console.log('✅ Direct function test succeeded:', directTest);
      
      // Check if profile was created
      const { data: profileCheck, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', testUserId);
        
      if (profileError) {
        console.log('❌ Profile check failed:', profileError.message);
      } else {
        console.log('✅ Profile created by direct function call:', profileCheck);
        
        // Cleanup
        await supabaseAdmin.from('profiles').delete().eq('id', testUserId);
      }
    }

    // 4. Check auth.users table structure
    console.log('\n4. Checking auth.users table structure...');
    const { data: authStructure, error: authError } = await supabaseAdmin.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'auth' AND table_name = 'users'
        ORDER BY ordinal_position;
      `
    });

    if (authError) {
      console.log('❌ Cannot query auth.users structure:', authError.message);
    } else {
      console.log('✅ auth.users structure:', authStructure);
    }

    // 5. Check if we can access auth schema
    console.log('\n5. Testing auth schema access...');
    const { data: authAccess, error: authAccessError } = await supabaseAdmin.rpc('sql', {
      query: `SELECT current_user, session_user;`
    });

    if (authAccessError) {
      console.log('❌ Cannot check user context:', authAccessError.message);
    } else {
      console.log('✅ Current user context:', authAccess);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugTriggerIssue().then(() => {
  console.log('\n✅ Debug completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});