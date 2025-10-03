require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  try {
    // Try to login with the same credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@test.saku.com',
      password: 'admin123test'
    })

    if (error) {
      console.error('Login error:', error)
      return
    }

    console.log('Login successful, user ID:', data.user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile error:', profileError)
      return
    }

    console.log('User profile:', profile)

    // Test middleware logic
    if (profile && profile.role !== 'admin' && profile.role !== 'super_admin') {
      console.log('User would be redirected away from admin (role check failed)')
    } else {
      console.log('User should have access to admin (role check passed)')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

testLogin()