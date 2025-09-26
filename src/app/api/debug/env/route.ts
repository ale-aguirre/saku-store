import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        url: process.env.VERCEL_URL || 'unknown',
        env: process.env.VERCEL_ENV || 'unknown'
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        serviceRole: process.env.SUPABASE_SERVICE_ROLE ? 'configured' : 'missing'
      },
      mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN ? 'configured' : 'missing',
        publicKey: process.env.MP_PUBLIC_KEY ? 'configured' : 'missing'
      },
      smtp: {
        host: process.env.SMTP_HOST ? 'configured' : 'missing',
        user: process.env.SMTP_USER ? 'configured' : 'missing'
      }
    };

    // Test Supabase connection
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        const { data, error } = await supabase
          .from('products')
          .select('id')
          .limit(1);
        
        diagnostics.supabase.connection = error ? `error: ${error.message}` : 'success';
        diagnostics.supabase.productsCount = data?.length || 0;
      } catch (err) {
        diagnostics.supabase.connection = `exception: ${err instanceof Error ? err.message : 'unknown'}`;
      }
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Diagnostic failed', 
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}