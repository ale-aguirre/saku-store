require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyTriggerStatus() {
  console.log('🔍 Verifying Trigger and Function Status with Direct SQL...\n');

  try {
    // 1. Check if handle_new_user function exists
    console.log('1. Checking handle_new_user function...');
    const { data: functionData, error: functionError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          p.proname as function_name,
          p.prosrc as function_body
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';
      `
    });

    if (functionError) {
      console.log('⚠️  Using alternative method to check function...');
      // Try alternative approach
      const { data: altData, error: altError } = await supabase
        .from('information_schema.routines')
        .select('*')
        .eq('routine_name', 'handle_new_user')
        .eq('routine_schema', 'public');
      
      if (altError) {
        console.log('❌ Cannot check function existence:', altError.message);
      } else {
        console.log('✅ Function exists:', altData.length > 0 ? 'Yes' : 'No');
      }
    } else {
      console.log('✅ Function exists:', functionData?.length > 0 ? 'Yes' : 'No');
    }

    // 2. Check if trigger exists
    console.log('\n2. Checking on_auth_user_created trigger...');
    const { data: triggerData, error: triggerError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          t.tgname as trigger_name,
          c.relname as table_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE t.tgname = 'on_auth_user_created';
      `
    });

    if (triggerError) {
      console.log('❌ Cannot check trigger:', triggerError.message);
    } else {
      console.log('✅ Trigger exists:', triggerData?.length > 0 ? 'Yes' : 'No');
      if (triggerData?.length > 0) {
        console.log('   Table:', triggerData[0].table_name);
      }
    }

    // 3. Test the function directly
    console.log('\n3. Testing handle_new_user function directly...');
    const testUserId = '00000000-0000-0000-0000-000000000001';
    const { data: testData, error: testError } = await supabase.rpc('handle_new_user', {
      user_id: testUserId,
      user_email: 'test@example.com'
    });

    if (testError) {
      console.log('❌ Function test failed:', testError.message);
    } else {
      console.log('✅ Function executed successfully');
      
      // Check if profile was created
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (profileError) {
        console.log('⚠️  Profile not found after function call');
      } else {
        console.log('✅ Profile created:', profileData);
        
        // Clean up test profile
        await supabase.from('profiles').delete().eq('id', testUserId);
        console.log('🧹 Test profile cleaned up');
      }
    }

    // 4. Check RLS helper functions
    console.log('\n4. Testing RLS helper functions...');
    const functions = ['is_admin', 'is_admin_user', 'get_user_role'];
    
    for (const funcName of functions) {
      try {
        const { data, error } = await supabase.rpc(funcName);
        if (error) {
          console.log(`❌ ${funcName}:`, error.message);
        } else {
          console.log(`✅ ${funcName}: works (returned: ${JSON.stringify(data)})`);
        }
      } catch (err) {
        console.log(`❌ ${funcName}:`, err.message);
      }
    }

    // 5. Check profiles table structure
    console.log('\n5. Checking profiles table structure...');
    const { data: tableData, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.log('❌ Cannot access profiles table:', tableError.message);
    } else {
      console.log('✅ Profiles table accessible');
      console.log('   Sample structure:', Object.keys(tableData[0] || {}));
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

verifyTriggerStatus().then(() => {
  console.log('\n✅ Verification complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});