'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatPrice } from '@/lib/utils'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Eye,
  Edit,
  Plus,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalUsers: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  todayOrders: number
  todayRevenue: number
  conversionRate: number
  averageOrderValue: number
}

interface Order {
  id: string
  status: string | null
  total: number
  created_at: string | null
  user_id: string | null
  profiles: {
    email: string
    first_name: string | null
    last_name: string | null
  } | null
}

interface Product {
  id: string
  name: string
  base_price: number
  sku: string
  description: string | null
  images: string[] | null
  is_active: boolean | null
  is_featured: boolean | null
  brand: string | null
  category: string | null
  category_id: string | null
  slug: string | null
  created_at: string | null
  updated_at: string | null
  product_variants: {
    id: string
    size: string
    color: string
    stock_quantity: number | null
    sku: string
    price: number | null
    price_adjustment: number | null
    images: string[] | null
    material: string | null
    is_active: boolean | null
    low_stock_threshold: number | null
    product_id: string | null
    created_at: string | null
    updated_at: string | null
  }[]
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Pagado', color: 'bg-green-100 text-green-800' },
  processing: { label: 'Preparando', color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    todayOrders: 0,
    todayRevenue: 0,
    conversionRate: 0,
    averageOrderValue: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && user) {
      // TODO: Verificar si el usuario es admin
      fetchDashboardData()
    }
  }, [user, loading])

  const fetchDashboardData = async () => {
    try {
      const supabase = createClient()

      // Get today's date for filtering
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()
      
      // Fetch stats
      const [
        { count: productsCount },
        { count: ordersCount },
        { count: usersCount },
        { data: revenueData },
        { count: pendingCount },
        { data: lowStockData },
        { count: todayOrdersCount },
        { data: todayRevenueData }
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total').eq('status', 'paid'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('product_variants').select('product_id, stock_quantity, low_stock_threshold'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('orders').select('total').eq('status', 'paid').gte('created_at', todayISO)
      ])

      const totalRevenue = (revenueData as any)?.reduce((sum: number, order: any) => sum + order.total, 0) || 0
      const todayRevenue = (todayRevenueData as any)?.reduce((sum: number, order: any) => sum + order.total, 0) || 0
      const averageOrderValue = ordersCount && ordersCount > 0 ? totalRevenue / ordersCount : 0
      
      // Calculate unique products with low stock - filter on client side
      const lowStockVariants = (lowStockData as any[])?.filter(variant => {
        // Lógica de badges de inventario: considerar stock bajo solo si hay menos de 5 unidades
        return variant.stock_quantity > 0 && variant.stock_quantity < 5
      }) || []
      const uniqueLowStockProducts = new Set(lowStockVariants.map(variant => variant.product_id)).size

      setStats({
        totalProducts: productsCount || 0,
        totalOrders: ordersCount || 0,
        totalUsers: usersCount || 0,
        totalRevenue,
        pendingOrders: pendingCount || 0,
        lowStockProducts: uniqueLowStockProducts,
        todayOrders: todayOrdersCount || 0,
        todayRevenue,
        conversionRate: 0, // This would need more complex calculation with analytics data
        averageOrderValue
      })

      // Fetch recent orders
      const { data: ordersData } = await supabase
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
        .limit(10)

      setRecentOrders(ordersData || [])

      // Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          *,
          product_variants (
            id,
            size,
            color,
            stock_quantity,
            sku,
            price,
            price_adjustment,
            images,
            material,
            is_active,
            low_stock_threshold,
            product_id,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      setProducts(productsData || [])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 text-foreground">Acceso restringido</h1>
        <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Resumen de tu tienda Sakú Lencería</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            {new Date().toLocaleDateString('es-AR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Badge>
        </div>
      </div>

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Órdenes Hoy</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.todayOrders}</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stats.todayOrders > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stats.todayOrders > 0 ? '+' : ''}{stats.todayOrders} desde ayer
                  </span>
                </p>
              </div>
              <div className="p-4 bg-blue-100 rounded-xl">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Ingresos Hoy</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{formatPrice(stats.todayRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-2 flex items-center">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    stats.todayRevenue > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stats.todayRevenue > 0 ? '+' : ''}{formatPrice(stats.todayRevenue)} desde ayer
                  </span>
                </p>
              </div>
              <div className="p-4 bg-green-100 rounded-xl">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Ticket Promedio</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{formatPrice(stats.averageOrderValue)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Promedio por orden
                  </span>
                </p>
              </div>
              <div className="p-4 bg-orange-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Total Productos</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalProducts}</p>
                {stats.lowStockProducts > 0 && (
                  <div className="flex items-center mt-3">
                    <div className="flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/20">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
                      <p className="text-xs font-medium text-red-700 dark:text-red-400">{stats.lowStockProducts} con stock bajo</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Total Órdenes</p>
                <p className="text-2xl font-bold text-foreground dark:text-white mt-1">{stats.totalOrders}</p>
                {stats.pendingOrders > 0 && (
                  <div className="flex items-center mt-3">
                    <div className="flex items-center px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/20">
                      <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-1" />
                      <p className="text-xs font-medium text-yellow-700 dark:text-yellow-400">{stats.pendingOrders} pendientes</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <ShoppingCart className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Clientes</p>
                <p className="text-2xl font-bold text-foreground mt-1">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Usuarios registrados
                  </span>
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatPrice(stats.totalRevenue)}</p>
                <p className="text-sm text-muted-foreground mt-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    Órdenes pagadas
                  </span>
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-3 border-2 hover:border-blue-300 hover:bg-blue-50 transition-all"
              onClick={() => router.push('/admin/productos/nuevo')}
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Nuevo Producto</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-3 border-2 hover:border-green-300 hover:bg-green-50 transition-all"
              onClick={() => router.push('/admin/ordenes')}
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Ver Órdenes</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-3 border-2 hover:border-orange-300 hover:bg-orange-50 transition-all"
              onClick={() => router.push('/admin/productos')}
            >
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Gestionar Stock</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-24 flex-col space-y-3 border-2 hover:border-purple-300 hover:bg-purple-50 transition-all"
              onClick={() => router.push('/admin/cupones')}
            >
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-foreground">Crear Cupón</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-6">
        <TabsList>
          <TabsTrigger value="orders">Órdenes Recientes</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Órdenes Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig]
                  
                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">#{order.id.slice(-8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Sin nombre' : 'Sin nombre'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('es-AR') : 'Sin fecha'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={status?.color}>
                          {status?.label}
                        </Badge>
                        <p className="font-medium">{formatPrice(order.total)}</p>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Productos</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => {
                  const totalStock = product.product_variants.reduce((sum, variant) => sum + (variant.stock_quantity || 0), 0)
                  
                  return (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatPrice(product.base_price)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Stock total: {totalStock} unidades
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}