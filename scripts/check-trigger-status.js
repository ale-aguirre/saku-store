const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTriggerStatus() {
  console.log('🔍 Checking Trigger and Function Status...\n')

  try {
    // 1. Check if handle_new_user function exists
    console.log('1. Checking handle_new_user function...')
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname, prosrc')
      .eq('proname', 'handle_new_user')

    if (funcError) {
      console.error('❌ Error checking functions:', funcError.message)
    } else if (functions && functions.length > 0) {
      console.log('✅ handle_new_user function found')
      console.log('Function source preview:', functions[0].prosrc.substring(0, 200) + '...')
    } else {
      console.log('❌ handle_new_user function not found')
    }

    // 2. Check if trigger exists
    console.log('\n2. Checking on_auth_user_created trigger...')
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname, tgenabled')
      .eq('tgname', 'on_auth_user_created')

    if (triggerError) {
      console.error('❌ Error checking triggers:', triggerError.message)
    } else if (triggers && triggers.length > 0) {
      console.log('✅ on_auth_user_created trigger found')
      console.log('Trigger enabled:', triggers[0].tgenabled === 'O' ? 'Yes' : 'No')
    } else {
      console.log('❌ on_auth_user_created trigger not found')
    }

    // 3. Check RLS functions
    console.log('\n3. Checking RLS helper functions...')
    const rlsFunctions = ['is_admin', 'is_admin_user', 'get_user_role']
    
    for (const funcName of rlsFunctions) {
      const { data: func, error: err } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', funcName)

      if (err) {
        console.error(`❌ Error checking ${funcName}:`, err.message)
      } else if (func && func.length > 0) {
        console.log(`✅ ${funcName} function found`)
      } else {
        console.log(`❌ ${funcName} function not found`)
      }
    }

    // 4. Test manual profile creation
    console.log('\n4. Testing manual profile creation...')
    const testUserId = '00000000-0000-0000-0000-000000000001'
    const testEmail = 'manual.test@example.com'

    // First, clean up if exists
    await supabase
      .from('profiles')
      .delete()
      .eq('id', testUserId)

    // Try to insert manually
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        role: 'customer'
      })
      .select()

    if (insertError) {
      console.error('❌ Error inserting profile manually:', insertError.message)
    } else {
      console.log('✅ Manual profile creation successful')
      
      // Clean up
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUserId)
    }

    // 5. Check auth.users table access
    console.log('\n5. Checking auth.users table access...')
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(1)

    if (authError) {
      console.error('❌ Cannot access auth.users:', authError.message)
    } else {
      console.log('✅ Can access auth.users table')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

checkTriggerStatus()