require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTriggerManually() {
  console.log('🔧 Testing Trigger Function Manually...\n');

  try {
    // 1. Test manual profile creation with service role
    console.log('1. Testing manual profile creation with service role...');
    const testUserId = '11111111-1111-1111-1111-111111111111';
    const testEmail = 'manual.test@example.com';

    // First, clean up any existing test data
    await supabase.from('profiles').delete().eq('id', testUserId);

    // Try to insert a profile manually
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        role: 'customer',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.log('❌ Manual profile creation failed:', insertError.message);
    } else {
      console.log('✅ Manual profile created successfully:', insertData);
      
      // Clean up
      await supabase.from('profiles').delete().eq('id', testUserId);
      console.log('🧹 Test profile cleaned up');
    }

    // 2. Check RLS policies on profiles table
    console.log('\n2. Checking RLS policies on profiles table...');
    const { data: rlsData, error: rlsError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'profiles';
      `
    });

    if (rlsError) {
      console.log('⚠️  Cannot check RLS policies directly, trying alternative...');
      
      // Try to read profiles with anon client
      const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      const { data: anonData, error: anonError } = await anonClient
        .from('profiles')
        .select('*')
        .limit(1);

      if (anonError) {
        console.log('❌ Anon client cannot read profiles:', anonError.message);
      } else {
        console.log('✅ Anon client can read profiles');
      }
    } else {
      console.log('✅ RLS policies found:', rlsData?.length || 0);
      rlsData?.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} for ${policy.roles}`);
      });
    }

    // 3. Test the trigger function exists and is callable
    console.log('\n3. Testing if handle_new_user function exists...');
    const { data: funcData, error: funcError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          proname,
          pronargs,
          prorettype::regtype as return_type
        FROM pg_proc 
        WHERE proname = 'handle_new_user' AND pronamespace = (
          SELECT oid FROM pg_namespace WHERE nspname = 'public'
        );
      `
    });

    if (funcError) {
      console.log('❌ Cannot check function:', funcError.message);
    } else {
      console.log('✅ Function exists:', funcData?.length > 0 ? 'Yes' : 'No');
      if (funcData?.length > 0) {
        console.log('   Function details:', funcData[0]);
      }
    }

    // 4. Test trigger exists
    console.log('\n4. Testing if trigger exists...');
    const { data: triggerData, error: triggerError } = await supabase.rpc('sql', {
      query: `
        SELECT 
          t.tgname,
          t.tgenabled,
          c.relname as table_name,
          p.proname as function_name
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_proc p ON t.tgfoid = p.oid
        WHERE t.tgname = 'on_auth_user_created';
      `
    });

    if (triggerError) {
      console.log('❌ Cannot check trigger:', triggerError.message);
    } else {
      console.log('✅ Trigger exists:', triggerData?.length > 0 ? 'Yes' : 'No');
      if (triggerData?.length > 0) {
        console.log('   Trigger details:', triggerData[0]);
      }
    }

    // 5. Test creating a user in auth.users directly (this should trigger the function)
    console.log('\n5. Testing direct auth.users insertion...');
    const testAuthUserId = '22222222-2222-2222-2222-222222222222';
    
    // Clean up first
    await supabase.rpc('sql', {
      query: `DELETE FROM auth.users WHERE id = '${testAuthUserId}';`
    });
    await supabase.from('profiles').delete().eq('id', testAuthUserId);

    // Try to insert into auth.users (this should trigger our function)
    const { data: authInsertData, error: authInsertError } = await supabase.rpc('sql', {
      query: `
        INSERT INTO auth.users (
          id, 
          email, 
          encrypted_password, 
          email_confirmed_at,
          created_at,
          updated_at,
          confirmation_token,
          email_change_token_new,
          recovery_token
        ) VALUES (
          '${testAuthUserId}',
          'trigger.test@example.com',
          crypt('password123', gen_salt('bf')),
          NOW(),
          NOW(),
          NOW(),
          '',
          '',
          ''
        );
      `
    });

    if (authInsertError) {
      console.log('❌ Cannot insert into auth.users:', authInsertError.message);
    } else {
      console.log('✅ Inserted into auth.users successfully');
      
      // Check if profile was created by trigger
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testAuthUserId)
        .single();

      if (profileError) {
        console.log('❌ Profile not created by trigger:', profileError.message);
      } else {
        console.log('✅ Profile created by trigger:', profileData);
      }
      
      // Clean up
      await supabase.rpc('sql', {
        query: `DELETE FROM auth.users WHERE id = '${testAuthUserId}';`
      });
      await supabase.from('profiles').delete().eq('id', testAuthUserId);
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testTriggerManually().then(() => {
  console.log('\n✅ Manual trigger test complete');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});