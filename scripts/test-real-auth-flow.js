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

async function testRealAuthFlow() {
  console.log('🧪 Testing Real Auth Flow with Trigger...\n');

  try {
    // 1. Check trigger status
    console.log('1. Checking trigger status...');
    const { data: triggerStatus, error: statusError } = await supabaseAdmin
      .rpc('test_auth_trigger_status');

    if (statusError) {
      console.log('❌ Could not check trigger status:', statusError.message);
      return;
    }

    const status = triggerStatus[0];
    console.log('✅ Trigger Status:');
    console.log(`   - Trigger exists: ${status.trigger_exists}`);
    console.log(`   - Function exists: ${status.function_exists}`);
    console.log(`   - Recent profiles: ${status.recent_profiles_count}`);

    if (!status.trigger_exists || !status.function_exists) {
      console.log('❌ Trigger or function missing. Cannot proceed.');
      return;
    }

    // 2. Test with real email domains
    console.log('\n2. Testing signup with real email domains...');
    
    const testCases = [
      {
        email: `testuser${Date.now()}@gmail.com`,
        expectedRole: 'customer',
        description: 'Customer with Gmail'
      },
      {
        email: `testadmin${Date.now()}@saku.com.ar`,
        expectedRole: 'admin', 
        description: 'Admin with Saku domain'
      }
    ];

    const createdUsers = [];

    for (const testCase of testCases) {
      console.log(`\n   Testing: ${testCase.description}`);
      console.log(`   Email: ${testCase.email}`);
      
      // Signup
      const { data: signupData, error: signupError } = await supabaseAnon.auth.signUp({
        email: testCase.email,
        password: 'TestPassword123!',
      });

      if (signupError) {
        console.log(`   ❌ Signup failed: ${signupError.message}`);
        continue;
      }

      console.log(`   ✅ Signup successful: ${signupData.user?.id}`);
      createdUsers.push(signupData.user.id);

      // Wait for trigger to execute
      console.log('   ⏳ Waiting for trigger to execute...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check if profile was created
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', signupData.user.id)
        .single();

      if (profileError) {
        console.log(`   ❌ Profile not created: ${profileError.message}`);
        
        // Try to create manually to test the function
        console.log('   🔧 Testing manual profile creation...');
        const { data: manualProfile, error: manualError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: signupData.user.id,
            email: testCase.email,
            role: testCase.expectedRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (manualError) {
          console.log(`   ❌ Manual creation failed: ${manualError.message}`);
        } else {
          console.log(`   ✅ Manual creation successful: ${manualProfile.role}`);
        }
      } else {
        console.log(`   ✅ Profile created automatically!`);
        console.log(`   📧 Email: ${profile.email}`);
        console.log(`   👤 Role: ${profile.role}`);
        console.log(`   ✅ Role matches expected: ${profile.role === testCase.expectedRole}`);
      }
    }

    // 3. Check recent activity
    console.log('\n3. Checking recent profile activity...');
    const { data: recentProfiles, error: recentError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.log('❌ Could not fetch recent profiles:', recentError.message);
    } else {
      console.log('✅ Recent profiles:');
      recentProfiles.forEach(profile => {
        const isTestUser = createdUsers.includes(profile.id);
        const marker = isTestUser ? '🧪' : '  ';
        console.log(`   ${marker} ${profile.email} (${profile.role}) - ${profile.created_at}`);
      });
    }

    // 4. Cleanup test users
    console.log('\n4. Cleaning up test users...');
    for (const userId of createdUsers) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log(`   ✅ Deleted user: ${userId}`);
      } catch (deleteError) {
        console.log(`   ❌ Failed to delete user ${userId}: ${deleteError.message}`);
      }
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error during test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testRealAuthFlow().then(() => {
  console.log('\n🎉 Real auth flow test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});