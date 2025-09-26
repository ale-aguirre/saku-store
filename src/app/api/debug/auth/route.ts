import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    
    // Log all cookies
    const allCookies = cookieStore.getAll()
    console.log('🍪 All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) + '...' })))
    
    // Check Supabase environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey
      }, { status: 500 })
    }
    
    // Create Supabase client
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )
    
    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({
        error: 'Auth error',
        details: authError.message,
        user: null,
        cookies: allCookies.length
      })
    }
    
    if (!user) {
      return NextResponse.json({
        message: 'No user found',
        user: null,
        cookies: allCookies.length,
        authCookies: allCookies.filter(c => c.name.includes('auth')).length
      })
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()
    
    return NextResponse.json({
      message: 'Auth debug info',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      profile: profile || null,
      profileError: profileError?.message || null,
      cookies: allCookies.length,
      authCookies: allCookies.filter(c => c.name.includes('auth')).length,
      supabaseConfig: {
        url: supabaseUrl,
        hasAnonKey: !!supabaseAnonKey
      }
    })
    
  } catch (error) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      error: 'Debug auth failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}