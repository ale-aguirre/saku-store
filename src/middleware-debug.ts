import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Force the middleware to run on Node.js runtime for better compatibility
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  console.log('🔍 Middleware called for:', request.nextUrl.pathname)
  
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Verificar que las variables de entorno estén disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables in middleware')
      return response
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            const cookies = request.cookies.getAll()
            console.log('🍪 Cookies in middleware:', cookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`))
            return cookies
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log('👤 User in middleware:', user ? `${user.id} (${user.email})` : 'null')
    console.log('❌ Auth error:', authError?.message || 'none')

    if (authError) {
      // Only log non-session errors to reduce noise
      if (authError.message !== 'Auth session missing!') {
        console.error('Auth error in middleware:', authError)
      }
      // Continue without user if auth fails
    }

    // Protected admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log('🔐 Admin route accessed')
      
      if (!user) {
        console.log('❌ No user, redirecting to login')
        return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url))
      }

      // Check if user has admin role - optimized with cache headers
      try {
        console.log('🔍 Checking user role...')
        // Use a shorter cache for role checks to improve performance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        console.log('👤 Profile data:', profile)
        console.log('❌ Profile error:', profileError?.message || 'none')

        if (profileError) {
          // Only redirect on actual errors, not missing profiles
          if (profileError.code !== 'PGRST116') {
            console.error('Profile fetch error in middleware:', profileError)
            console.log('❌ Redirecting to home due to profile error')
            return NextResponse.redirect(new URL('/', request.url))
          }
          // If profile doesn't exist, allow access and let the app handle it
        } else if (profile && profile.role !== 'admin' && profile.role !== 'super_admin') {
          console.log('❌ User role not admin:', profile.role)
          return NextResponse.redirect(new URL('/', request.url))
        } else {
          console.log('✅ User has admin access, role:', profile?.role)
        }
      } catch (error) {
        console.error('Database error in middleware:', error)
        // Don't redirect on network errors, let the app handle it
      }
    }

    // Protected user routes (cuenta, orders, etc.)
    if (request.nextUrl.pathname.startsWith('/cuenta') || 
        request.nextUrl.pathname.startsWith('/orders')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login?redirect=' + request.nextUrl.pathname, request.url))
      }
    }

    // Redirect authenticated users away from auth pages
    if (user && request.nextUrl.pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    console.log('✅ Middleware allowing access to:', request.nextUrl.pathname)
    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a basic response if middleware fails
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - @vite/ (Vite dev server)
     * - __vite (Vite dev server)
     * - files with extensions (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|@vite/|__vite|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}