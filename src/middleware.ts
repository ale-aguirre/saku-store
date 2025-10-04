import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Configurar runtime de Node.js para evitar problemas con Edge Runtime
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for Vite and other development resources
    if (request.nextUrl.pathname.startsWith('/@vite/') || 
        request.nextUrl.pathname.includes('__vite') ||
        request.nextUrl.pathname.includes('hot-update')) {
      return NextResponse.next()
    }

    // Skip middleware for API routes that don't need auth
    if (request.nextUrl.pathname.startsWith('/api/health') ||
        request.nextUrl.pathname.startsWith('/api/debug') ||
        request.nextUrl.pathname.startsWith('/api/webhooks')) {
      return NextResponse.next()
    }

    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Verificar que las variables de entorno estén disponibles
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables in middleware - allowing request to continue')
      // Si faltan las variables, permitir que la request continúe sin autenticación
      // Solo bloquear rutas específicas de admin
      if (request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/auth/login?error=config', request.url))
      }
      return response
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
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

    if (authError) {
      // Only log non-session errors to reduce noise
      if (authError.message !== 'Auth session missing!') {
        console.error('Auth error in middleware:', authError)
      }
      // Continue without user if auth fails
    }

    // Protected admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url))
      }

      // Check if user has admin role - optimized with cache headers
      try {
        // Use a shorter cache for role checks to improve performance
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          // Only redirect on actual errors, not missing profiles
          if (profileError.code !== 'PGRST116') {
            console.error('Profile fetch error in middleware:', profileError)
            return NextResponse.redirect(new URL('/', request.url))
          }
          // If profile doesn't exist, allow access and let the app handle it
        } else if (profile && profile.role !== 'admin' && profile.role !== 'super_admin') {
          return NextResponse.redirect(new URL('/', request.url))
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - @vite/ (Vite development resources)
     * - __vite (Vite hot reload)
     */
    '/((?!_next/static|_next/image|favicon.ico|@vite/|__vite|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}