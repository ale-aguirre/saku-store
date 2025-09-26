import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    // Verificar variables de entorno
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing Supabase environment variables',
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey
      }, { status: 500 })
    }

    // Crear cliente y hacer una consulta simple
    const supabase = createClient()
    
    // Intentar una consulta simple a la tabla products
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .limit(1)

    if (error) {
      return NextResponse.json({
        error: 'Supabase query error',
        details: error.message,
        code: error.code
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      productCount: data?.length || 0,
      envVars: {
        supabaseUrl: supabaseUrl?.substring(0, 20) + '...',
        hasAnonKey: !!supabaseAnonKey
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}