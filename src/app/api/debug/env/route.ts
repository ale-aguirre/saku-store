import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const diagnostics: {
      environment: string;
      timestamp: string;
      vercel: {
        env: string;
        region: string;
        url: string;
      };
      supabase: {
        url: string;
        anonKey: string;
        serviceRole: string;
        connection: string;
        productsCount: number;
      };
      mercadoPago: {
        accessToken: string;
      };
      smtp: {
        host: string;
        port: string;
        user: string;
        from: string;
      };
    } = {
      environment: process.env.VERCEL ? 'vercel' : 'local',
      timestamp: new Date().toISOString(),
      vercel: {
        env: process.env.VERCEL_ENV || 'development',
        region: process.env.VERCEL_REGION || 'local',
        url: process.env.VERCEL_URL || 'localhost'
      },
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing',
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        serviceRole: process.env.SUPABASE_SERVICE_ROLE ? 'configured' : 'missing',
        connection: 'unknown',
        productsCount: 0
      },
      mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN ? 'configured' : 'missing'
      },
      smtp: {
        host: process.env.SMTP_HOST || 'missing',
        port: process.env.SMTP_PORT || 'missing',
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        from: process.env.SMTP_FROM || 'missing'
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