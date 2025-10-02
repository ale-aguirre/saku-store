'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Package, Truck, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { formatPrice } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product_name: string
  variant_size: string
  variant_color: string
  sku: string
}

interface Order {
  id: string
  status: string | null
  total: number
  shipping_cost: number
  shipping_address: any
  billing_address: any | null
  created_at: string | null
  tracking_number?: string | null
  email: string
  user_id: string | null
  subtotal: number
  discount_amount: number | null
  coupon_code: string | null
  payment_id: string | null
  payment_method: string | null
  notes: string | null
  updated_at: string | null
  order_items: OrderItem[]
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  paid: {
    label: 'Pagado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  processing: {
    label: 'Preparando',
    color: 'bg-blue-100 text-blue-800',
    icon: Package
  },
  shipped: {
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
}

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return
    
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          quantity,
          price,
          product_name,
          variant_size,
          variant_color,
          sku
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

      if (error) throw error

      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && user) {
      fetchOrders()
    }
  }, [user, loading, fetchOrders])

  if (loading || isLoading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso requerido</h1>
        <p className="text-gray-600 mb-6">Debes iniciar sesión para ver tus pedidos.</p>
        <Button asChild>
          <Link href="/auth/login">Iniciar sesión</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Mis Pedidos</h1>
        <p className="text-gray-600">Revisa el estado de tus compras</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes pedidos aún</h3>
            <p className="text-gray-600 mb-6">¡Explora nuestros productos y realiza tu primera compra!</p>
            <Button asChild>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending
            const StatusIcon = status.icon

            return (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{order.id}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {new Date(order.created_at || new Date()).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Items del pedido */}
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">
                              Talle {item.variant_size} • {item.variant_color}
                            </p>
                            <p className="text-sm text-gray-600">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Información de envío */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Dirección de envío</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.shipping_address.street}</p>
                          <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                          <p>CP: {order.shipping_address.postal_code}</p>
                          <p>{order.shipping_address.country}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Método de envío</h4>
                        <p className="text-sm text-gray-600 capitalize">
                          Envío Nacional
                        </p>
                        {order.tracking_number && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Código de seguimiento:</p>
                            <p className="text-sm text-blue-600">{order.tracking_number}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Total */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Subtotal: {formatPrice(order.total - order.shipping_cost)}</p>
                        <p>Envío: {formatPrice(order.shipping_cost)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          Total: {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}