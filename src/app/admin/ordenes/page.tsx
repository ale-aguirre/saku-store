'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatPrice } from '@/lib/utils'
import { 
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  RefreshCw,
  ArrowUpDown,
  Download
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Order {
  id: string
  status: string | null
  total: number
  subtotal: number
  shipping_cost: number
  discount_amount: number | null
  created_at: string | null
  updated_at: string | null
  shipping_address: any // JSON field
  billing_address: any | null // JSON field
  tracking_number: string | null
  payment_method: string | null
  payment_id: string | null
  notes: string | null
  email: string
  coupon_code: string | null
  user_id: string | null
  profiles: {
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
  } | null
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: 'Pagado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'processing', label: 'Procesando', icon: Package, color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Enviado', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  { value: 'delivered', label: 'Entregado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' },
]

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  const [sortField, setSortField] = useState<string>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [totalOrders, setTotalOrders] = useState<number>(0)
  const [totalRevenue, setTotalRevenue] = useState<number>(0)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      
      // Construir la consulta base
      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name,
            phone
          )
        `, { count: 'exact' })
      
      // Aplicar filtros
      if (statusFilter !== 'all') {
        // Cast is safe because we check for 'all' above
        query = query.eq('status', statusFilter as OrderStatus)
      }
      
      // Filtro de fecha
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from)
        fromDate.setHours(0, 0, 0, 0)
        query = query.gte('created_at', fromDate.toISOString())
      }
      
      if (dateRange.to) {
        const toDate = new Date(dateRange.to)
        toDate.setHours(23, 59, 59, 999)
        query = query.lte('created_at', toDate.toISOString())
      }
      
      // Ordenamiento
      query = query.order(sortField, { ascending: sortDirection === 'asc' })
      
      // Ejecutar la consulta
      const { data, error, count } = await query
      
      if (error) throw error
      
      setOrders((data || []) as unknown as Order[])
      
      // Actualizar el contador total
      if (count !== null) {
        setTotalOrders(count)
      }
      
      // Calcular ingresos totales
      if (data && data.length > 0) {
        const revenue = data.reduce((sum, order: any) => {
          // Solo contar órdenes pagadas o entregadas
          if (['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
            return sum + order.total
          }
          return sum
        }, 0)
        
        setTotalRevenue(revenue)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, dateRange, sortField, sortDirection])

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user, fetchOrders])
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Cambiar dirección si es el mismo campo
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Nuevo campo, establecer dirección predeterminada
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))

      // Create order event
      await (supabase as any)
        .from('order_events')
        .insert({
          order_id: orderId,
          event_type: 'status_change',
          event_data: { 
            old_status: orders.find(o => o.id === orderId)?.status,
            new_status: newStatus 
          }
        })

    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado de la orden')
    }
  }



  const getStatusConfig = (status: string | null) => {
    const normalized = status ?? 'pending'
    return ORDER_STATUSES.find(s => s.value === normalized) || ORDER_STATUSES[0]
  }

  const filteredOrders = orders.filter(order => {
    const fullName = order.profiles ? `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() : ''
    const orderNumber = order.id.slice(-8)
    
    const matchesSearch = 
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  if (authLoading || loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Órdenes</h1>
          <p className="text-muted-foreground">Administra todas las órdenes de tu tienda</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchOrders}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de órdenes</CardDescription>
            <CardTitle className="text-2xl">{totalOrders}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {orders.filter(o => o.status === 'pending').length} pendientes
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ingresos totales</CardDescription>
            <CardTitle className="text-2xl">{formatPrice(totalRevenue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              De órdenes pagadas y procesadas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ticket promedio</CardDescription>
            <CardTitle className="text-2xl">
              {orders.filter(o => o.status && ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).length > 0 
                ? formatPrice(
                    totalRevenue /
                    orders.filter(o => o.status && ['paid', 'processing', 'shipped', 'delivered'].includes(o.status)).length
                  )
                : '$0'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Basado en órdenes completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por número de orden, email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as OrderStatus | 'all')}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center">
                        <status.icon className="h-4 w-4 mr-2" />
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy')
                      )
                    ) : (
                      "Seleccionar fechas"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={setDateRange as any}
                    numberOfMonths={2}
                    locale={es}
                  />
                  <div className="p-3 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setDateRange({ from: undefined, to: undefined })}
                    >
                      Limpiar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="w-full sm:w-auto">
              <Button variant="outline" size="icon" className="ml-auto">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center">
                      Número
                      {sortField === 'id' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Estado
                      {sortField === 'status' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('total')}
                  >
                    <div className="flex items-center">
                      Total
                      {sortField === 'total' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Fecha
                      {sortField === 'created_at' && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Seguimiento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Filas de carga
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={7}>
                        <div className="h-10 bg-muted animate-pulse rounded"></div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No se encontraron órdenes</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    const StatusIcon = statusConfig.icon
                    
                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Link href={`/admin/ordenes/${order.id}`} className="hover:underline">
                            #{order.id.slice(-8)}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.profiles ? 
                                `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`.trim() || 'Sin nombre'
                                : 'Sin nombre'
                              }
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.profiles?.email || order.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap">
                            {order.created_at ? format(new Date(order.created_at), 'dd/MM/yyyy') : '-'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {order.created_at ? format(new Date(order.created_at), 'HH:mm') : '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.tracking_number ? (
                            <div>
                              <Badge variant="outline">
                                {order.tracking_number}
                              </Badge>
                              <a 
                                href={`https://www.correoargentino.com.ar/formularios/e-commerce`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline block mt-1"
                              >
                                  Ver seguimiento
                                </a>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Sin código</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Link href={`/admin/ordenes/${order.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            
                            <Select
                              value={order.status || undefined}
                              onValueChange={(value) => updateOrderStatus(order.id, value as OrderStatus)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ORDER_STATUSES.map((status) => (
                                  <SelectItem key={status.value} value={status.value}>
                                    <div className="flex items-center">
                                      <status.icon className="h-4 w-4 mr-2" />
                                      {status.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}