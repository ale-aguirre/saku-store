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

async function testSimpleTrigger() {
  console.log('🧪 Testing Simple Trigger...\n');

  try {
    // 1. Test the profile creation function directly
    console.log('1. Testing profile creation function...');
    const testUserId = '44444444-4444-4444-4444-444444444444';
    const testEmail = 'test.simple@gmail.com';

    const { data: testResult, error: testError } = await supabaseAdmin.rpc('test_profile_creation', {
      test_user_id: testUserId,
      test_email: testEmail
    });

    if (testError) {
      console.log('❌ Test function failed:', testError.message);
    } else {
      console.log('✅ Test function result:', testResult);
    }

    // 2. Check if profile was created
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

    // 3. Test admin email
    console.log('\n2. Testing admin email...');
    const adminUserId = '55555555-5555-5555-5555-555555555555';
    const adminEmail = 'ale@saku.com.ar';

    const { data: adminResult, error: adminError } = await supabaseAdmin.rpc('test_profile_creation', {
      test_user_id: adminUserId,
      test_email: adminEmail
    });

    if (adminError) {
      console.log('❌ Admin test failed:', adminError.message);
    } else {
      console.log('✅ Admin test result:', adminResult);
    }

    // Check admin profile
    const { data: adminProfile, error: adminProfileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', adminUserId)
      .single();

    if (adminProfileError) {
      console.log('❌ Admin profile not found:', adminProfileError.message);
    } else {
      console.log('✅ Admin profile created:', adminProfile);
    }

    // 4. Test actual auth signup (this should trigger the function)
    console.log('\n3. Testing actual auth signup...');
    const realEmail = `test.auth.${Date.now()}@gmail.com`;
    const realPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: realEmail,
      password: realPassword,
    });

    if (signUpError) {
      console.log('❌ Auth signup failed:', signUpError.message);
    } else {
      console.log('✅ Auth signup succeeded, user ID:', signUpData.user?.id);
      
      // Wait for trigger to execute
      console.log('   Waiting for trigger...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if profile was created by trigger
      const { data: triggerProfile, error: triggerError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user?.id)
        .single();

      if (triggerError) {
        console.log('❌ Trigger profile not created:', triggerError.message);
      } else {
        console.log('✅ Trigger profile created:', triggerProfile);
      }
      
      // Cleanup auth user
      if (signUpData.user?.id) {
        await supabaseAdmin.auth.admin.deleteUser(signUpData.user.id);
        console.log('✅ Auth user cleaned up');
      }
    }

    // Cleanup test profiles
    console.log('\n🧹 Cleaning up test profiles...');
    await supabaseAdmin.from('profiles').delete().in('id', [testUserId, adminUserId]);
    console.log('✅ Test profiles cleaned up');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testSimpleTrigger().then(() => {
  console.log('\n✅ Simple trigger test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});