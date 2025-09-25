require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testTriggerFunction() {
  console.log('🧪 Testing Trigger Function...\n');

  const testUserId = '11111111-1111-1111-1111-111111111111';
  const testEmail = 'test.trigger@gmail.com';

  try {
    // 1. Test the test function with admin client
    console.log('1. Testing test_handle_new_user function with admin client...');
    const { data: adminTestData, error: adminTestError } = await supabaseAdmin.rpc('test_handle_new_user', {
      test_user_id: testUserId,
      test_email: testEmail
    });

    if (adminTestError) {
      console.log('❌ Admin test failed:', adminTestError.message);
    } else {
      console.log('✅ Admin test succeeded:', adminTestData);
    }

    // 2. Check if profile was created
    console.log('\n2. Checking if profile was created...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (profileError) {
      console.log('❌ Profile not found:', profileError.message);
    } else {
      console.log('✅ Profile created:', profileData);
    }

    // 3. Test with anon client (should fail due to RLS)
    console.log('\n3. Testing test_handle_new_user function with anon client...');
    const testUserId2 = '22222222-2222-2222-2222-222222222222';
    const testEmail2 = 'test.anon@gmail.com';

    const { data: anonTestData, error: anonTestError } = await supabaseAnon.rpc('test_handle_new_user', {
      test_user_id: testUserId2,
      test_email: testEmail2
    });

    if (anonTestError) {
      console.log('❌ Anon test failed:', anonTestError.message);
    } else {
      console.log('✅ Anon test succeeded:', anonTestData);
    }

    // 4. Test admin email
    console.log('\n4. Testing admin email assignment...');
    const adminUserId = '33333333-3333-3333-3333-333333333333';
    const adminEmail = 'ale@saku.com.ar';

    const { data: adminEmailData, error: adminEmailError } = await supabaseAdmin.rpc('test_handle_new_user', {
      test_user_id: adminUserId,
      test_email: adminEmail
    });

    if (adminEmailError) {
      console.log('❌ Admin email test failed:', adminEmailError.message);
    } else {
      console.log('✅ Admin email test succeeded:', adminEmailData);
      
      // Check the role
      const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', adminUserId)
        .single();

      if (adminProfileError) {
        console.log('❌ Admin profile not found:', adminProfileError.message);
      } else {
        console.log('✅ Admin profile created with role:', adminProfile.role);
      }
    }

    // 5. Now test the actual auth flow
    console.log('\n5. Testing actual auth flow...');
    const realTestEmail = `test.real.${Date.now()}@gmail.com`;
    const realTestPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: realTestEmail,
      password: realTestPassword,
    });

    if (signUpError) {
      console.log('❌ Real auth test failed:', signUpError.message);
    } else {
      console.log('✅ Real auth test - user created:', signUpData.user?.id);
      
      // Wait for trigger
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile was created by trigger
      const { data: realProfile, error: realProfileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user?.id)
        .single();

      if (realProfileError) {
        console.log('❌ Real profile not created by trigger:', realProfileError.message);
      } else {
        console.log('✅ Real profile created by trigger:', realProfile);
      }
      
      // Cleanup real user
      if (signUpData.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    const testUserId2 = '22222222-2222-2222-2222-222222222222';
    const adminUserId = '33333333-3333-3333-3333-333333333333';
    await supabaseAdmin.from('profiles').delete().in('id', [testUserId, testUserId2, adminUserId]);
    console.log('✅ Cleanup completed');
  }
}

testTriggerFunction().then(() => {
  console.log('\n✅ Trigger function test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});