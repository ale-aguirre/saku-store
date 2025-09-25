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

async function testCompleteAuthFlow() {
  console.log('🔄 Testing Complete Auth Flow...\n');

  const testEmail = `test.complete.${Date.now()}@gmail.com`;
  const testPassword = 'TestPassword123!';
  let testUserId = null;

  try {
    // 1. Test user registration with anon client
    console.log('1. Testing user registration...');
    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      return;
    }

    console.log('✅ User registered successfully');
    testUserId = signUpData.user?.id;
    console.log('   User ID:', testUserId);
    console.log('   Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');

    // 2. Wait a moment for trigger to execute
    console.log('\n2. Waiting for trigger to execute...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Check if profile was created using admin client
    console.log('\n3. Checking if profile was created...');
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', testUserId)
      .single();

    if (profileError) {
      console.log('❌ Profile not found:', profileError.message);
      
      // Try to create profile manually
      console.log('\n   Attempting manual profile creation...');
      const { data: manualProfile, error: manualError } = await supabaseAdmin
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

      if (manualError) {
        console.log('❌ Manual profile creation failed:', manualError.message);
      } else {
        console.log('✅ Profile created manually:', manualProfile);
      }
    } else {
      console.log('✅ Profile created automatically by trigger:', profileData);
    }

    // 4. Test sign in
    console.log('\n4. Testing sign in...');
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful');
      console.log('   Session exists:', !!signInData.session);
      console.log('   User ID matches:', signInData.user?.id === testUserId);
    }

    // 5. Test profile access with authenticated user
    console.log('\n5. Testing profile access with authenticated user...');
    if (signInData.session) {
      const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${signInData.session.access_token}`
          }
        }
      });

      const { data: authProfileData, error: authProfileError } = await authenticatedClient
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (authProfileError) {
        console.log('❌ Cannot access profile with auth token:', authProfileError.message);
      } else {
        console.log('✅ Profile accessible with auth token:', authProfileData);
      }
    }

    // 6. Test RLS functions
    console.log('\n6. Testing RLS functions...');
    if (signInData.session) {
      const authenticatedClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${signInData.session.access_token}`
          }
        }
      });

      // Test is_admin function
      const { data: isAdminData, error: isAdminError } = await authenticatedClient.rpc('is_admin');
      if (isAdminError) {
        console.log('❌ is_admin function failed:', isAdminError.message);
      } else {
        console.log('✅ is_admin function works:', isAdminData);
      }

      // Test get_user_role function
      const { data: roleData, error: roleError } = await authenticatedClient.rpc('get_user_role');
      if (roleError) {
        console.log('❌ get_user_role function failed:', roleError.message);
      } else {
        console.log('✅ get_user_role function works:', roleData);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    // Cleanup
    if (testUserId) {
      console.log('\n🧹 Cleaning up test data...');
      
      // Delete profile
      await supabaseAdmin.from('profiles').delete().eq('id', testUserId);
      
      // Delete auth user
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(testUserId);
      if (deleteError) {
        console.log('⚠️  Could not delete auth user:', deleteError.message);
      } else {
        console.log('✅ Test data cleaned up');
      }
    }
  }
}

testCompleteAuthFlow().then(() => {
  console.log('\n✅ Complete auth flow test finished');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});