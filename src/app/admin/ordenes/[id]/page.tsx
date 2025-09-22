'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Save
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'

interface OrderDetail {
  id: string
  order_number: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  discount_amount: number
  created_at: string
  shipping_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  tracking_code: string | null
  payment_method: string
  payment_status: string
  profiles: {
    email: string
    full_name: string | null
    phone: string | null
  } | null
  order_items: Array<{
    id: string
    quantity: number
    price: number
    product_variants: {
      size: string
      color: string
      sku: string
      products: {
        name: string
        image_url: string | null
      }
    }
  }>
  order_events: Array<{
    id: string
    event_type: string
    event_data: Record<string, unknown>
    created_at: string
  }>
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'paid', label: 'Pagado' },
  { value: 'processing', label: 'Procesando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
]

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [trackingCode, setTrackingCode] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name,
            phone
          ),
          order_items (
            id,
            quantity,
            price,
            product_variants (
              size,
              color,
              sku,
              products (
                name,
                image_url
              )
            )
          ),
          order_events (
            id,
            event_type,
            event_data,
            created_at
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      setOrder(data)
      setTrackingCode((data as any).tracking_code || '')
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (user) {
      fetchOrder()
    }
  }, [user, params.id, fetchOrder])

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return

    setIsUpdating(true)
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) throw error

      // Create order event
      await (supabase as any)
        .from('order_events')
        .insert({
          order_id: order.id,
          event_type: 'status_change',
          event_data: { 
            old_status: order.status,
            new_status: newStatus 
          }
        })

      setOrder(prev => prev ? { ...prev, status: newStatus } : null)
      await fetchOrder() // Refresh to get new events
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Error al actualizar el estado de la orden')
    } finally {
      setIsUpdating(false)
    }
  }

  const updateTrackingCode = async () => {
    if (!order) return

    setIsUpdating(true)
    try {
      const supabase = createClient()
      
      const { error } = await (supabase as any)
        .from('orders')
        .update({ tracking_code: trackingCode })
        .eq('id', order.id)

      if (error) throw error

      // Create order event
      await (supabase as any)
        .from('order_events')
        .insert({
          order_id: order.id,
          event_type: 'tracking_added',
          event_data: { tracking_code: trackingCode }
        })

      setOrder(prev => prev ? { ...prev, tracking_code: trackingCode } : null)
      await fetchOrder() // Refresh to get new events
    } catch (error) {
      console.error('Error updating tracking code:', error)
      alert('Error al actualizar el código de seguimiento')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const formatEventType = (eventType: string) => {
    const types = {
      status_change: 'Cambio de estado',
      tracking_added: 'Código de seguimiento agregado',
      payment_received: 'Pago recibido',
      order_created: 'Orden creada',
    }
    return types[eventType as keyof typeof types] || eventType
  }

  if (authLoading || loading) {
    return (
      <div className="py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso restringido</h1>
        <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Orden no encontrada</h1>
        <p className="text-gray-600">La orden que buscas no existe.</p>
        <Link href="/admin/ordenes">
          <Button className="mt-4">Volver a órdenes</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/ordenes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Orden #{order.order_number}</h1>
          <p className="text-gray-600">
            Creada el {new Date(order.created_at).toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Estado de la Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(order.status)}>
                  {ORDER_STATUSES.find(s => s.value === order.status)?.label}
                </Badge>
                <Select
                  value={order.status}
                  onValueChange={updateOrderStatus}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="tracking">Código de Seguimiento</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Ingresa el código de seguimiento"
                  />
                  <Button 
                    onClick={updateTrackingCode}
                    disabled={isUpdating}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
                {order.tracking_code && (
                  <p className="text-sm text-gray-600">
                    Código actual: <strong>{order.tracking_code}</strong>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product_variants.products.image_url ? (
                        <Image
                          src={item.product_variants.products.image_url}
                          alt={item.product_variants.products.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product_variants.products.name}</h4>
                      <p className="text-sm text-gray-600">
                        Talle {item.product_variants.size} • {item.product_variants.color}
                      </p>
                      <p className="text-sm text-gray-600">SKU: {item.product_variants.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Cantidad: {item.quantity}</p>
                      <p className="text-sm text-gray-600">
                        ${(item.price / 100).toFixed(2)} c/u
                      </p>
                      <p className="font-medium">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{order.profiles?.full_name || 'Sin nombre'}</p>
                <p className="text-sm text-gray-600">{order.profiles?.email}</p>
                {order.profiles?.phone && (
                  <p className="text-sm text-gray-600">{order.profiles.phone}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Dirección de Envío
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.shipping_address ? (
                <div className="text-sm space-y-1">
                  <p>{order.shipping_address.street}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                  <p>{order.shipping_address.postal_code}</p>
                  <p>{order.shipping_address.country}</p>
                </div>
              ) : (
                <p className="text-gray-500">No hay dirección de envío</p>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Resumen de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${(order.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>${(order.shipping_cost / 100).toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento:</span>
                  <span>-${(order.discount_amount / 100).toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${(order.total / 100).toFixed(2)}</span>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-sm text-gray-600">
                  Método: {order.payment_method}
                </p>
                <p className="text-sm text-gray-600">
                  Estado: {order.payment_status}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Historial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.order_events
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((event) => (
                    <div key={event.id} className="text-sm">
                      <p className="font-medium">{formatEventType(event.event_type)}</p>
                      <p className="text-gray-600">
                        {new Date(event.created_at).toLocaleString('es-AR')}
                      </p>
                      {event.event_data && (
                        <p className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(event.event_data)}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}