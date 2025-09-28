import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Configurar runtime de Node.js para evitar problemas con Edge Runtime
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next({
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
      console.error('Auth error in middleware:', authError)
      // Continue without user if auth fails
    }

    // Protected admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user) {
        return NextResponse.redirect(new URL('/auth/login?redirect=/admin', request.url))
      }

      // Check if user has admin role
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Profile fetch error in middleware:', profileError)
          return NextResponse.redirect(new URL('/', request.url))
        }

        if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
          return NextResponse.redirect(new URL('/', request.url))
        }
      } catch (error) {
        console.error('Database error in middleware:', error)
        return NextResponse.redirect(new URL('/', request.url))
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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}