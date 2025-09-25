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

async function diagnoseSupabaseAuth() {
  console.log('🔍 Diagnosing Supabase Auth Configuration...\n');

  try {
    // 1. Check Supabase connection
    console.log('1. Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);

    if (healthError) {
      console.log('❌ Supabase connection failed:', healthError.message);
      return;
    } else {
      console.log('✅ Supabase connection successful');
    }

    // 2. Check auth configuration
    console.log('\n2. Checking auth configuration...');
    try {
      const { data: authConfig } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      console.log('✅ Auth admin access working');
    } catch (authError) {
      console.log('❌ Auth admin access failed:', authError.message);
    }

    // 3. Check if trigger function exists
    console.log('\n3. Checking trigger function...');
    const { data: functionExists, error: functionError } = await supabaseAdmin
      .rpc('test_role_assignment', { test_email: 'test@example.com' });

    if (functionError) {
      console.log('❌ Trigger function test failed:', functionError.message);
    } else {
      console.log('✅ Trigger function exists and works:', functionExists);
    }

    // 4. Test email validation
    console.log('\n4. Testing email validation...');
    const testEmails = [
      'test@gmail.com',
      'user@example.com', 
      'admin@saku.com.ar',
      'ale@saku.com.ar'
    ];

    for (const email of testEmails) {
      const { data: roleTest } = await supabaseAdmin.rpc('test_role_assignment', { 
        test_email: email 
      });
      console.log(`   ${email} -> ${roleTest}`);
    }

    // 5. Test actual signup with a simple email
    console.log('\n5. Testing actual signup...');
    const testEmail = 'test@example.com';
    const testPassword = 'TestPassword123!';

    console.log(`   Attempting signup with: ${testEmail}`);
    const { data: signupData, error: signupError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signupError) {
      console.log('❌ Signup failed:', signupError.message);
      
      // Try with a different email format
      const altEmail = 'testuser@gmail.com';
      console.log(`   Trying alternative email: ${altEmail}`);
      const { data: altSignup, error: altError } = await supabaseAnon.auth.signUp({
        email: altEmail,
        password: testPassword,
      });

      if (altError) {
        console.log('❌ Alternative signup also failed:', altError.message);
      } else {
        console.log('✅ Alternative signup succeeded:', altSignup.user?.id);
        
        // Check profile creation
        await new Promise(resolve => setTimeout(resolve, 3000));
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', altSignup.user?.id)
          .single();

        if (profileError) {
          console.log('❌ Profile not created automatically:', profileError.message);
        } else {
          console.log('✅ Profile created automatically:', profile);
        }

        // Cleanup
        await supabaseAdmin.auth.admin.deleteUser(altSignup.user.id);
      }
    } else {
      console.log('✅ Signup succeeded:', signupData.user?.id);
      
      // Check profile creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', signupData.user?.id)
        .single();

      if (profileError) {
        console.log('❌ Profile not created automatically:', profileError.message);
      } else {
        console.log('✅ Profile created automatically:', profile);
      }

      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser(signupData.user.id);
    }

    // 6. Check existing profiles
    console.log('\n6. Checking existing profiles...');
    const { data: existingProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.log('❌ Could not fetch profiles:', profilesError.message);
    } else {
      console.log('✅ Recent profiles:');
      existingProfiles.forEach(profile => {
        console.log(`   ${profile.email} (${profile.role}) - ${profile.created_at}`);
      });
    }

    // 7. Check auth settings
    console.log('\n7. Checking auth settings...');
    try {
      // This will help us understand the auth configuration
      const { data: settings } = await supabaseAdmin.auth.admin.getSettings();
      console.log('✅ Auth settings retrieved');
      console.log('   Email confirmation required:', settings?.email_confirm);
      console.log('   Email change confirmation:', settings?.email_change_confirm);
    } catch (settingsError) {
      console.log('❌ Could not retrieve auth settings:', settingsError.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error during diagnosis:', error.message);
    console.error('Stack:', error.stack);
  }
}

diagnoseSupabaseAuth().then(() => {
  console.log('\n✅ Diagnosis completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Diagnosis failed:', error.message);
  process.exit(1);
});