import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/'

  console.log('[Auth Callback] Request received:', { code: !!code, error, origin })

  // Handle explicit OAuth errors (e.g., user denied access)
  if (error) {
    console.log('[Auth Callback] OAuth error:', error)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error}`)
  }

  // Handle missing authorization code (e.g., direct access)
  if (!code) {
    console.log('[Auth Callback] No authorization code provided')
    return new NextResponse('Bad Request: No authorization code provided', { status: 400 })
  }

  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('[Auth Callback] Session exchange failed:', exchangeError)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=session_exchange_failed`)
    }

    console.log('[Auth Callback] Session exchange successful, redirecting to:', next)
    
    // Successful authentication - redirect to intended destination
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    } else {
      return NextResponse.redirect(`${origin}${next}`)
    }
  } catch (unexpectedError) {
    console.error('[Auth Callback] Unexpected error:', unexpectedError)
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
  }
}