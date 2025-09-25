const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testAuthFlow() {
  console.log('🧪 Testing Supabase Auth Flow...\n')

  try {
    // 1. Test admin user exists
    console.log('1. Checking admin user...')
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'aguirrealexis.cba@gmail.com')
      .single()

    if (adminError) {
      console.log('⚠️  Admin user not found, this is expected if not created yet')
    } else {
      console.log('✅ Admin user found:', {
        id: adminProfile.id,
        email: adminProfile.email,
        role: adminProfile.role,
        created_at: adminProfile.created_at
      })
    }

    // 2. Test creating a test customer user
    console.log('\n2. Testing customer user creation...')
    const testEmail = `test.customer.${Date.now()}@gmail.com`
    const testPassword = 'TestPassword123!'

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    })

    if (signUpError) {
      console.error('❌ Error creating test user:', signUpError.message)
      return
    }

    console.log('✅ Test user created:', {
      id: signUpData.user?.id,
      email: signUpData.user?.email,
      confirmed: signUpData.user?.email_confirmed_at ? 'Yes' : 'No'
    })

    // 3. Check if profile was created automatically
    if (signUpData.user?.id) {
      console.log('\n3. Checking if profile was created automatically...')
      
      // Wait a bit for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single()

      if (profileError) {
        console.error('❌ Profile not created automatically:', profileError.message)
      } else {
        console.log('✅ Profile created automatically:', {
          id: profile.id,
          email: profile.email,
          role: profile.role,
          created_at: profile.created_at
        })
      }

      // 4. Test role verification functions
      console.log('\n4. Testing role verification functions...')
      
      // Test is_admin function
      const { data: isAdminResult, error: isAdminError } = await supabase
        .rpc('is_admin', { user_id: profile.id })

      if (isAdminError) {
        console.error('❌ Error testing is_admin function:', isAdminError.message)
      } else {
        console.log('✅ is_admin function result:', isAdminResult)
      }

      // Test get_user_role function
      const { data: userRole, error: roleError } = await supabase
        .rpc('get_user_role', { user_id: profile.id })

      if (roleError) {
        console.error('❌ Error testing get_user_role function:', roleError.message)
      } else {
        console.log('✅ get_user_role function result:', userRole)
      }

      // 5. Clean up test user
      console.log('\n5. Cleaning up test user...')
      const { error: deleteError } = await supabase.auth.admin.deleteUser(signUpData.user.id)
      
      if (deleteError) {
        console.error('❌ Error deleting test user:', deleteError.message)
      } else {
        console.log('✅ Test user deleted successfully')
      }
    }

    console.log('\n🎉 Auth flow test completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

testAuthFlow()