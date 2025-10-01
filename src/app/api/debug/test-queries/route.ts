import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function POST(_request: NextRequest) {
  try {
    const supabase = createClient()
    const results: any = {}

    console.log('🔍 Iniciando pruebas de consultas...')

    // Test 1: Verificar tabla products
    try {
      const { count: productsCount, error: productsError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
      
      results.products = {
        count: productsCount,
        error: productsError?.message || null,
        success: !productsError
      }
      console.log('✅ Products query:', results.products)
    } catch (error) {
      results.products = {
        count: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Products query failed:', results.products)
    }

    // Test 2: Verificar tabla orders
    try {
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      
      results.orders = {
        count: ordersCount,
        error: ordersError?.message || null,
        success: !ordersError
      }
      console.log('✅ Orders query:', results.orders)
    } catch (error) {
      results.orders = {
        count: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Orders query failed:', results.orders)
    }

    // Test 3: Verificar tabla users
    try {
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      results.profiles = {
        count: usersCount,
        error: usersError?.message || null,
        success: !usersError
      }
      console.log('✅ Profiles query:', results.profiles)
    } catch (error) {
      results.profiles = {
        count: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Profiles query failed:', results.profiles)
    }

    // Test 4: Verificar consulta de revenue
    try {
      const { data: revenueData, error: revenueError } = await supabase
        .from('orders')
        .select('total')
        .eq('status', 'paid')
      
      const totalRevenue = revenueData?.reduce((sum: number, order: any) => sum + order.total, 0) || 0
      
      results.revenue = {
        data: revenueData,
        total: totalRevenue,
        error: revenueError?.message || null,
        success: !revenueError
      }
      console.log('✅ Revenue query:', results.revenue)
    } catch (error) {
      results.revenue = {
        data: null,
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Revenue query failed:', results.revenue)
    }

    // Test 5: Verificar consulta de pending orders
    try {
      const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
      
      results.pendingOrders = {
        count: pendingCount,
        error: pendingError?.message || null,
        success: !pendingError
      }
      console.log('✅ Pending orders query:', results.pendingOrders)
    } catch (error) {
      results.pendingOrders = {
        count: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Pending orders query failed:', results.pendingOrders)
    }

    // Test 6: Verificar consulta de recent orders con join
    try {
      const { data: ordersData, error: ordersJoinError } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      results.recentOrders = {
        data: ordersData,
        count: ordersData?.length || 0,
        error: ordersJoinError?.message || null,
        success: !ordersJoinError
      }
      console.log('✅ Recent orders query:', results.recentOrders)
    } catch (error) {
      results.recentOrders = {
        data: null,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Recent orders query failed:', results.recentOrders)
    }

    // Test 7: Verificar consulta de products con variants
    try {
      const { data: productsData, error: productsJoinError } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (
            id,
            size,
            color,
            stock_quantity
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      results.productsWithVariants = {
        data: productsData,
        count: productsData?.length || 0,
        error: productsJoinError?.message || null,
        success: !productsJoinError
      }
      console.log('✅ Products with variants query:', results.productsWithVariants)
    } catch (error) {
      results.productsWithVariants = {
        data: null,
        count: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false
      }
      console.log('❌ Products with variants query failed:', results.productsWithVariants)
    }

    // Resumen
    const successCount = Object.values(results).filter((r: any) => r.success).length
    const totalTests = Object.keys(results).length
    
    console.log(`📊 Resumen: ${successCount}/${totalTests} consultas exitosas`)

    return NextResponse.json({
      message: 'Database queries test completed',
      summary: {
        successful: successCount,
        total: totalTests,
        allPassed: successCount === totalTests
      },
      results
    })

  } catch (error) {
    console.error('❌ Error general en test de consultas:', error)
    return NextResponse.json({
      error: 'Database queries test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}