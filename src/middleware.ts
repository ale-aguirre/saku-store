import { NextResponse, type NextRequest } from 'next/server'

// Middleware temporal simplificado para diagnosticar problemas de Vercel
export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  try {
    console.log('Middleware ejecutándose para:', request.nextUrl.pathname)
    
    // Skip middleware for Vite and other development resources
    if (request.nextUrl.pathname.startsWith('/@vite/') || 
        request.nextUrl.pathname.includes('__vite') ||
        request.nextUrl.pathname.includes('hot-update')) {
      return NextResponse.next()
    }

    // Log environment variables availability
    console.log('Environment check:', {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      nodeEnv: process.env.NODE_ENV
    })

    // Permitir todas las requests por ahora para diagnosticar
    const response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Agregar headers de debug
    response.headers.set('X-Middleware-Debug', 'active')
    response.headers.set('X-Supabase-Config', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing')

    return response
  } catch (error) {
    console.error('Middleware error:', error)
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